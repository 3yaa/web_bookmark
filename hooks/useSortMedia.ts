import { useMemo } from "react";
import { BaseMediaProps, ColumnConfig } from "@/types/media";

export function useSortMedia<T extends BaseMediaProps>(
  items: T[],
  sortConfig: { type: string; order: "asc" | "desc" } | null,
  extraColumns: [ColumnConfig<T>, ColumnConfig<T>],
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
          if (!a.score?.mu && !b.score?.mu) return 0;
          if (!a.score?.mu) return 1;
          if (!b.score?.mu) return -1;

          const comparison = a.score.mu - b.score.mu;
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
        const col = extraColumns.find((c) => c.sortKey === sortConfig.type);
        if (!col) break;

        sortedItems.sort((a, b) => {
          const valA = col.getValue(a);
          const valB = col.getValue(b);

          if (valA == null && valB == null) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;

          if (typeof valA === "string" && typeof valB === "string") {
            const comparison = valA.localeCompare(valB);
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
