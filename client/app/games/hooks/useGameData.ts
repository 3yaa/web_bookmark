import { useAuthFetch } from "@/hooks/useAuthFetch";
import { GameProps } from "@/types/game";
import { useEffect, useState, useCallback } from "react";

export function useGameData() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [games, setGames] = useState<GameProps[]>([]);
  const [gameDataLoading, setGameDataLoading] = useState(true);

  const isProcessingGame = gameDataLoading || isAuthLoading;

  // READ
  const getGames = useCallback(async () => {
    try {
      setGameDataLoading(true);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/games`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const games = resJson.data || [];
      setGames(games);
    } catch (e) {
      console.error("Error loading games", e);
      setGames([]);
    } finally {
      setGameDataLoading(false);
    }
  }, [authFetch]);

  // CREATE
  const addGame = useCallback(
    async (game: GameProps) => {
      // req data
      if (!game.title || !game.status || !game.igdbId) {
        return;
      }
      //
      try {
        setGameDataLoading(true);
        //
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/games`;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(game),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const newGame = resJson.data;
        setGames((prev) => [...prev, newGame]);
      } catch (e) {
        console.error("Error adding game", e);
      } finally {
        setGameDataLoading(false);
      }
    },
    [authFetch]
  );

  // UPDATE
  const updateGame = useCallback(
    async (gameId: number, updates: Partial<GameProps>) => {
      try {
        setGameDataLoading(true);
        // only updates these
        const allowedFields = ["score", "status", "note", "dateCompleted"];
        const invalidFields = Object.keys(updates).filter(
          (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
          console.warn("Invalid fields attempted:", invalidFields);
          return;
        }
        // update locally
        setGames((prev) =>
          prev.map((game) =>
            game.id === gameId ? { ...game, ...updates } : game
          )
        );
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/games/${gameId}`;
        const options = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error updating book", e);
      } finally {
        setGameDataLoading(false);
      }
    },
    [authFetch]
  );

  // DELETE
  const deleteGame = useCallback(
    async (gameId: number) => {
      try {
        setGameDataLoading(true);
        // update locally
        setGames((prev) => {
          return prev.filter((game) => game.id !== gameId);
        });
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/games/${gameId}`;
        const options = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error deleting book", e);
      } finally {
        setGameDataLoading(false);
      }
    },
    [authFetch]
  );

  // Load games on component mount
  useEffect(() => {
    getGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    games,
    addGame,
    updateGame,
    deleteGame,
    isProcessingGame,
  };
}
