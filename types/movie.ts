import {
	BaseMediaProps,
	ColumnConfig,
	SeriesAPIProps,
	SeriesMediaProps,
	SortState,
} from "./media";

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

export interface MovieProps extends BaseMediaProps, SeriesMediaProps {
	status: "Completed" | "Want to Watch" | "Dropped";
	imdbId: string;
	tmdbId?: string;
	normalizedTitle: string;
	director?: string;
	dateReleased?: number;
	imdbRating?: number | null;
}

export interface MovieAPIProps {
	imdbId: string; // used to call other api
	tmdb_id?: string;
	title: string;
	director?: string;
	released_date?: number;
	imdbRating?: number | null;
	poster_url?: string;
	backdrop_url?: string;
	logo_url?: string | null;
	logos?: string[];
	series?: SeriesAPIProps | null;
}
