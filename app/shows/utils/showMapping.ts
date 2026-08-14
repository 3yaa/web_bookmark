import { ShowProps, TMDBProps, TMDBTvProps } from "@/types/show";

export function resetMovieValues(show: Partial<ShowProps>): Partial<ShowProps> {
	return {
		id: show.id,
		tmdbId: show.tmdbId,
		title: "",
		score: undefined,
		dateCompleted: undefined,
		note: undefined,
		studio: undefined,
		posterUrl: undefined,
		logoUrl: undefined,
		dateReleased: undefined,
		status: "Want to Watch",
		lastUpdated: undefined,
	};
}

export function mapTMDBToShow(dataTMDB: TMDBProps): Partial<ShowProps> {
	return {
		tmdbId: dataTMDB.tmdbId,
		title: dataTMDB.title,
		dateReleased: parseInt(dataTMDB.released_date || "0"),
		posterUrl: dataTMDB.poster_url,
		backdropUrl: dataTMDB.backdrop_url,
		curSeasonIndex: 0,
		curEpisode: 0,
	};
}

export function mapTMDBTVToShow(dataTMDBTV: TMDBTvProps): Partial<ShowProps> {
	return {
		seasons: dataTMDBTV.seasons,
		studio: dataTMDBTV.studio,
		...(dataTMDBTV.imdbId ? { imdbId: dataTMDBTV.imdbId } : {}),
		...(dataTMDBTV.poster_url ? { posterUrl: dataTMDBTV.poster_url } : {}),
		...(dataTMDBTV.backdrop_url
			? { backdropUrl: dataTMDBTV.backdrop_url }
			: {}),
		...(dataTMDBTV.logo_url ? { logoUrl: dataTMDBTV.logo_url } : {}),
	};
}
