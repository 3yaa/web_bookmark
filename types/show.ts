import { BaseMediaProps, ColumnConfig, SortState } from "./media";

export type ShowSortConfig = SortState<
  "title" | "score" | "dateCompleted" | "studio" | "dateReleased"
>;

export const DIFF_COLUMNS_SHOW: [
  ColumnConfig<ShowProps>,
  ColumnConfig<ShowProps>,
] = [
  { label: "Studio", sortKey: "studio", getValue: (s) => s.studio },
  {
    label: "Released",
    sortKey: "dateReleased",
    getValue: (s) => s.dateReleased,
  },
];

export interface ShowProps extends BaseMediaProps {
  status: "Completed" | "Want to Watch" | "Dropped" | "Watching";
  tmdbId: string;
  imdbId?: string;
  studio?: string;
  dateReleased?: number;
  seasons?: TMDBSeasonProps[];
  curSeasonIndex: number;
  curEpisode: number;
}

export interface TMDBProps {
  tmdbId: string;
  title: string;
  poster_url?: string;
  backdrop_url?: string;
  released_date?: string;
}

export interface TMDBTvProps {
  seasons?: TMDBSeasonProps[];
  studio?: string;
  imdbId?: string | null;
}

export interface TMDBSeasonProps {
  season_number: number;
  episode_count: number;
}

//
export type HollowShowProps = {
  tmdbId: string;
  imdbId: string;
  title: string;
  imdbRating: number | null;
  poster_url: string | null;
  //
  currentEp: number | null;
  totalEp: number | null;
  // 
  airDays: string | null;
  first_air_date: string;
};
