import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { runWith } from "firebase-functions/v1";
import { docExists } from "./docExists";
import { embed } from "./embed";

export type Game = {
  secret: string;
  description: string;
  embedding?: number[];
};

const converter = {
  toFirestore(game: Game): DocumentData {
    return {
      secret: game.secret,
      description: game.description,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Game {
    const data = snapshot.data();
    return {
      secret: data.secret,
      description: data.description,
    };
  },
};

export const onGameChange = runWith({
  secrets: ["OPENAI_KEY"],
})
  .firestore.document("games/{date}")
  .onWrite(async (change, context) => {
    const { before, after } = change;
    const beforeData = docExists(before)
      ? converter.fromFirestore(before)
      : null;
    const afterData = docExists(after) ? converter.fromFirestore(after) : null;

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
  });
