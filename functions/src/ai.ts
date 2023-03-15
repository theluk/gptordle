import { Configuration, OpenAIApi } from "openai";

const ai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_KEY,
  })
);

export { ai };
