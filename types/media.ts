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
  mainTitle?: string;
  seriesTitle?: string;
  placeInSeries?: string;
  prequel?: string;
  sequel?: string;
}
