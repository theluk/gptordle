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

type GameInfoModel = {
  title: string;
  message: string;
};

const converter = {
  toFirestore(game: GameInfoModel): DocumentData {
    return {
      title: game.title,
      message: game.message,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): GameInfoModel {
    const data = snapshot.data(options);
    return {
      title: data.title,
      message: data.message,
    };
  },
};

export const getGameId = (day = new Date()) => {
  return day.toISOString().split("T")[0];
};

export const useTodayGameInfo = () => {
  const snap = useDocumentDataOnce(
    doc(firestore, "gameInfo", getGameId()).withConverter(converter)
  );

  return snap;
};
