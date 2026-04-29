export interface Score {
  mu: number;
  phi: number;
}

export const TIERS = [
  "Masterpiece",
  "Exceptional",
  "Amazing",
  "Good",
  "Average",
  "Bad",
  "Disgusting",
] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_THRESHOLDS: Record<
  Tier,
  { min: number; muMin: number; muMax: number; seed: number }
> = {
  Masterpiece: { min: 10.0, muMin: 2000, muMax: Infinity, seed: 2000 },
  Exceptional: { min: 9.1, muMin: 1820, muMax: 2000, seed: 1910 },
  Amazing: { min: 7.8, muMin: 1560, muMax: 1820, seed: 1690 },
  Good: { min: 6.0, muMin: 1200, muMax: 1560, seed: 1380 },
  Average: { min: 4.0, muMin: 800, muMax: 1200, seed: 1000 },
  Bad: { min: 2.0, muMin: 400, muMax: 800, seed: 600 },
  Disgusting: { min: 0.0, muMin: 0, muMax: 400, seed: 200 },
};

export const TIER_PHI_THRESHOLD: Record<Tier, number> = {
  Masterpiece: 1,
  Exceptional: 110,
  Amazing: 159,
  Good: 210,
  Average: 232,
  Bad: 232,
  Disgusting: 232,
};

export const getTierFromMu = (mu: number): Tier => {
  for (const [name, tier] of Object.entries(TIER_THRESHOLDS)) {
    if (mu >= tier.muMin) return name as Tier;
  }
  return "Disgusting";
};

export const getSeedMu = (tier: Tier): number => {
  return TIER_THRESHOLDS[tier].seed;
};

// range include self + half of adj
// export const getTierAdjacentRange = (
//   tier: Tier,
// ): { min: number; max: number } => {
//   const i = TIERS.indexOf(tier);
//   const current = TIER_THRESHOLDS[TIERS[i]];
//   const above = i > 0 ? TIER_THRESHOLDS[TIERS[i - 1]] : null;
//   const below = i < TIERS.length - 1 ? TIER_THRESHOLDS[TIERS[i + 1]] : null;

//   const aboveRange = above ? above.muMax - above.muMin : 0;
//   const belowRange = below ? below.muMax - below.muMin : 0;

//   return {
//     min: current.muMin - belowRange / 2,
//     max: current.muMax + aboveRange / 2,
//   };
// };

// just within own tier
export const getTierAdjacentRange = (
  tier: Tier,
): { min: number; max: number } => {
  const current = TIER_THRESHOLDS[tier];
  return {
    min: current.muMin,
    max: current.muMax,
  };
};

export const getDisplayScore = (mu: number): number => {
  return Math.min(10, Math.max(0, Math.floor((mu / 200) * 10) / 10));
};

export const getRatingNormal = (
  rating: { mu: number; phi: number },
  k: number = 1,
): number => {
  return rating.mu - k * rating.phi;
};
