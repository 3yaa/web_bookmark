import { useMemo } from "react";
import { BookProps, SortConfig } from "@/types/book";

export const useSortBooks = (
  books: BookProps[],
  sortConfig: SortConfig | null
) => {
  return useMemo(() => {
    switch (sortConfig?.type) {
      case "title":
        const sortedTitle = [...books].sort((a, b) => {
          // Handle null/undefined titles
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1; // Put books without title at the end
          if (!b.title) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "asc") {
            return a.title.localeCompare(b.title); // A-Z
          } else {
            return b.title.localeCompare(a.title); // Z-A
          }
        });
        return sortedTitle;
      // for fooking score
      case "score":
        const sortedScore = [...books].sort((a, b) => {
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
        const sortedCompleted = [...books].sort((a, b) => {
          // Handle null/undefined dates
          if (!a.dateCompleted && !b.dateCompleted) return 0;
          if (!a.dateCompleted) return 1; // Put books without completion date at the end
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
      // author
      case "author":
        const sortedAuthor = [...books].sort((a, b) => {
          // Handle null/undefined authors
          if (!a.author && !b.author) return 0;
          if (!a.author) return 1; // Put books without author at the end
          if (!b.author) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "desc") {
            return a.author.localeCompare(b.author); // A-Z
          } else {
            return b.author.localeCompare(a.author); // Z-A
          }
        });
        return sortedAuthor;
      // pubslihed date
      case "datePublished":
        const sortedPublished = [...books].sort((a, b) => {
          // Handle null/undefined publication years
          if (!a.datePublished && !b.datePublished) return 0;
          if (!a.datePublished) return 1; // Put books without publication year at the end
          if (!b.datePublished) return -1;

          // Sort based on the order configuration
          if (sortConfig.order === "asc") {
            return a.datePublished - b.datePublished; // Oldest year first
          } else {
            return b.datePublished - a.datePublished; // Newest year first
          }
        });
        return sortedPublished;
      // default order
      default:
        return books;
    }
  }, [books, sortConfig]);
};
