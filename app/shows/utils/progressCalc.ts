import { TMDBSeasonProps } from "@/types/show";

export const calcCurProgress = (
  seasons: TMDBSeasonProps[],
  curSeasonIndex: number,
  curEp: number
) => {
  if (curSeasonIndex === 0 && curEp === 1) return 0;

  let completedEps = 0;
  let totalEps = 0;

  for (let i = 0; i < seasons.length; i++) {
    totalEps += seasons[i].episode_count;
    if (i < curSeasonIndex) {
      completedEps += seasons[i].episode_count;
    }
  }
  completedEps += curEp;

  return (completedEps / totalEps) * 100;
};
