export type SortConfig = {
  type: "title" | "score" | "dateCompleted" | "studio" | "dateReleased";
  order: "asc" | "desc";
};

export interface ShowProps {
  id: number; //--REQUIRED -> will do on server side
  // user set
  score?: number;
  dateCompleted?: Date | null;
  note?: string;
  status: "Completed" | "Want to Watch" | "Dropped"; //!--REQUIRED
  // from tmdb
  tmdbId: string; //!--REQUIRED
  title: string; //!--REQUIRED
  studio?: string;
  dateReleased?: number;
  posterUrl?: string;
  backdropUrl?: string;
  // from tmdb-tv
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

interface TMDBSeasonProps {
  season_number: number;
  episode_count: number;
  // poster_url?: string;
}
