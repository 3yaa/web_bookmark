import { useMemo } from "react";
import { ShowProps, SortConfig } from "@/types/show";
import { MediaStatus } from "@/types/media";

export const useSortShows = (
  shows: ShowProps[],
  statusFilter: MediaStatus | null,
  sortConfig: SortConfig | null
) => {
  return useMemo(() => {
    // always work on a new array
    const result: ShowProps[] = statusFilter
      ? shows.filter((show) => show.status === statusFilter)
      : [...shows];

    if (!sortConfig) return result;

    const { type, order } = sortConfig;
    const direction = order === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (type) {
        case "title": {
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1;
          if (!b.title) return -1;

          return a.title.localeCompare(b.title) * direction;
        }

        case "score": {
          if (a.score == null && b.score == null) return 0;
          if (a.score == null) return 1;
          if (b.score == null) return -1;

          return (a.score - b.score) * direction;
        }

        case "dateCompleted": {
          if (!a.dateCompleted && !b.dateCompleted) return 0;
          if (!a.dateCompleted) return 1;
          if (!b.dateCompleted) return -1;

          const dateA = new Date(a.dateCompleted).getTime();
          const dateB = new Date(b.dateCompleted).getTime();

          return (dateA - dateB) * direction;
        }

        case "studio": {
          const studioA = Array.isArray(a.studio) ? a.studio[0] : a.studio;
          const studioB = Array.isArray(b.studio) ? b.studio[0] : b.studio;

          if (!studioA && !studioB) return 0;
          if (!studioA) return 1;
          if (!studioB) return -1;

          return studioA.localeCompare(studioB) * direction;
        }

        case "dateReleased": {
          if (!a.dateReleased && !b.dateReleased) return 0;
          if (!a.dateReleased) return 1;
          if (!b.dateReleased) return -1;

          const dateA = new Date(a.dateReleased).getTime();
          const dateB = new Date(b.dateReleased).getTime();

          return (dateA - dateB) * direction;
        }

        default:
          return 0;
      }
    });

    return result;
  }, [shows, statusFilter, sortConfig]);
};
