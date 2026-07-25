import { BookProps, BookAPIProps } from "@/types/book";

export function resetBookValues(book: Partial<BookProps>): Partial<BookProps> {
	return {
		id: book.id,
		key: book.key,
		title: "",
		score: undefined,
		dateCompleted: undefined,
		note: undefined,
		author: undefined,
		cover: undefined,
		datePublished: undefined,
		seriesTitle: undefined,
		placeInSeries: undefined,
		prequel: undefined,
		sequel: undefined,
		status: "Want to Read",
		lastUpdated: undefined,
	};
}

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

// export function mapGoogleDataToBook(
// 	dataGoogle: GoogleBooksProps,
// ): Partial<BookProps> {
// 	return {
// 		key: dataGoogle.id,
// 		title: cleanTitle(dataGoogle.title),
// 		author: dataGoogle.author_name?.[0],
// 		datePublished: dataGoogle.first_publish_year,
// 		coverUrl: dataGoogle.cover_url,
// 	};
// }

// export function mapWikidataToBook(dataWiki: WikidataProps): Partial<BookProps> {
// 	const sTitle = dataWiki.series_title;
// 	return {
// 		// title: cleanName(dataWiki.wikiTitle, sTitle),
// 		seriesTitle: sTitle,
// 		placeInSeries: dataWiki.place_in_series,
// 		prequel: cleanName(dataWiki.prequel, sTitle),
// 		sequel: cleanName(dataWiki.sequel, sTitle),
// 	};
// }

// function cleanTitle(title: string) {
// 	return (
// 		title
// 			//removes brackets
// 			.replace(/\[.*?\]/g, "")
// 			.replace(/\(.*?\)/g, "")
// 			.replace(/\{.*?\}/g, "")
// 			// .replace(/.g/, "")
// 			//
// 			// Remove common separators at start and end
// 			.replace(/^[\s\-\–\—:;,\.\|#!]*/, "")
// 			.replace(/[\s\-\–\—:;,\.\|#!]*$/, "")
// 			// Clean up multiple spaces
// 			.replace(/\s+/g, " ")
// 			.trim()
// 	);
// }
