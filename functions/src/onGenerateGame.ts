import { getFirestore } from "firebase-admin/firestore";
import { runWith } from "firebase-functions/v1";
import { ai } from "./ai";
import { gameConverter, gameInfoConverter } from "./onGameChange";
import { generateGame } from "./prompt";
import { withRetries } from "./withRetry";

export const onGenerateName = runWith({
  secrets: ["OPENAI_KEY"],
  timeoutSeconds: 540,
  // schedule: every day at 0am, 1am, 2am and 3am,
  // timezone UTC
})
  .pubsub.schedule("0 0,1,2,3 * * *")
  .timeZone("UTC")
  .onRun(async () => {
    await generate();
  });

// export const triggerNewGameGeneration = runWith({
//   secrets: ["OPENAI_KEY"],
//   timeoutSeconds: 540,
// }).https.onCall(async () => {
//   await generate();
// });

const generate = async () => {
  const allGames = await getFirestore()
    .collection("games")
    .withConverter(gameConverter)
    .select("secret")
    .get();

  const allSecrets = allGames.docs.map((doc) => doc.data().secret);

  const todayStr = new Date().toISOString().split("T")[0];
  // check if game already exists
  const game = await getFirestore()
    .doc(`games/${todayStr}`)
    .withConverter(gameConverter)
    .get();

  if (game.exists) {
    console.log("Game already exists");
    return;
  }

  const result = await completeWithRetry(allSecrets);

  console.log("result", result);

  await getFirestore()
    .doc(`games/${todayStr}`)
    .withConverter(gameConverter)
    .set({
      secret: result.secret,
      description: result.description,
      pentagon: result.milestones.map((milestone) => ({
        label: milestone,
        embedding: [],
      })),
    });

  await getFirestore()
    .doc(`gameInfo/${todayStr}`)
    .withConverter(gameInfoConverter)
    .set({
      title: "",
      message: "",
    });
};

/**
 *
 * Parses the input which is a string of the form:
 *
 * Secret: Mount Everest
 * Description: Mount Everest is the highest mountain in the world, with an elevation of 8,848 meters above sea level. It is located in the Himalayan mountain range and attracts thousands of climbers each year who attempt to reach its summit.
 * Milestones: Noun, Place, Mountain, High altitude, Himalayas
 *
 * to an object of the form:
 * { secret: "Mount Everest", description: "Mount Everest is the highest mountain in the world, with an elevation of 8,848 meters above sea level. It is located in the Himalayan mountain range and attracts thousands of climbers each year who attempt to reach its summit.", milestones: ["Noun", "Place", "Mountain", "High altitude", "Himalayas"] }
 *
 * it must also validate that the keys were correct
 */
function parse(input: string) {
  const lines = input.split("\n");

  const secret = lines[0].split(":")[1].trim();
  const description = lines[1].split(":")[1].trim();
  const milestones = lines[2].split(":")[1].trim().split(",");

  // validate that the data is right
  if (!secret || !description || !milestones) {
    throw new Error("Invalid input");
  }

  // checks we have 5 milestones
  if (milestones.length !== 5) {
    throw new Error("Invalid input");
  }

  return { secret, description, milestones };
}

const completeWithRetry = withRetries({
  attempt: async (exclude: string[]) => {
    const result = await ai.createCompletion({
      prompt: generateGame(exclude),
      model: "text-davinci-003",
      max_tokens: 256,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      temperature: 0.9,
    });

    const text = result.data.choices[0].text?.trim() as string;
    const parsed = parse(text);

    return parsed;
  },
  maxRetries: 5,
});
