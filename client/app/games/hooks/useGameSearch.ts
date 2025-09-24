import { useState } from "react";
import { IGDBProps, IGDBDlcProps } from "@/types/game";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useGameSearch() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGameSearching = isSearching || isAuthLoading;

  const searchForGame = async (
    title: string,
    limit: number
  ): Promise<IGDBProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/games-api/igdb?title=${title}&limit=${limit}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const games = resJson.data || null;
      //
      return games;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting IGDB Search failed:", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const searchForGameDlc = async (
    igdbId: number
  ): Promise<IGDBDlcProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/games-api/igdb-dlc?igdbId=${igdbId}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const gameDlcs = resJson.data || null;
      //
      return gameDlcs;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting IGDB-DLC failed:", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    error,
    isGameSearching,
    searchForGame,
    searchForGameDlc,
  };
}
