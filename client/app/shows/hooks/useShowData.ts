import { ShowProps } from "@/types/show";
import { useEffect, useState, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useShowData() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [shows, setShows] = useState<ShowProps[]>([]);
  const [showDataLoading, setShowDataLoading] = useState(true);

  const isProcessingShow = showDataLoading || isAuthLoading;

  // READ
  const getShows = useCallback(async () => {
    try {
      setShowDataLoading(true);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const shows = resJson.data || [];
      setShows(shows);
    } catch (e) {
      console.error("Error loading shows", e);
      setShows([]);
    } finally {
      setShowDataLoading(false);
    }
  }, [authFetch]);

  // CREATE
  const addShow = useCallback(
    async (show: ShowProps) => {
      // req data
      if (!show.title || !show.status || !show.tmdbId || !show.status) {
        return;
      }
      //
      try {
        setShowDataLoading(true);
        //
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows`;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(show),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const newShow = resJson.data;
        setShows((prev) => [...prev, newShow]);
      } catch (e) {
        console.error("Error adding show", e);
      } finally {
        setShowDataLoading(false);
      }
    },
    [authFetch]
  );

  // UPDATE
  const updateShow = useCallback(
    async (showId: number, updates: Partial<ShowProps>) => {
      try {
        // only updates these
        const allowedFields = [
          "score",
          "status",
          "note",
          "dateCompleted",
          "curSeasonIndex",
          "curEpisode",
        ];
        const invalidFields = Object.keys(updates).filter(
          (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
          console.warn("Invalid fields attempted:", invalidFields);
          return;
        }
        // update locally
        setShows((prevShows) =>
          prevShows.map((show) =>
            show.id === showId ? { ...show, ...updates } : show
          )
        );
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows/${showId}`;
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
        console.error("Error updating show", e);
      }
    },
    [authFetch]
  );

  // DELETE
  const deleteShow = useCallback(
    async (showId: number) => {
      try {
        setShowDataLoading(true);
        // update locally
        setShows((prevShows) => {
          return prevShows.filter((show) => show.id !== showId);
        });
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows/${showId}`;
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
        console.error("Error deleting show", e);
      } finally {
        setShowDataLoading(false);
      }
    },
    [authFetch]
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
