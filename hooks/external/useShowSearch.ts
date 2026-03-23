import { useState } from "react";
import { TMDBProps, TMDBTvProps } from "@/types/show";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useShowSearch() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShowSearching = isSearching || isAuthLoading;

  // TMDB SEARCH API -- BASIC METADATA
  const searchForShow = async (
    title: string,
    year?: number | undefined
  ): Promise<TMDBProps | null | { isDuplicate: boolean; title: string }> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/shows-api/tmdb?title=${title}&year=${year}`;
      const response = await authFetch(url);
      // if duplicate
      if (response.status === 409) {
        const data = await response.json();
        return { isDuplicate: true, title: data.title };
      }
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const show = resJson.data || null;
      //
      return show;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting TMDb Search failed:", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // TMDB TV API -- SEASON METADATA
  const searchForShowSeasonInfo = async (
    tmdbId: string
  ): Promise<TMDBTvProps | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/shows-api/tmdb-tv?tmdbId=${tmdbId}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const seasonInfo = resJson.data || null;
      //
      return seasonInfo;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting TMDB TV failed: ", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    error,
    isShowSearching,
    searchForShow,
    searchForShowSeasonInfo,
  };
}
