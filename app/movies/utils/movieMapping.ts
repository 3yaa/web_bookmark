import { MovieProps, MovieAPIProps } from "@/types/movie";
import { SeriesAPIProps } from "@/types/media";

export function resetMovieValues(
	movie: Partial<MovieProps>,
): Partial<MovieProps> {
	return {
		id: movie.id,
		imdbId: movie.imdbId,
		title: "",
		score: undefined,
		dateCompleted: undefined,
		note: undefined,
		director: undefined,
		cover: undefined,
		dateReleased: undefined,
		seriesTitle: undefined,
		placeInSeries: undefined,
		prequel: undefined,
		sequel: undefined,
		status: "Want to Watch",
		lastUpdated: undefined,
		imdbRating: undefined,
	};
}

export function mapMetaToMovie(dataMeta: MovieAPIProps): Partial<MovieProps> {
	return {
		imdbId: dataMeta.imdbId,
		tmdbId: dataMeta.tmdb_id,
		title: dataMeta.title,
		director: dataMeta.director,
		status: "Want to Watch",
		dateReleased: dataMeta.released_date,
		imdbRating: dataMeta.imdbRating,
		cover: dataMeta.poster_url
			? { url: dataMeta.poster_url, color: "" }
			: undefined,
		backdropUrl: dataMeta.backdrop_url,
	};
}

export function mapSeriesToMovie(
	dataSeries?: SeriesAPIProps | null,
): Partial<MovieProps> {
	return {
		seriesTitle: dataSeries?.series_title ?? undefined,
		placeInSeries: dataSeries?.position ?? undefined,
		prequel: dataSeries?.prequel ?? undefined,
		sequel: dataSeries?.sequel ?? undefined,
	};
}
