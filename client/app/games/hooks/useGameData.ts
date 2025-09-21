import { GameProps } from "@/types/game";
import { useEffect, useState, useCallback } from "react";

const SHOWS_STORAGE_KEY = "mouthful_games";

export function useGameData() {
  const [games, setShows] = useState<GameProps[]>([]);
  const [showDataLoading, setShowDataLoading] = useState(true);

  const isProcessingGame = showDataLoading;

  // Helper functions for localStorage
  const loadShowsFromStorage = useCallback((): GameProps[] => {
    try {
      const stored = localStorage.getItem(SHOWS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading shows from localStorage:", error);
      return [];
    }
  }, []);

  const saveShowsToStorage = useCallback((shows: GameProps[]) => {
    try {
      localStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
    } catch (error) {
      console.error("Error saving shows to localStorage:", error);
    }
  }, []);

  // READ
  const getShows = useCallback(async () => {
    try {
      setShowDataLoading(true);
      const storedShows = loadShowsFromStorage();
      setShows(storedShows);
    } catch (e) {
      console.error("Error loading shows", e);
      setShows([]);
    } finally {
      setShowDataLoading(false);
    }
  }, [loadShowsFromStorage]);

  // CREATE
  const addGame = useCallback(
    async (show: GameProps) => {
      // req data
      if (!show.title || !show.status || !show.igdbId) {
        return;
      }

      try {
        setShowDataLoading(true);

        // Generate a temporary ID if not provided
        const newShow: GameProps = {
          ...show,
          id: show.id || Date.now(), // Use timestamp as temporary ID
        };

        setShows((prev) => {
          const updated = [...prev, newShow];
          saveShowsToStorage(updated);
          return updated;
        });
      } catch (e) {
        console.error("Error adding show", e);
      } finally {
        setShowDataLoading(false);
      }
    },
    [saveShowsToStorage]
  );

  // UPDATE
  const updateGame = useCallback(
    async (showId: number, updates: Partial<GameProps>) => {
      // only updates these
      const allowedFields = ["score", "status", "note", "dateCompleted"];
      const invalidFields = Object.keys(updates).filter(
        (field) => !allowedFields.includes(field)
      );
      if (invalidFields.length > 0) {
        console.warn("Invalid fields attempted:", invalidFields);
        return;
      }

      // update local immediately
      setShows((prevShows) => {
        const updated = prevShows.map((show) =>
          show.id === showId ? { ...show, ...updates } : show
        );
        saveShowsToStorage(updated);
        return updated;
      });
    },
    [saveShowsToStorage]
  );

  // DELETE
  const deleteGame = useCallback(
    async (showId: number) => {
      try {
        setShowDataLoading(true);

        setShows((prevShows) => {
          const updated = prevShows.filter((show) => show.id !== showId);
          saveShowsToStorage(updated);
          return updated;
        });
      } catch (e) {
        console.error("Error deleting show", e);
      } finally {
        setShowDataLoading(false);
      }
    },
    [saveShowsToStorage]
  );

  // Load shows on component mount
  useEffect(() => {
    getShows();
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
