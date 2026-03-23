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

interface ManageMediaConfig<T extends BaseMediaProps> {
  items: T[];
  onRemove: (itemId: number) => Promise<void>;
  onUpdate: (itemId: number, updates: Partial<T>) => Promise<void>;
}

export function useManageMedia<T extends BaseMediaProps>({
  items,
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
  const [tempScore, setTempScore] = useState<number>(0);
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
  const handleSortConfig = (sortType: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.type !== sortType) {
        return { type: sortType, order: "desc" };
      } else if (prev.order === "desc") {
        return { type: sortType, order: "asc" };
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
    (finalScore: number) => {
      if (!selectedItem?.id) return;
      setSelectedItem({ ...selectedItem, score: finalScore });
      // onUpdate(selectedItem.id, { score: finalScore } as Partial<T>);
      pendingUpdates.current = {
        ...pendingUpdates.current,
        ...({ score: finalScore } as Partial<T>),
      };
      setTempScore(0);
      setActiveModal("detailsModal");
    },
    [selectedItem],
  );

  const handleItemUpdates = useCallback(
    async (itemId: number, updates?: Partial<T>, shouldDelete?: boolean) => {
      if (shouldDelete) return await onRemove(itemId);
      if (!updates) return;
      // for score update (select score x)
      const isNewScore = updates.score && !selectedItem?.score;
      if (isNewScore) {
        // check if theres any item in same score tier
        const hasOpponent = items.some(
          (i) => i.score === updates.score && i.lastUpdated,
        );
        // commense score battle
        if (hasOpponent && updates.score) {
          setTempScore(updates.score);
          setActiveModal("scoreBattlerModal");
          return;
        }
      }

      if (selectedItem?.id === itemId) {
        setSelectedItem({ ...selectedItem, ...updates });
      }
      // onUpdate(itemId, updates);
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    },
    [onRemove, selectedItem, items],
  );

  const handleModalClose = useCallback(() => {
    // push any pending update to db
    if (selectedItem?.id && Object.keys(pendingUpdates.current).length > 0) {
      onUpdate(selectedItem.id, pendingUpdates.current);
    }
    pendingUpdates.current = {};
    //
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
    handleScoreFinal,
    handleSortConfig,
    handleModalClose,
    handleItemUpdates,
    handleItemClicked,
    handleSearchQueryChange,
    handleStatusFilterConfig,
  };
}
