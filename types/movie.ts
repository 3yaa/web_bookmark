import { BaseMediaProps, ColumnConfig, SortState } from "./media";

export type MovieSortConfig = SortState<
  "title" | "score" | "dateCompleted" | "director" | "dateReleased"
>;

export const DIFF_COLUMNS_MOVIE: [
  ColumnConfig<MovieProps>,
  ColumnConfig<MovieProps>,
] = [
  { label: "Director", sortKey: "director", getValue: (m) => m.director },
  {
    label: "Released",
    sortKey: "dateReleased",
    getValue: (m) => m.dateReleased,
  },
];

export interface MovieProps extends BaseMediaProps {
  status: "Completed" | "Want to Watch" | "Dropped";
  imdbId: string;
  normalizedTitle: string;
  director?: string;
  dateReleased?: number;
}

export interface OMDbProps {
  imdbId: string; // used to call other api
  title: string;
  director?: string;
  released_date?: number;
}

export interface TMDBProps {
  poster_url?: string;
  backdrop_url?: string;
}

export interface WikidataProps {
  wiki_title?: string; // another title
  series_title?: string;
  place_in_series?: string;
  prequel?: string;
  sequel?: string;
}
