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
  candidates: ItemScore[];
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
    candidates,
    comparedId: [],
    results: [],
    round: 0,
    done: candidates.length === 0,
  };
};

export const getNextOpponent = (session: BattleSession): ItemScore | null => {
  if (session.done) return null;
  return pickOpponent(
    session.selectedItem,
    session.candidates,
    session.comparedId,
  );
};

export const recordResult = (
  session: BattleSession,
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
    const next = pickOpponent(
      session.selectedItem,
      session.candidates,
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
