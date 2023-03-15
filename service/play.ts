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
};

export type PlayModel = {
  chat: PlayMessage[];
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
      chat: data.chat,
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
