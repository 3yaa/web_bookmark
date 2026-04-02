export interface Score {
  mu: number;
  phi: number;
}

export const TIERS = [
  "Masterpiece",
  "Amazing", //8-10 | 4-5
  "Good", //6-8  | 3-4
  "Average", //4-6  | 2-4
  "Bad", //2-4  | 1-2
  "Abysmal", //1-2  | 0.5-1
] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_THRESHOLDS: Record<
  Tier,
  { min: number; muMin: number; muMax: number; seed: number }
> = {
  Masterpiece: { min: 10, muMin: 2000, muMax: Infinity, seed: 2000 },
  Amazing: { min: 8.0, muMin: 1600, muMax: 2000, seed: 1800 },
  Good: { min: 6.0, muMin: 1200, muMax: 1600, seed: 1400 },
  Average: { min: 4.0, muMin: 800, muMax: 1200, seed: 1000 },
  Bad: { min: 2.0, muMin: 400, muMax: 800, seed: 600 },
  Abysmal: { min: 1.0, muMin: 200, muMax: 400, seed: 300 },
};

export const DEFAULT_PHI = 200;
export const MASTERPIECE_PHI = 60;

export const getTierFromMu = (mu: number): Tier => {
  for (const [name, tier] of Object.entries(TIER_THRESHOLDS)) {
    if (mu >= tier.muMin) return name as Tier;
  }
  return "Abysmal";
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
  return Math.min(10, Math.max(1, Math.round((mu / 200) * 10) / 10));
};

export const getRatingNormal = (
  rating: { mu: number; phi: number },
  k: number = 1,
): number => {
  return rating.mu - k * rating.phi;
};
