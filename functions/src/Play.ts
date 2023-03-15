import { ChatCompletionRequestMessage } from "openai";
import * as functions from "firebase-functions";

import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { docExists } from "./docExists";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { firestore } from "firebase-admin";
import { ai } from "./ai";
import { withRetries } from "./withRetry";
import { gamePrompt } from "./prompt";

export type PlayMessage = {
  role: ChatCompletionRequestMessage["role"];
  state: "loading" | "success" | "error";
  content: ChatCompletionRequestMessage["content"];
  errorMessage: string | null;
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

  const { secret, description } = gameDef.data() as {
    secret: string;
    description: string;
  };

  const lengthChanged = beforeData?.chat.length !== afterData.chat.length;
  const lastMessageIsFromUser =
    afterData.chat[afterData.chat.length - 1].role === "user";

  console.log({
    lengthChanged,
    lastMessageIsFromUser,
  });

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

    const conversation = afterData.chat.slice(0, 2).map((message) => {
      const chatMessage: ChatCompletionRequestMessage = {
        content: message.content,
        role: message.role,
      };

      return chatMessage;
    });

    const complete = withRetries({
      attempt: () =>
        ai.createChatCompletion({
          messages: [
            {
              content: gamePrompt(secret, description),
              role: "system",
            },
            ...conversation,
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 50,
          temperature: 0.9,
        }),
      maxRetries: 3,
    });

    const response = await complete();

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

    message.content = content;
    message.state = "success";

    after.ref.update({
      chat: [...afterData.chat, message],
    });
  }
};
