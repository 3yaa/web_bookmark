import { useMemo } from "react";
import { MovieProps, SortConfig } from "@/types/movie";

export const useSortMovies = (
  movies: MovieProps[],
  sortConfig: SortConfig | null
) => {
  return useMemo(() => {
    switch (sortConfig?.type) {
      case "title":
        const sortedTitle = [...movies].sort((a, b) => {
          // Handle null/undefined titles
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1; // Put movies without title at the end
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
        const sortedScore = [...movies].sort((a, b) => {
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
        const sortedCompleted = [...movies].sort((a, b) => {
          // Handle null/undefined dates
          if (!a.dateCompleted && !b.dateCompleted) return 0;
          if (!a.dateCompleted) return 1; // Put movies without completion date at the end
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
      case "director":
        const sortedDirector = [...movies].sort((a, b) => {
          // Handle null/undefined directors
          if (!a.director && !b.director) return 0;
          if (!a.director) return 1; // Put movies without director at the end
          if (!b.director) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "desc") {
            return a.director[0].localeCompare(b.director[0]); // A-Z
          } else {
            return b.director[0].localeCompare(a.director[0]); // Z-A
          }
        });
        return sortedDirector;
      // released date
      case "dateReleased":
        const sortedReleased = [...movies].sort((a, b) => {
          // Handle null/undefined publication years
          if (!a.dateReleased && !b.dateReleased) return 0;
          if (!a.dateReleased) return 1; // Put movies without released year at the end
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
        return movies;
    }
  }, [movies, sortConfig]);
};
