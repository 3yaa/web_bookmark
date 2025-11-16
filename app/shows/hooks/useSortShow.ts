import { useMemo } from "react";
import { ShowProps, SortConfig } from "@/types/show";

export const useSortShows = (
  shows: ShowProps[],
  sortConfig: SortConfig | null
) => {
  return useMemo(() => {
    // if no sort config, return shows as-is (no copying)
    if (!sortConfig) return shows;

    // create a shallow copy once
    const sortedShows = [...shows];

    switch (sortConfig.type) {
      case "title":
        sortedShows.sort((a, b) => {
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1;
          if (!b.title) return -1;

          const comparison = a.title.localeCompare(b.title);
          return sortConfig.order === "desc" ? comparison : -comparison;
        });
        break;

      case "score":
        sortedShows.sort((a, b) => {
          if (!a.score && !b.score) return 0;
          if (!a.score) return 1;
          if (!b.score) return -1;

          const comparison = a.score - b.score;
          return sortConfig.order === "asc" ? comparison : -comparison;
        });
        break;

      case "dateCompleted":
        sortedShows.sort((a, b) => {
          if (!a.dateCompleted && !b.dateCompleted) return 0;
          if (!a.dateCompleted) return 1;
          if (!b.dateCompleted) return -1;

          const dateA = new Date(a.dateCompleted).getTime();
          const dateB = new Date(b.dateCompleted).getTime();

          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;

          const comparison = dateA - dateB;
          return sortConfig.order === "asc" ? comparison : -comparison;
        });
        break;

      case "studio":
        sortedShows.sort((a, b) => {
          if (!a.studio && !b.studio) return 0;
          if (!a.studio) return 1;
          if (!b.studio) return -1;

          const comparison = a.studio[0].localeCompare(b.studio[0]);
          return sortConfig.order === "desc" ? comparison : -comparison;
        });
        break;

      case "dateReleased":
        sortedShows.sort((a, b) => {
          if (!a.dateReleased && !b.dateReleased) return 0;
          if (!a.dateReleased) return 1;
          if (!b.dateReleased) return -1;

          const comparison = a.dateReleased - b.dateReleased;
          return sortConfig.order === "asc" ? comparison : -comparison;
        });
        break;
    }

    return sortedShows;
  }, [shows, sortConfig]);
};
