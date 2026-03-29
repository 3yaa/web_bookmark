export interface Score {
  mu: number;
  phi: number;
}

export const TIERS = [
  "Masterpiece",
  "Amazing",
  "Good",
  "Average",
  "Disappointing",
  "Bad",
  "Abysmal",
] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_THRESHOLDS: Record<
  Tier,
  { min: number; muMin: number; muMax: number; seed: number }
> = {
  Masterpiece: { min: 9.5, muMin: 1900, muMax: Infinity, seed: 2000 },
  Amazing: { min: 8.0, muMin: 1600, muMax: 1900, seed: 1750 },
  Good: { min: 6.5, muMin: 1300, muMax: 1600, seed: 1450 },
  Average: { min: 5.0, muMin: 1000, muMax: 1300, seed: 1150 },
  Disappointing: { min: 3.0, muMin: 600, muMax: 1000, seed: 800 },
  Bad: { min: 1.0, muMin: 200, muMax: 600, seed: 400 },
  Abysmal: { min: 0.0, muMin: 0, muMax: 200, seed: 100 },
};

export const DEFAULT_PHI = 200;

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
export const getTierAdjacentRange = (
  tier: Tier,
): { min: number; max: number } => {
  const i = TIERS.indexOf(tier);
  const current = TIER_THRESHOLDS[TIERS[i]];
  const above = i > 0 ? TIER_THRESHOLDS[TIERS[i - 1]] : null;
  const below = i < TIERS.length - 1 ? TIER_THRESHOLDS[TIERS[i + 1]] : null;

  return {
    min: below ? below.seed : current.muMin,
    max: above ? above.seed : current.muMax,
  };
};

export const getDisplayScore = (mu: number): number => {
  return Math.min(10, Math.max(0, Math.round((mu / 200) * 10) / 10));
};

export const getRatingNormal = (
  rating: { mu: number; phi: number },
  k: number = 1,
): number => {
  return rating.mu - k * rating.phi;
};
