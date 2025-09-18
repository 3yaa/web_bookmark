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
    dateReleased: undefined,
    status: "Want to Read",
  };
}

export function mapTMDBToShow(dataTMDB: TMDBProps): Partial<ShowProps> {
  return {
    tmdbId: dataTMDB.tmdbId,
    title: dataTMDB.title,
    dateReleased: parseInt(dataTMDB.released_date || "0"),
    posterUrl: dataTMDB.poster_url,
    backdropUrl: dataTMDB.backdrop_url,
  };
}

export function mapTMDBTVToShow(dataTMDBTV: TMDBTvProps): Partial<ShowProps> {
  return {
    seasons: dataTMDBTV.seasons,
    studio: dataTMDBTV.studio,
  };
}
