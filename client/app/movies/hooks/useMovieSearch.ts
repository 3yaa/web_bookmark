import { useState } from "react";
import { OMDbProps, TMDBProps, WikidataProps } from "@/types/movie";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useMovieSearch() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMovieSearching = isSearching || isAuthLoading;

  // OMDb API -- MOVIE METADATA
  const searchForMovie = async (
    title: string,
    year?: number | undefined
  ): Promise<OMDbProps | null> => {
    try {
      setIsSearching(true);
      setError(null);
      // make call
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/movies-api/omdb?title=${title}&year=${year}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      // format data
      const resJson = await response.json();
      const movie = resJson.data || null;
      //
      return movie;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting OMDb failed: ", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // TMDB API -- MOVIE POSTERS
  const searchForPosters = async (
    imdbId: string
  ): Promise<TMDBProps | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/movies-api/tmdb?imdbId=${imdbId}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const moviePosters = resJson.data || null;
      //
      return moviePosters;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting TMDb failed:", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // WikidataProps API -- SERIES INFO
  const searchForSeriesInfo = async (
    imdbId: string
  ): Promise<WikidataProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/movies-api/wikidata?imdbId=${imdbId}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const seriesInfo = resJson.data || null;
      //
      return seriesInfo;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting WikidataProps failed: ", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    error,
    isMovieSearching,
    searchForMovie,
    searchForPosters,
    searchForSeriesInfo,
  };
}
