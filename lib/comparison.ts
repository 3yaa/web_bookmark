import {
  getTierAdjacentRange,
  getTierFromMu,
  Score,
  TIER_THRESHOLDS,
} from "./tierConfig";

export interface ItemScore {
  id: number;
  score: Score;
}

export interface ResultProps {
  selfMu: number;
  opponentMu: number;
  won: boolean;
}

export const isContradictory = (results: ResultProps[]): boolean => {
  const beatAbove = results.some((r) => r.won && r.opponentMu > r.selfMu);
  const lostBelow = results.some((r) => !r.won && r.opponentMu < r.selfMu);

  return !(beatAbove && lostBelow);
};

// should be stale maybe?
export const getCandidates = (
  item: ItemScore,
  items: ItemScore[],
): ItemScore[] => {
  const tier = getTierFromMu(item.score.mu);
  const range = getTierAdjacentRange(tier);

  // first try same tier only
  const sameTier = items.filter(
    (c) =>
      c.id !== item.id &&
      c.score.mu >= TIER_THRESHOLDS[tier].muMin &&
      c.score.mu <= TIER_THRESHOLDS[tier].muMax,
  );

  // if at least 1 same-tier item exists, include adjacent
  if (sameTier.length > 0) {
    return items.filter(
      (c) =>
        c.id !== item.id && c.score.mu >= range.min && c.score.mu <= range.max,
    );
  }

  // no same-tier items — skip comparisons
  return [];
};

export const pickOpponent = (
  item: ItemScore,
  candidates: ItemScore[],
  alrdyComparedIds: number[],
): ItemScore | null => {
  const available = candidates.filter(
    (c) => c.id !== item.id && !alrdyComparedIds.includes(c.id),
  );
  if (available.length === 0) return null;

  // sort by distance
  available.sort(
    (a, b) =>
      Math.abs(a.score.mu - item.score.mu) -
      Math.abs(b.score.mu - item.score.mu),
  );

  // pick randomly from top 3 or less closest
  const poolSize = Math.min(3, available.length);
  const randomIndex = Math.floor(Math.random() * poolSize);
  return available[randomIndex];
};
