import { MovieProps, OMDbProps, TMDBProps, WikidataProps } from "@/types/movie";

export function resetMovieValues(
  book: Partial<MovieProps>
): Partial<MovieProps> {
  return {
    id: book.id,
    imdbId: book.imdbId,
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
    status: "Want to Read",
    //
    leadActors: undefined,
    awards: undefined,
    imdbRating: undefined,
    imdbVotes: undefined,
    genre: undefined,
  };
}

export function mapOMDbToMovie(dataOMDb: OMDbProps): Partial<MovieProps> {
  return {
    imdbId: dataOMDb.imdbId,
    title: dataOMDb.title,
    director: dataOMDb.director,
    dateReleased: dataOMDb.released_date,
    //
    leadActors: dataOMDb.lead_actors,
    awards: dataOMDb.awards,
    imdbRating: dataOMDb.imdbRating,
    imdbVotes: dataOMDb.imdbVotes,
    genre: dataOMDb.genre,
  };
}

export function mapTMDBToMovie(dataTMDB: TMDBProps): Partial<MovieProps> {
  return {
    posterUrl: dataTMDB.poster_url,
    backdropUrl: dataTMDB.backdrop_url,
  };
}

export function mapWikidataToMovie(
  dataWiki: WikidataProps
): Partial<MovieProps> {
  const sTitle = dataWiki.series_title ?? undefined;
  return {
    // title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: sTitle,
    placeInSeries: dataWiki.place_in_series,
    prequel: cleanName(dataWiki.prequel, sTitle),
    sequel: cleanName(dataWiki.sequel, sTitle),
  };
}

export function cleanName(
  title: string | undefined,
  seriesTitle: string | undefined
) {
  if (!title || !seriesTitle) {
    return title;
  }
  //in the case series and title are the same
  if (title.trim() === seriesTitle.trim()) {
    return title;
  }
  //
  return (
    title
      .replace(`${seriesTitle}`, "")
      // Remove common separators at start
      .replace(/^[\s\-\–\—:;,\.\|#]*/, "")
      // Remove book/volume indicators
      .replace(
        /^(Book|Vol|Volume|Part|Episode|Chapter|No|Number)[\s\d\.\-:#]*/,
        ""
      )
      // Remove leading numbers with separators
      .replace(/^\d+[\s\-\.\):]*/, "")
      // Remove connecting words like "and the", "and", "&", "the"
      .replace(/^(and the|and|&)\s+/i, "")
      .trim()
  );
}
