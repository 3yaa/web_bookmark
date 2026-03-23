import { useMemo } from "react";
import { BaseMediaProps } from "@/types/media";
import { BookProps, BookSortConfig } from "@/types/book";
import { GameProps, GameSortConfig } from "@/types/game";
import { ShowProps, ShowSortConfig } from "@/types/show";
import { MovieProps, MovieSortConfig } from "@/types/movie";

export const useSortBooks = (
  books: BookProps[],
  sortConfig: BookSortConfig | null,
) =>
  useSortMedia(books, sortConfig, [
    { key: "author", type: "string", getValue: (b) => b.author },
    { key: "datePublished", type: "number", getValue: (b) => b.datePublished },
  ]);

export const useSortMovies = (
  movies: MovieProps[],
  sortConfig: MovieSortConfig | null,
) =>
  useSortMedia(movies, sortConfig, [
    { key: "director", type: "string", getValue: (m) => m.director },
    { key: "dateReleased", type: "number", getValue: (m) => m.dateReleased },
  ]);

export const useSortShows = (
  shows: ShowProps[],
  sortConfig: ShowSortConfig | null,
) =>
  useSortMedia(shows, sortConfig, [
    { key: "studio", type: "string", getValue: (s) => s.studio },
    { key: "dateReleased", type: "number", getValue: (s) => s.dateReleased },
  ]);

export const useSortGames = (
  games: GameProps[],
  sortConfig: GameSortConfig | null,
) =>
  useSortMedia(games, sortConfig, [
    { key: "studio", type: "string", getValue: (g) => g.studio },
    { key: "dateReleased", type: "number", getValue: (g) => g.dateReleased },
  ]);

// =========GENERIC SORT=========

type SortColumn<T> = {
  key: string;
  getValue: (item: T) => string | number | null | undefined;
  type: "string" | "number";
};

function useSortMedia<T extends BaseMediaProps>(
  items: T[],
  sortConfig: { type: string; order: "asc" | "desc" } | null,
  extraColumns: SortColumn<T>[],
): T[] {
  return useMemo(() => {
    // if no sort config, return items as-is (no copying)
    if (!sortConfig) return items;

    // create a shallow copy once
    const sortedItems = [...items];

    switch (sortConfig.type) {
      case "title":
        sortedItems.sort((a, b) => {
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1;
          if (!b.title) return -1;

          const comparison = a.title.localeCompare(b.title);
          return sortConfig.order === "desc" ? comparison : -comparison;
        });
        break;

      case "score":
        sortedItems.sort((a, b) => {
          if (!a.score && !b.score) return 0;
          if (!a.score) return 1;
          if (!b.score) return -1;

          const comparison = a.score - b.score;
          return sortConfig.order === "asc" ? comparison : -comparison;
        });
        break;

      case "dateCompleted":
        sortedItems.sort((a, b) => {
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

      default: {
        const col = extraColumns.find((c) => c.key === sortConfig.type);
        if (!col) break;

        sortedItems.sort((a, b) => {
          const valA = col.getValue(a);
          const valB = col.getValue(b);

          if (valA == null && valB == null) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;

          if (col.type === "string") {
            const comparison = String(valA).localeCompare(String(valB));
            return sortConfig.order === "desc" ? comparison : -comparison;
          } else {
            const comparison = Number(valA) - Number(valB);
            return sortConfig.order === "asc" ? comparison : -comparison;
          }
        });
        break;
      }
    }

    return sortedItems;
  }, [items, sortConfig, extraColumns]);
}
