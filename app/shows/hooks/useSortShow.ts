import { useMemo } from "react";
import { ShowProps, SortConfig } from "@/types/show";

export const useSortShows = (
  shows: ShowProps[],
  sortConfig: SortConfig | null
) => {
  return useMemo(() => {
    switch (sortConfig?.type) {
      case "title":
        const sortedTitle = [...shows].sort((a, b) => {
          // Handle null/undefined titles
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1; // Put shows without title at the end
          if (!b.title) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "desc") {
            return a.title.localeCompare(b.title); // A-Z
          } else {
            return b.title.localeCompare(a.title); // Z-A
          }
        });
        return sortedTitle;
      // for fooking score
      case "score":
        const sortedScore = [...shows].sort((a, b) => {
          if (!a.score && !b.score) return 0;
          if (!a.score) return 1;
          if (!b.score) return -1;

          if (sortConfig.order === "asc") {
            return a.score - b.score;
          } else {
            return b.score - a.score;
          }
        });
        return sortedScore;
      // complete date
      case "dateCompleted":
        const sortedCompleted = [...shows].sort((a, b) => {
          // Handle null/undefined dates
          if (!a.dateCompleted && !b.dateCompleted) return 0;
          if (!a.dateCompleted) return 1; // Put shows without completion date at the end
          if (!b.dateCompleted) return -1;

          // Convert to Date objects and sort based on the order configuration
          const dateA = new Date(a.dateCompleted);
          const dateB = new Date(b.dateCompleted);

          // Check for invalid dates
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;

          if (sortConfig.order === "asc") {
            return dateA.getTime() - dateB.getTime(); // Oldest first
          } else {
            return dateB.getTime() - dateA.getTime(); // Newest first
          }
        });
        return sortedCompleted;
      // director
      case "studio":
        const sortedDirector = [...shows].sort((a, b) => {
          // Handle null/undefined directors
          if (!a.studio && !b.studio) return 0;
          if (!a.studio) return 1; // Put shows without director at the end
          if (!b.studio) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "desc") {
            return a.studio[0].localeCompare(b.studio[0]); // A-Z
          } else {
            return b.studio[0].localeCompare(a.studio[0]); // Z-A
          }
        });
        return sortedDirector;
      // released date
      case "dateReleased":
        const sortedReleased = [...shows].sort((a, b) => {
          // Handle null/undefined publication years
          if (!a.dateReleased && !b.dateReleased) return 0;
          if (!a.dateReleased) return 1; // Put shows without released year at the end
          if (!b.dateReleased) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "asc") {
            return a.dateReleased - b.dateReleased; // Oldest year first
          } else {
            return b.dateReleased - a.dateReleased; // Newest year first
          }
        });
        return sortedReleased;
      // default order
      default:
        return shows;
    }
  }, [shows, sortConfig]);
};
