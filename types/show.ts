import { BaseMediaProps, SortState } from "./media";

export type ShowSortConfig = SortState<
  "title" | "score" | "dateCompleted" | "studio" | "dateReleased"
>;

export interface ShowProps extends BaseMediaProps {
  status: "Completed" | "Want to Watch" | "Dropped" | "Watching";
  tmdbId: string;
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
}

export interface TMDBSeasonProps {
  season_number: number;
  episode_count: number;
}
