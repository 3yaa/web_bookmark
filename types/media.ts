import { Score } from "@/lib/tierConfig";

export type MediaStatus =
  | "Completed"
  | "Want to Read"
  | "Playing"
  | "Watching"
  | "Want to Watch"
  | "Dropped";

export type SortState<K extends string> = { type: K; order: "asc" | "desc" };

export interface ColumnConfig<T> {
  label: string;
  sortKey: string;
  getValue: (item: T) => string | number | null | undefined;
}

export interface SeriesMediaProps {
  seriesTitle?: string | null;
  placeInSeries?: string | null;
  prequel?: string | null;
  sequel?: string | null;
}

export interface BaseMediaProps {
  id: number;
  title: string;
  status: MediaStatus;
  lastUpdated: Date;
  dateCompleted?: Date | null;
  note?: string;
  score: Score | null;
  // the author and dateRepleased and cover i need to fix sometimes T_T
  imageUrl?: string;
  posterUrl?: string;
  coverUrl?: string;
  //
  backdropUrl?: string;
}
