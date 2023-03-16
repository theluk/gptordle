// anyone reading this, please don't blame me I have no idea what I am doing here,
// so I just try things I heard somewhere and see if the values do what I think I want.

export function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function euclideanDistance(a: number[], b: number[]) {
  return Math.sqrt(
    a.reduce((sum, _, i) => sum + (a[i] - b[i]) * (a[i] - b[i]), 0)
  );
}

export function manhattanDistance(a: number[], b: number[]) {
  return a.reduce((sum, _, i) => sum + Math.abs(a[i] - b[i]), 0);
}

export function minkowskiDistance(a: number[], b: number[], p: number) {
  return Math.pow(
    a.reduce((sum, _, i) => sum + Math.pow(Math.abs(a[i] - b[i]), p), 0),
    1 / p
  );
}

export function normalizedEuclideanDistance(a: number[], b: number[]) {
  return 1 - euclideanDistance(a, b);
}

// Not sure what the hell has ridden me to do this, but it works
// I think I will never understand why distances are very concentrated around a certain values.
export function normalizeDistanceHack(distance: number) {
  if (distance <= 0.25) {
    return (distance / 0.25) * 0.2;
  } else if (distance <= 0.3) {
    return 0.2 + ((distance - 0.25) / 0.05) * 0.3;
  } else {
    return 0.5 + ((distance - 0.3) / 0.2) * 0.5;
  }
}

/**
 * Normalize a vector to have unit magnitude.
 */
export function normalize(v: number[]) {
  const magnitude = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  return v.map((x) => x / magnitude);
}

export function cosineSimilarityNormalized(a: number[], b: number[]) {
  return cosineSimilarity(normalize(a), normalize(b));
}

export function normilizeDistance(a: number[], b: number[]) {
  return 1 - cosineSimilarityNormalized(a, b);
}

export function reverseNormilizeDistance(a: number[], b: number[]) {
  return 1 - normilizeDistance(a, b);
}
