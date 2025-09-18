import { MovieProps, OMDbProps, TMDBProps, WikidataProps } from "@/types/movie";

export function resetMovieValues(
  movie: Partial<MovieProps>
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
    status: "Want to Read",
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
  dataWiki: WikidataProps
): Partial<MovieProps> {
  return {
    // title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: dataWiki.series_title ?? undefined,
    placeInSeries: dataWiki.place_in_series ?? undefined,
    prequel: dataWiki.prequel ?? undefined,
    sequel: dataWiki.sequel ?? undefined,
  };
}

export function cleanName(
  title: string | undefined,
  seriesTitle: string | undefined
) {
  if (!title || !seriesTitle) {
    return title;
  }

  // If series and title are the same, return title as-is
  if (title.trim() === seriesTitle.trim()) {
    return title;
  }

  // Special cases where we want to keep the full title
  // Part/Chapter indicators (like "Dune: Part One")
  if (
    /:\s*(Part|Chapter|Volume)\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+)/i.test(
      title
    )
  ) {
    return title;
  }

  // Numbered sequels with roman numerals or numbers (like "Rocky II", "Matrix: Reloaded")
  if (
    /(II|III|IV|V|VI|VII|VIII|IX|X|\d+)$/i.test(title) ||
    /:\s*(Reloaded|Revolutions|Returns|Rises|Begins|Forever|Beyond|Resurrection)/i.test(
      title
    )
  ) {
    return title;
  }

  // Common sequel patterns
  const sequelPatterns = [
    /:\s*(The\s+)?(Beginning|End|Final|Last|Ultimate|Return|Rise|Dawn|War|Battle)/i,
    /\s+(Returns?|Rises?|Begins?|Forever|Beyond|Reborn|Resurrection|Revenge|Strikes Back)/i,
  ];

  for (const pattern of sequelPatterns) {
    if (pattern.test(title)) {
      return title;
    }
  }

  // If none of the special cases apply, clean the name
  return (
    title
      .replace(
        new RegExp(
          `^${seriesTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "i"
        ),
        ""
      )
      // Remove common separators at start
      .replace(/^[\s\-\–\—:;,\.\|#]*/, "")
      // Remove movie-specific indicators
      .replace(/^(Movie|Film|Episode|Chapter|Part)[\s\d\.\-:#]*/i, "")
      // Remove leading numbers with separators (but be careful with roman numerals)
      .replace(/^\d+[\s\-\.\):]*/, "")
      // Remove connecting words
      .replace(/^(and the|and|&|the)\s+/i, "")
      .trim()
  );
}
