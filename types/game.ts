import { BaseMediaProps, SortState } from "./media";

export type GameSortConfig = SortState<
  "title" | "score" | "dateCompleted" | "studio" | "dateReleased"
>;

export interface GameProps extends BaseMediaProps {
  status: "Playing" | "Completed" | "Dropped";
  igdbId: number;
  studio?: string;
  dateReleased?: number;
  dlcIndex: number;
  mainTitle?: string;
  dlcs?: IGDBInitProps[];
}

export interface IGDBInitProps {
  id?: number;
  name?: string;
}

export interface IGDBProps {
  igdbId: number;
  title: string;
  released_year?: number;
  cover_url?: string;
  developer?: { name: string }[];
  expansions?: IGDBInitProps[];
  screenshot_urls?: { ss_url: string }[];
}

export interface IGDBDlcProps {
  igdbId: number;
  title: string;
  released_year?: number;
  cover_url?: string;
  developer?: { name: string }[];
  screenshot_urls?: { ss_url: string }[];
}
