import { ai } from "./ai";
import { withRetries } from "./withRetry";

export const embed = withRetries({
  attempt: (input: string | string[]) =>
    ai.createEmbedding({
      input,
      model: "text-embedding-ada-002",
    }),
  maxRetries: 3,
});
