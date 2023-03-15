import { runWith } from "firebase-functions/v1";
import { handlePlayChange } from "./Play";

export const onPlayChange = runWith({
  secrets: ["OPENAI_KEY"],
})
  .firestore.document("games/{date}/plays/{userId}")
  .onWrite(async (change, context) => {
    return handlePlayChange(change);
  });
