import { IGDBInitProps } from "./game";
import { TMDBSeasonProps } from "./show";

export type MediaStatus =
  | "Completed"
  | "Want to Read"
  | "Playing"
  | "Watching"
  | "Want to Watch"
  | "Dropped";

export type SortState<K extends string> = { type: K; order: "asc" | "desc" };

export interface BaseMediaProps {
  id: number;
  title: string;
  score?: number;
  status: MediaStatus;
  dateCompleted?: Date | null;
  note?: string;
  posterUrl?: string;
  coverUrl?: string;
  backdropUrl?: string;
  // series (book/movie)
  seriesTitle?: string;
  placeInSeries?: string;
  prequel?: string;
  sequel?: string;
  // game only
  mainTitle?: string;
  dlcs?: IGDBInitProps[];
  dlcIndex?: number;
  // show only
  seasons?: TMDBSeasonProps[];
  curSeasonIndex?: number;
  curEpisode?: number;
}
