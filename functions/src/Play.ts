import { ChatCompletionRequestMessage } from "openai";
import * as functions from "firebase-functions";

import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { docExists } from "./docExists";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { firestore } from "firebase-admin";
import { ai } from "./ai";
import { withRetries } from "./withRetry";
import { classifyGameState, gamePrompt } from "./prompt";
import { embed } from "./embed";
import {
  normalizedEuclideanDistance,
  normalizeDistanceHack,
} from "./cosineSimilarity";
import {
  Game,
  gameConverter,
  handleGameStart,
  handleGameSuccess,
} from "./onGameChange";

export type PlayMessage = {
  role: ChatCompletionRequestMessage["role"];
  state: "loading" | "success" | "error";
  content: ChatCompletionRequestMessage["content"];
  errorMessage: string | null;
  normalizedDistance?: number;
};

export type PlayModel = {
  chat: PlayMessage[];
  pentagon: {
    score: number;
    label: string | null;
  }[];
  isComplete: boolean;
};

const converter = {
  toFirestore(play: PlayModel) {
    return play;
  },
  fromFirestore(snapshot: DocumentSnapshot): PlayModel {
    if (!docExists(snapshot)) {
      throw new Error("Play not found");
    }
    const data = snapshot.data();
    return {
      chat: data.chat,
      pentagon: data.pentagon || [],
      isComplete: data.isComplete || false,
    } as PlayModel;
  },
};

export async function getPlay(
  userId: string,
  date: Date
): Promise<QueryDocumentSnapshot<PlayModel>> {
  const dateStr = date.toISOString().split("T")[0];

  const play = await getFirestore()
    .doc(`games/${dateStr}/plays/${userId}`)
    .withConverter(converter)
    .get();

  if (!docExists(play)) {
    throw new Error("Play not found");
  }

  return play;
}

function getDayStringFromPlay(play: QueryDocumentSnapshot) {
  const id = play.ref.parent?.parent?.id;
  if (!id) {
    throw new Error("Play not found");
  }

  return id;
}

export const handlePlayChange = async (
  change: functions.Change<functions.firestore.DocumentSnapshot>
) => {
  const before =
    change.before.exists && docExists(change.before) ? change.before : null;
  const after =
    change.after.exists && docExists(change.after) ? change.after : null;

  if (!after) {
    return;
  }

  const beforeData = before ? converter.fromFirestore(before) : null;
  const afterData = converter.fromFirestore(after);

  const dayStr = getDayStringFromPlay(after);

  if (dayStr !== new Date().toISOString().split("T")[0]) {
    return;
  }

  const gameDef = await getFirestore()
    .doc(`games/${dayStr}`)
    .withConverter(gameConverter)
    .get();

  if (!docExists(gameDef)) {
    return;
  }

  if (!before) {
    handleGameStart(dayStr);
  }

  const {
    secret,
    description,
    embedding: secretEmbedding,
  } = gameDef.data() || {};

  const lengthChanged = beforeData?.chat.length !== afterData.chat.length;
  const lastMessageIsFromUser =
    afterData.chat[afterData.chat.length - 1].role === "user";

  const lastMessageIsAssistantCompleted =
    afterData.chat[afterData.chat.length - 1].role === "assistant" &&
    afterData.chat[afterData.chat.length - 1].state === "success" &&
    afterData.isComplete === true &&
    beforeData?.isComplete !== afterData.isComplete;

  if (lastMessageIsAssistantCompleted && docExists(gameDef)) {
    await handleGameSuccess(dayStr, afterData.chat.length);
    return;
  }

  if (lengthChanged && lastMessageIsFromUser) {
    // append a message from the bot
    const message: PlayMessage = {
      content: "",
      state: "loading",
      errorMessage: null,
      role: "assistant",
    };

    after.ref.update({
      chat: firestore.FieldValue.arrayUnion(message),
    });

    const conversation = afterData.chat.map((message) => {
      const chatMessage: ChatCompletionRequestMessage = {
        content: message.content,
        role: message.role,
      };

      return chatMessage;
    });

    const prompt = gamePrompt(secret, description);

    const last10 = conversation.slice(-10);
    const lastMessage = last10[last10.length - 1];

    const complete = withRetries({
      attempt: () =>
        ai.createChatCompletion({
          messages: [
            {
              content: prompt,
              role: "system",
            },
            ...last10,
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 100,
          temperature: 0.5,
        }),
      maxRetries: 3,
    });

    const classifyComplete = withRetries({
      attempt: (chats: PlayMessage[]) => {
        const prompt = classifyGameState(secret, chats);
        console.log("prompt", prompt);
        return ai.createCompletion({
          prompt,
          model: "text-davinci-003",
          max_tokens: 3,
          temperature: 0.5,
        });
      },
      maxRetries: 1,
    });

    const [response, embedding] = await Promise.all([
      complete(),
      embed(lastMessage.content),
    ]);

    message.normalizedDistance =
      secretEmbedding && embedding.data.data[0]?.embedding
        ? normalizeDistanceHack(
            normalizedEuclideanDistance(
              secretEmbedding,
              embedding.data.data[0].embedding
            )
          )
        : 0;

    if (response.status !== 200) {
      message.state = "error";
      message.errorMessage = response.statusText;

      after.ref.update({
        chat: [...afterData.chat, message],
      });
      return;
    }

    const content = response.data.choices[0].message?.content;

    if (!content) {
      message.state = "error";
      message.errorMessage = "No content returned";

      after.ref.update({
        chat: [...afterData.chat, message],
      });
      return;
    }

    let isComplete = parseIsResponseCOMPLETE(content);
    if (isComplete) {
      message.content = "🎉 Congratulations! You have completed the game.";
    } else {
      message.content = content;
      const classifiedResponse = await classifyComplete([
        ...afterData.chat,
        message,
      ]);

      console.log(classifiedResponse.data.choices[0]?.text);

      if (classifiedResponse.data.choices[0]?.text?.match(/yes/i)) {
        console.log("classified as complete");
        isComplete = true;
      }
    }
    message.state = "success";
    after.ref.update({
      isComplete,
      chat: [...afterData.chat, message],
      pentagon: getNextPentagonValues(
        afterData,
        gameDef.data(),
        embedding.data.data[0]?.embedding || []
      ),
    });
  }
};

const parseIsResponseCOMPLETE = (response: string) => {
  // ignore case
  const match = response.match(/complete/i);
  return match ? true : false;
};

export function getNextPentagonValues(
  play: PlayModel,
  game: Game,
  currentUserEmbedding: number[]
) {
  const pentagon = [...play.pentagon] || [];
  for (let i = 0; i < 5; i++) {
    const gameEmbedding = game.pentagon[i].embedding;
    const gameLabel = game.pentagon[i].label;

    const distance = normalizeDistanceHack(
      normalizedEuclideanDistance(gameEmbedding, currentUserEmbedding)
    );
    const current = pentagon[i];
    const newMax = Math.max(current.score || 0, distance);
    const newScore = newMax > 0.85 ? newMax : distance;
    const isSolved = newScore > 0.92;

    pentagon[i] = {
      label: isSolved ? gameLabel : null,
      score: newScore,
    };
  }

  return pentagon;
}
