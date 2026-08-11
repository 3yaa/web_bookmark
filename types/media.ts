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
	seriesTitle: string | null;
	placeInSeries: string | null;
	prequel: string | null;
	sequel: string | null;
	total?: number | null;
}

export interface SeriesAPIProps {
	series_title: string | null;
	position: string | null;
	prequel: string | null;
	sequel: string | null;
	total?: number | null;
}

// jsonb { url, color } -- books, movies and games all store their cover this
// way so the dominant colour travels with the artwork
export interface MediaCoverProps {
	url: string;
	color: string;
}

export interface BaseMediaProps {
	id: number;
	title: string;
	status: MediaStatus;
	lastUpdated: Date;
	dateCompleted?: Date | null;
	note?: string;
	score: Score | null;
	// the author and dateReleased and cover i need to fix sometimes T_T
	imageUrl?: string;
	cover?: MediaCoverProps | null;
	// shows still carry a bare poster url
	posterUrl?: string;
	//
	backdropUrl?: string;
}
