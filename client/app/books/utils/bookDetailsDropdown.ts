// STATUS

export const statusOptions = [
  {
    value: "Want to Read",
    label: "Want to Read",
    className: "text-blue-500",
  },
  { value: "Completed", label: "Completed", className: "text-green-600" },
  {
    value: "Dropped",
    label: "Dropped",
    className: "text-red-500",
  },
];

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
