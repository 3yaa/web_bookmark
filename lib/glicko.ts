// converts rating into probability space -- gives a sense for how much a score is worth
const Q = Math.log(10) / 400;

// g(φ) = 1 / √(1 + 3q²φ² / π²)
// computes reliability of an item's through its phi
// output: how reliable is this item with this phi
const getReliabilityProb = (phi: number) => {
  return (
    1 /
    Math.sqrt(
      1 + (3 * Math.pow(Q, 2) * Math.pow(phi, 2)) / Math.pow(Math.PI, 2),
    )
  );
};

// E(μ_A, μ_B, φ_B) = 1 / (1 + 10^(-g(φ_B) × (μ_A - μ_B) / 400))
// A is comparing against B and
// output: how likely A is to win agianst B
const getExpectedOutputProb = (
  muA: number,
  muB: number,
  reliability: number,
) => {
  const inner = (-reliability * (muA - muB)) / 400;
  return 1 / (1 + Math.pow(10, inner));
};

// d² = 1 / (q² × g(φ_opponent)² × E × (1 - E))
// output: how much information did we gain -> how much to lower phi
const getInformationWeightProb = (expectedOut: number, reliability: number) => {
  return (
    1 /
    (Math.pow(Q, 2) *
      Math.pow(reliability, 2) *
      expectedOut *
      (1 - expectedOut))
  );
};

// φ_new = 1 / √(1/φ_old² + 1/d²)
const newConfidence = (phi: number, infoWeight: number) => {
  const inner = 1 / Math.pow(phi, 2) + 1 / infoWeight;
  return 1 / Math.sqrt(inner);
};

// μ_new = μ_old + q × φ_new² × g(φ_opponent) × (s - E)
const newRating = (
  winnerMu: number,
  newConfidence: number,
  reliability: number,
  expectedOut: number,
  outcome: number,
) => {
  return (
    winnerMu +
    Q * Math.pow(newConfidence, 2) * reliability * (outcome - expectedOut)
  );
};

function updateItemRating(
  self: { mu: number; phi: number },
  opponent: { mu: number; phi: number },
  outcome: number, // 1 = win, 0 = loss, 0.5 = draw
): { mu: number; phi: number } {
  const reliability = getReliabilityProb(opponent.phi);
  const expectedOut = getExpectedOutputProb(self.mu, opponent.mu, reliability);
  const infoWeight = getInformationWeightProb(expectedOut, reliability);
  const phi = newConfidence(self.phi, infoWeight);
  const mu = newRating(self.mu, phi, reliability, expectedOut, outcome);
  return { mu, phi };
}

export function updateRatings(
  winner: { mu: number; phi: number },
  loser: { mu: number; phi: number },
) {
  return [
    updateItemRating(winner, loser, 1),
    updateItemRating(loser, winner, 0),
  ];
}

export function updateRatingsDraw(
  a: { mu: number; phi: number },
  b: { mu: number; phi: number },
) {
  return [updateItemRating(a, b, 0.5), updateItemRating(b, a, 0.5)];
}
