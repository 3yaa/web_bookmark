import { ShowProps } from "@/types/show";
import { useEffect, useState, useCallback } from "react";

const SHOWS_STORAGE_KEY = "mouthful_games";

export function useShowData() {
  const [shows, setShows] = useState<ShowProps[]>([]);
  const [showDataLoading, setShowDataLoading] = useState(true);

  const isProcessingShow = showDataLoading;

  // Helper functions for localStorage
  const loadShowsFromStorage = useCallback((): ShowProps[] => {
    try {
      const stored = localStorage.getItem(SHOWS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading shows from localStorage:", error);
      return [];
    }
  }, []);

  const saveShowsToStorage = useCallback((shows: ShowProps[]) => {
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
  const addShow = useCallback(
    async (show: ShowProps) => {
      // req data
      if (!show.title || !show.status || !show.tmdbId) {
        return;
      }

      try {
        setShowDataLoading(true);

        // Generate a temporary ID if not provided
        const newShow: ShowProps = {
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
  const updateShow = useCallback(
    async (showId: number, updates: Partial<ShowProps>) => {
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
  const deleteShow = useCallback(
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
    shows,
    addShow,
    updateShow,
    deleteShow,
    isProcessingShow,
  };
}
