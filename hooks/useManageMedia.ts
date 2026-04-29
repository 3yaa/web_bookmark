import { BaseMediaProps, MediaStatus, SortState } from "@/types/media";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useScrollVisibility } from "./useScrollVisibility";
import { debounce } from "@/utils/debounce";
import { Score } from "@/lib/tierConfig";
import { createSession } from "@/lib/battleSession";

interface ManageMediaConfig<T extends BaseMediaProps> {
  items: T[];
  onAdd: (item: T) => Promise<T>;
  onRemove: (itemId: number) => Promise<void>;
  onUpdate: (
    itemId: number,
    updates: Partial<T>,
    indirectUpdate?: boolean,
  ) => Promise<void>;
}

export function useManageMedia<T extends BaseMediaProps>({
  items,
  onAdd,
  onRemove,
  onUpdate,
}: ManageMediaConfig<T>) {
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortState<string> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "detailsModal" | "addModal" | "scoreBattlerModal" | null
  >(null);
  const [tempScore, setTempScore] = useState<Score | null>(null);
  const pendingUpdates = useRef<Partial<T>>({});
  // used for mobile only
  const isMenuButtonsVisible = useScrollVisibility(30);

  //
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
  ).current;
  // SEARCH
  const searchedItems = useMemo(() => {
    if (!debouncedQuery) return items;

    return items.filter((item) =>
      item.title.toLowerCase().trim().includes(debouncedQuery),
    );
  }, [items, debouncedQuery]);
  // FILTER
  const [isFilterPending, startTransition] = useTransition();
  const filteredItems = useMemo(() => {
    if (!statusFilter) return searchedItems;
    //
    return searchedItems.filter((item) => item.status === statusFilter);
  }, [searchedItems, statusFilter]);

  //
  const DATE_SORT_KEYS = ["dateCompleted", "dateReleased", "datePublished"];

  const handleSortConfig = (sortType: string) => {
    const isDateSort = DATE_SORT_KEYS.includes(sortType);
    setSortConfig((prev) => {
      if (!prev || prev.type !== sortType) {
        return { type: sortType, order: isDateSort ? "asc" : "desc" };
      } else if (prev.order === (isDateSort ? "asc" : "desc")) {
        return { type: sortType, order: isDateSort ? "desc" : "asc" };
      } else {
        return null;
      }
    });
  };

  const handleStatusFilterConfig = (status: MediaStatus) => {
    startTransition(() => {
      if (statusFilter === status) {
        setStatusFilter(null);
      } else {
        setStatusFilter(status);
      }
    });
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value.toLowerCase().trim());
  };

  const handleItemClicked = useCallback((item: T) => {
    setActiveModal("detailsModal");
    setSelectedItem(item);
  }, []);

  const handleScoreFinal = useCallback(
    (finalScore: Score) => {
      if (!selectedItem?.id) return;
      setSelectedItem({ ...selectedItem, score: finalScore });
      // onUpdate(selectedItem.id, { score: finalScore } as Partial<T>);
      pendingUpdates.current = {
        ...pendingUpdates.current,
        ...({ score: finalScore } as Partial<T>),
      };
      setTempScore(null);
      setActiveModal("detailsModal");
    },
    [selectedItem],
  );

  const handleItemAdd = useCallback(
    async (item: T) => {
      const newItem = await onAdd(item);
      if (!newItem.score) return;
      setActiveModal("scoreBattlerModal");
      setSelectedItem(newItem);
      setTempScore(newItem.score);
    },
    [onAdd],
  );

  const handleItemUpdates = useCallback(
    async (itemId: number, updates?: Partial<T>, shouldDelete?: boolean) => {
      if (shouldDelete) return await onRemove(itemId);
      if (!updates) return;

      const isSelectedItem = itemId === selectedItem?.id;

      // for opponent updates
      if (!isSelectedItem) {
        const indirectUpdate = true;
        onUpdate(itemId, updates, indirectUpdate);
        return;
      }

      // check if first time score
      const isNewScore = updates.score && !selectedItem?.score;

      if (isNewScore && updates.score) {
        const skipScoreBattle =
          updates.score.mu >= 2000 ||
          createSession(
            items
              .filter((i) => i.score !== null && i.id !== itemId)
              .map((i) => ({ id: i.id, score: i.score! })),
            { id: itemId, score: updates.score },
          ).done;
        //
        if (skipScoreBattle) {
          setSelectedItem({ ...selectedItem, ...updates });
          pendingUpdates.current = { ...pendingUpdates.current, ...updates };
          return;
        }
        //
        setTempScore(updates.score);
        setActiveModal("scoreBattlerModal");
        return;
      }
      // normal update
      setSelectedItem({ ...selectedItem, ...updates });
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    },
    [onRemove, onUpdate, selectedItem, items],
  );

  const handleModalClose = useCallback(() => {
    // push any pending update to db -- have only one update
    if (selectedItem?.id && Object.keys(pendingUpdates.current).length > 0) {
      onUpdate(selectedItem.id, pendingUpdates.current);
    }
    pendingUpdates.current = {};
    // normal
    setActiveModal(null);
    // wait a frame before clearing state
    requestAnimationFrame(() => {
      setTitleToUse("");
      setSelectedItem(null);
    });
  }, [onUpdate, selectedItem]);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      const isDesktop = window.matchMedia("(min-width: 900px)").matches;
      if (!isDesktop) return;
      // if no modal is open and not typing in an input/textarea
      if (
        e.key === "Enter" &&
        !activeModal &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        setActiveModal("addModal");
      }
    };
    //
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return {
    // items
    filteredItems,
    // states
    tempScore,
    sortConfig,
    titleToUse,
    activeModal,
    searchQuery,
    statusFilter,
    selectedItem,
    setTitleToUse,
    setActiveModal,
    isFilterPending,
    setSelectedItem,
    isMenuButtonsVisible,
    // handlers
    handleItemAdd,
    handleScoreFinal,
    handleSortConfig,
    handleModalClose,
    handleItemUpdates,
    handleItemClicked,
    handleSearchQueryChange,
    handleStatusFilterConfig,
  };
}
