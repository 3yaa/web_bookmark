import { TMDBSeasonProps } from "@/types/show";

const calcCurPosition = (
  seasons: TMDBSeasonProps[],
  curSeasonIndex: number, //0 index
  curEp: number
) => {
  let totalEp = 0;
  for (let i: number = 0; i < curSeasonIndex; i++) {
    totalEp += seasons[i].episode_count;
  }
  totalEp += curEp;
  return totalEp;
};

const calcMaxPosition = (seasons: TMDBSeasonProps[]) => {
  let totalEp = 0;
  seasons.forEach((num) => (totalEp += num.episode_count));
  return totalEp;
};

export const calcCurProgress = (
  seasons: TMDBSeasonProps[],
  curSeasonIndex: number, //0 index
  curEp: number
) => {
  if (curSeasonIndex === 0 && curEp === 1) {
    return 0;
  }
  return (
    (calcCurPosition(seasons, curSeasonIndex, curEp) /
      calcMaxPosition(seasons)) *
    100
  );
};
