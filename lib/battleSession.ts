import {
  getCandidates,
  isContradictory,
  ItemScore,
  pickOpponent,
  ResultProps,
} from "./comparison";

const MIN_COMPARISONS = 3;
const MAX_COMPARISONS = 5;

export interface BattleSession {
  selectedItem: ItemScore;
  comparedId: number[];
  results: ResultProps[];
  round: number;
  done: boolean;
}

export const createSession = (
  items: ItemScore[],
  selectedItem: ItemScore,
): BattleSession => {
  const candidates = getCandidates(selectedItem, items);
  return {
    selectedItem,
    comparedId: [],
    results: [],
    round: 0,
    done: candidates.length === 0,
  };
};

export const getNextOpponent = (
  session: BattleSession,
  allItems: ItemScore[],
): ItemScore | null => {
  if (session.done) return null;
  const freshCandidates = getCandidates(session.selectedItem, allItems);
  return pickOpponent(
    session.selectedItem,
    freshCandidates,
    session.comparedId,
  );
};

export const recordResult = (
  session: BattleSession,
  allItems: ItemScore[],
  opponentId: number,
  opponentMu: number,
  won: boolean,
): BattleSession => {
  const newResults = [
    ...session.results,
    { opponentMu, selfMu: session.selectedItem.score.mu, won },
  ];
  const newComparedIds = [...session.comparedId, opponentId];
  const newRound = session.round + 1;

  let done = false;
  if (newRound >= MAX_COMPARISONS) done = true;
  if (!done && newRound >= MIN_COMPARISONS) {
    if (isContradictory(newResults)) done = true;
  }

  if (!done) {
    const freshCandidates = getCandidates(session.selectedItem, allItems);
    const next = pickOpponent(
      session.selectedItem,
      freshCandidates,
      newComparedIds,
    );
    if (!next) done = true;
  }

  return {
    ...session,
    comparedId: newComparedIds,
    results: newResults,
    round: newRound,
    done,
  };
};
