// STATUS

const statusConfig = {
  "Want to Read": {
    textStyle: "text-blue-500",
    bgStyle: "to-blue-500/10",
  },
  "Want to Watch": {
    textStyle: "text-blue-500",
    bgStyle: "to-blue-500/10",
  },
  Watching: {
    textStyle: "text-indigo-500",
    bgStyle: "to-indigo-600/10",
  },
  Playing: {
    textStyle: "text-blue-500/80",
    bgStyle: "to-blue-500/10",
  },
  Completed: {
    textStyle: "text-green-600",
    bgStyle: "to-emerald-500/10",
  },
  Dropped: {
    textStyle: "text-red-500/80",
    bgStyle: "to-red-500/10",
  },
} as const;

const createStatusOptions = <T extends keyof typeof statusConfig>(
  statuses: T[]
) =>
  statuses.map((status) => ({
    value: status,
    label: status,
    ...statusConfig[status],
  }));

// Export status options
export const bookStatusOptions = createStatusOptions([
  "Want to Read",
  "Completed",
  "Dropped",
]);

export const movieStatusOptions = createStatusOptions([
  "Want to Watch",
  "Completed",
  "Dropped",
]);

export const showStatusOptions = createStatusOptions([
  "Watching",
  "Want to Watch",
  "Completed",
  "Dropped",
]);

export const gameStatusOptions = createStatusOptions([
  "Playing",
  "Completed",
  "Dropped",
]);

// SCORE

const getScoreLabel = (score: number): string => {
  if (score >= 11) return "Beyond Cinema";
  if (score >= 10) return "Masterpiece";
  if (score >= 9) return "Amazing";
  if (score >= 8) return "Great";
  if (score >= 7) return "Good";
  if (score >= 6) return "Average";
  if (score >= 5) return "Below Average";
  if (score >= 4) return "Yikes";
  if (score >= 3) return "Bad";
  if (score >= 2) return "Awful";
  if (score >= 1) return "Dog Water";
  return "Select Option";
};

export const scoreOptions = Array.from({ length: 12 }, (_, i) => {
  const scoreValue = i === 0 ? 0 : 12 - i;
  return {
    value: scoreValue.toString(),
    label:
      scoreValue !== 0
        ? `${scoreValue} - ${getScoreLabel(scoreValue)}`
        : `${getScoreLabel(scoreValue)}`,
  };
});
