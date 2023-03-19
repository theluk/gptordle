import {
  DocumentData,
  FieldValue,
  getFirestore,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { runWith } from "firebase-functions/v1";
import { docExists } from "./docExists";
import { embed } from "./embed";

export type Game = {
  secret: string;
  description: string;
  embedding?: number[];
  pentagon: {
    label: string;
    embedding: number[];
  }[];
};

export type GameInfoModel = {
  title: string;
  message: string;
  stats?: {
    plays: number;
    correct: number;
    avarageTurns: number;
    minTurns: number;
    maxTurns: number;
  };
};

export const gameInfoConverter = {
  toFirestore(game: GameInfoModel): DocumentData {
    return {
      title: game.title,
      message: game.message,
      stats: {
        plays: 0,
        correct: 0,
        avarageTurns: 0,
        minTurns: 0,
        maxTurns: 0,
        ...game.stats,
      },
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): GameInfoModel {
    const data = snapshot.data();
    return {
      title: data.title,
      message: data.message,
      stats: {
        plays: data.stats?.plays || 0,
        correct: data.stats?.correct || 0,
        avarageTurns: data.stats?.avarageTurns || 0,
        minTurns: data.stats?.minTurns || 0,
        maxTurns: data.stats?.maxTurns || 0,
      },
    };
  },
};

export const gameConverter = {
  toFirestore(game: Game): DocumentData {
    return {
      secret: game.secret,
      description: game.description,
      embedding: game.embedding,
      pentagon: game.pentagon || [],
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Game {
    const data = snapshot.data();
    return {
      secret: data.secret,
      description: data.description,
      embedding: data.embedding,
      pentagon: data.pentagon || [],
    };
  },
};

function updateAverage(
  oldAverage: number,
  numberOfElements: number,
  newNumber: number
): number {
  const newNumberOfElements = numberOfElements + 1;
  const newAverage =
    (oldAverage * numberOfElements + newNumber) / newNumberOfElements;
  return newAverage;
}

export const handleGameStart = async (day: string) => {
  const gameInfo = await getFirestore()
    .doc(`gameInfo/${day}`)
    .withConverter(gameInfoConverter)
    .get();

  if (!docExists(gameInfo)) {
    return;
  }

  return gameInfo.ref.update({
    stats: {
      plays: FieldValue.increment(1),
    },
  });
};

export const handleGameSuccess = async (day: string, numTurns: number) => {
  const gameInfo = await getFirestore()
    .doc(`gameInfo/${day}`)
    .withConverter(gameInfoConverter)
    .get();

  const {
    stats: { plays = 0, minTurns = 0, maxTurns = 0, avarageTurns = 0 } = {},
  } = gameInfo.data() || {};

  const newAvarageTurns = updateAverage(avarageTurns, plays, numTurns);

  const newMinTurns = minTurns ? Math.min(minTurns, numTurns) : numTurns;
  const newMaxTurns = maxTurns ? Math.max(maxTurns, numTurns) : numTurns;

  return gameInfo.ref.update({
    stats: {
      plays: FieldValue.increment(1),
      correct: FieldValue.increment(1),
      avarageTurns: newAvarageTurns,
      minTurns: newMinTurns,
      maxTurns: newMaxTurns,
    },
  });
};

export const onGameChange = runWith({
  secrets: ["OPENAI_KEY"],
})
  .firestore.document("games/{date}")
  .onWrite(async (change, context) => {
    const { before, after } = change;
    const beforeData = docExists(before)
      ? gameConverter.fromFirestore(before)
      : null;
    const afterData = docExists(after)
      ? gameConverter.fromFirestore(after)
      : null;

    if (!afterData) {
      return;
    }

    const secretOrDescriptionChanged =
      beforeData?.secret !== afterData.secret ||
      beforeData?.description !== afterData.description;

    if (secretOrDescriptionChanged) {
      await embed(afterData.secret + afterData.description).then(
        (embedding) => {
          after.ref.update({
            embedding: embedding.data.data[0].embedding,
          });
        }
      );
    }

    const beforePentagonLabels = beforeData?.pentagon.map((p) => p.label) || [];
    const afterPentagonLabels = afterData?.pentagon.map((p) => p.label) || [];

    const pentagonLabelsChanged =
      beforePentagonLabels.length !== afterPentagonLabels.length ||
      beforePentagonLabels.some((label, i) => label !== afterPentagonLabels[i]);

    if (pentagonLabelsChanged) {
      console.log(afterPentagonLabels);

      const pentagonEmbeddings = await embed(afterPentagonLabels).catch((e) => {
        console.error(e.message);
        throw e.message;
      });
      const embeddings = pentagonEmbeddings.data.data
        .sort((a, b) => a.index - b.index)
        .map((a) => a.embedding);

      if (embeddings.length === afterPentagonLabels.length) {
        after.ref.update({
          pentagon: afterPentagonLabels.map((label, i) => ({
            label,
            embedding: embeddings[i],
          })),
        });
      }
    }
  });
