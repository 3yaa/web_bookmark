import { MovieProps, OMDbProps, TMDBProps, WikidataProps } from "@/types/movie";

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
    posterUrl: undefined,
    dateReleased: undefined,
    seriesTitle: undefined,
    placeInSeries: undefined,
    prequel: undefined,
    sequel: undefined,
    status: "Want to Watch",
    lastUpdated: undefined,
  };
}

export function mapOMDbToMovie(dataOMDb: OMDbProps): Partial<MovieProps> {
  return {
    imdbId: dataOMDb.imdbId,
    title: dataOMDb.title,
    director: dataOMDb.director,
    dateReleased: dataOMDb.released_date,
  };
}

export function mapTMDBToMovie(dataTMDB: TMDBProps): Partial<MovieProps> {
  return {
    posterUrl: dataTMDB.poster_url,
    backdropUrl: dataTMDB.backdrop_url,
  };
}

export function mapWikidataToMovie(
  dataWiki: WikidataProps,
): Partial<MovieProps> {
  return {
    // title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: dataWiki.series_title ?? undefined,
    placeInSeries: dataWiki.place_in_series ?? undefined,
    prequel: dataWiki.prequel ?? undefined,
    sequel: dataWiki.sequel ?? undefined,
  };
}
