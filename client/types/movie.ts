export type SortConfig = {
  type: "title" | "score" | "dateCompleted" | "director" | "dateReleased";
  order: "asc" | "desc";
};

export interface MovieProps {
  id: number; //--REQUIRED -> will do on server side
  // user set
  score?: number;
  dateCompleted?: Date | null;
  note?: string;
  status: "Completed" | "Want to Read" | "Dropped"; //!--REQUIRED
  // from ol&&google -- used for checking duplicate
  imdbId: string; //!--REQUIRED
  // from ol||google
  title: string; //!--REQUIRED
  director?: string[];
  dateReleased?: number;
  posterUrl?: string;
  backdropUrl?: string;
  // from WikidataProps
  seriesTitle?: string;
  placeInSeries?: string;
  prequel?: string;
  sequel?: string;
  //
  leadActors?: string[];
  awards?: string[];
  imdbRating?: number;
  imdbVotes?: number;
  genre?: string[];
}

export interface OMDbProps {
  imdbId: string; // used to call other api
  // main details
  title: string;
  director?: string[];
  released_date?: number;
  // details
  lead_actors?: string[];
  awards?: string[];
  imdbRating?: number;
  imdbVotes?: number;
  genre?: string[];
}

export interface TMDBProps {
  poster_url: string;
  backdrop_url?: string;
}

export interface WikidataProps {
  wiki_title?: string; // another title
  series_title?: string;
  place_in_series?: string;
  prequel?: string;
  sequel?: string;
}
