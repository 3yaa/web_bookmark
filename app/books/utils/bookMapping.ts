import { BookProps, BookAPIProps } from "@/types/book";

export function mapBookAPIDatatoBook(
	dataAPI: BookAPIProps,
): Partial<BookProps> {
	return {
		key: dataAPI.key,
		title: dataAPI.title,
		author: dataAPI.author_name?.[0],
		status: "Want to Read",
		datePublished: dataAPI.first_publish_year ?? undefined,
		numPages: dataAPI.num_pages ?? undefined,
		rating: dataAPI.rating ?? undefined,
	};
}

export function mapBookAPISeriesData(
	series: BookAPIProps["series"],
	seriesI?: number,
): Pick<
	BookProps,
	"seriesTitle" | "placeInSeries" | "prequel" | "sequel" | "total"
> {
	const seriesEntry = series?.[seriesI ?? 0];

	return {
		seriesTitle: seriesEntry ? seriesEntry.series_title : null,
		placeInSeries: seriesEntry ? seriesEntry.position : null,
		prequel: seriesEntry ? seriesEntry.prequel : null,
		sequel: seriesEntry ? seriesEntry.sequel : null,
		total: seriesEntry ? (seriesEntry.total ?? 0) : null,
	};
}
