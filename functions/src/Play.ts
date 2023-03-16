import { ChatCompletionRequestMessage } from "openai";
import * as functions from "firebase-functions";

import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { docExists } from "./docExists";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { firestore } from "firebase-admin";
import { ai } from "./ai";
import { withRetries } from "./withRetry";
import { gamePrompt } from "./prompt";
import { embed } from "./embed";
import {
  normalizedEuclideanDistance,
  normalizeDistanceHack,
} from "./cosineSimilarity";
import { Game } from "./onGameChange";

export type PlayMessage = {
  role: ChatCompletionRequestMessage["role"];
  state: "loading" | "success" | "error";
  content: ChatCompletionRequestMessage["content"];
  errorMessage: string | null;
  normalizedDistance?: number;
};

export type PlayModel = {
  chat: PlayMessage[];
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
    return data as PlayModel;
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

  const gameDef = await getFirestore().doc(`games/${dayStr}`).get();

  if (!gameDef.exists) {
    return;
  }

  const {
    secret,
    description,
    embedding: secretEmbedding,
  } = gameDef.data() as Game;

  const lengthChanged = beforeData?.chat.length !== afterData.chat.length;
  const lastMessageIsFromUser =
    afterData.chat[afterData.chat.length - 1].role === "user";

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

    console.log(content);

    let isComplete = parseIsResponseCOMPLETE(content);
    if (isComplete) {
      message.content = "🎉 Congratulations! You have completed the game.";
    } else {
      message.content = content;
    }
    message.state = "success";

    after.ref.update({
      isComplete,
      chat: [...afterData.chat, message],
    });
  }
};

const parseIsResponseCOMPLETE = (response: string) => {
  const match = response.match(/COMPLETE/);
  return match ? true : false;
};
