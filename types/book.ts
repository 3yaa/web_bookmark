import {
	BaseMediaProps,
	ColumnConfig,
	SeriesMediaProps,
	SortState,
} from "./media";

export type BookSortConfig = SortState<
	"title" | "score" | "dateCompleted" | "author" | "datePublished"
>;

export const DIFF_COLUMNS_BOOK: [
	ColumnConfig<BookProps>,
	ColumnConfig<BookProps>,
] = [
	{ label: "Author", sortKey: "author", getValue: (b) => b.author },
	{
		label: "Published",
		sortKey: "datePublished",
		getValue: (b) => b.datePublished,
	},
];

export interface BookProps extends BaseMediaProps, SeriesMediaProps {
	status: "Completed" | "Want to Read" | "Dropped";
	key: string;
	author: string;
	datePublished: number;
	//
	cover: BookCoverProps;
	numPages: number;
	rating: number;
}

export interface BookSeriesAPIProps {
	series_title: string | null;
	position: string | null;
	prequel: string | null;
	sequel: string | null;
	total: number | null;
	//
	details: string | null;
}

export interface BookAPIProps {
	key: string;
	title: string;
	subtitle: string | null;
	author_name: string[];
	first_publish_year: number | null;
	num_pages: number | null;
	rating: number | null;
	covers: BookCoverProps[];
	series: BookSeriesAPIProps[];
}

export interface BookCoverProps {
	url: string;
	color: string;
}

// lightweight candidate shape for the multi-result picker
export interface BookSearchResult {
	key: string;
	title: string;
	author_name: string[];
	first_publish_year: number | null;
	cover_url: string | null;
	isDuplicate: boolean;
}
