import {
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

import {
  useDocument,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { firestore } from "./firebase";
import { getGameId } from "./game";
import { useLoggedInUser } from "./user";

export type PlayMessage = {
  role: "user" | "assistant";
  state: "loading" | "success" | "error";
  content: string;
  errorMessage: string | null;
  normalizedDistance?: number;
};

export type PlayModel = {
  isComplete: boolean;
  chat: PlayMessage[];
  pentagon: {
    score: number;
    label: string | null;
  }[];
};

const converter = {
  toFirestore(play: PlayModel): DocumentData {
    return {
      chat: play.chat,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): PlayModel {
    const data = snapshot.data(options);
    return {
      isComplete: data.isComplete || false,
      chat: data.chat,
      pentagon: data.pentagon || [
        {
          score: 0,
        },
        {
          score: 0,
        },
        {
          score: 0,
        },
        {
          score: 0,
        },
        {
          score: 0,
        },
      ],
    };
  },
};

export const usePlay = () => {
  const user = useLoggedInUser();

  const snap = useDocument(
    doc(firestore, "games", getGameId(), "plays", user.uid).withConverter(
      converter
    )
  );

  return snap;
};
