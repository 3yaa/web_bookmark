"use client";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  useMemo,
  useRef,
} from "react";
import { Plus } from "lucide-react";
import { MediaStatus } from "@/types/media";
import { ShowProps, SortConfig } from "@/types/show";
// hooks
import { useSortShows } from "@/app/shows/hooks/useSortShow";
import { useShowData } from "@/app/shows/hooks/useShowData";
// components
import { AddShow } from "./addShow/AddShow";
import { ShowDetails } from "./ShowDetailsHub";
import { ShowMobileListing } from "./listingViews/ShowMobileListing";
import { ShowDesktopListing } from "./listingViews/ShowDesktopListing";
import { debounce } from "@/utils/debounce";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export default function ShowHub() {
  const { shows, addShow, updateShow, deleteShow, isProcessingShow } =
    useShowData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // delegation
  const [selectedShow, setSelectedShow] = useState<ShowProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "showDetails" | "addShow" | null
  >(null);
  //
  const isButtonsVisible = useScrollVisibility(30);

  // set deboucne
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300)
  ).current;
  // SEARCH
  const searchedShows = useMemo(() => {
    if (!debouncedQuery) return shows;

    return shows.filter((show) =>
      show.title.toLowerCase().trim().includes(debouncedQuery)
    );
  }, [shows, debouncedQuery]);
  // FILTER
  const [isFilterPending, startTransition] = useTransition();
  const filteredShows = useMemo(() => {
    if (!statusFilter) return searchedShows;
    //
    return searchedShows.filter((show) => show.status === statusFilter);
  }, [searchedShows, statusFilter]);
  // SORT
  const sortedShows = useSortShows(filteredShows, sortConfig);

  const handleShowUpdates = useCallback(
    async (
      showId: number,
      updates?: Partial<ShowProps>,
      shouldDelete?: boolean
    ) => {
      if (updates) {
        if (selectedShow?.id === showId) {
          setSelectedShow({ ...selectedShow, ...updates });
        }
        updateShow(showId, updates);
      } else if (shouldDelete) {
        await deleteShow(showId);
      }
    },
    [deleteShow, selectedShow, updateShow]
  );

  const handleSortConfig = (sortType: SortConfig["type"]) => {
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

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    // wait a frame before clearing state
    requestAnimationFrame(() => {
      setTitleToUse("");
      setSelectedShow(null);
    });
  }, []);

  const handleShowClicked = useCallback((show: ShowProps) => {
    setActiveModal("showDetails");
    setSelectedShow(show);
  }, []);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value.toLowerCase().trim());
  };

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
        setActiveModal("addShow");
      }
    };
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

  return (
    <div className="min-h-screen">
      <div className="lg:block hidden">
        <ShowDesktopListing
          shows={sortedShows}
          isProcessingShow={isProcessingShow || isFilterPending}
          sortConfig={sortConfig}
          onSortConfig={handleSortConfig}
          onShowClicked={handleShowClicked}
          onSearchChange={handleSearchQueryChange}
          searchQuery={searchQuery}
        />
      </div>
      <div className="block lg:hidden">
        <ShowMobileListing
          shows={sortedShows}
          isProcessingShow={isProcessingShow || isFilterPending}
          sortConfig={sortConfig}
          curStatusFilter={statusFilter}
          onShowClicked={handleShowClicked}
          onSortConfig={handleSortConfig}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      {/* ADD BUTTON */}
      <div
        className={`fixed lg:bottom-8 lg:right-10 bottom-2 right-2 z-10
        lg:translate-y-0 transition-transform duration-300 ease-in-out
        ${isButtonsVisible ? "translate-y-0" : "translate-y-24"}`}
      >
        <button
          onClick={() => setActiveModal("addShow")}
          className="flex items-center justify-center w-14 h-14 lg:w-14 lg:h-14 rounded-full 
          bg-linear-to-br from-zinc-transparent to-zinc-800/60 
          hover:bg-linear-to-br hover:from-zinc-800/60 hover:to-transparent
          backdrop-blur-xl shadow-md shadow-black/20
          hover:scale-105 active:scale-95 
          transition-all duration-200 relative z-10 hover:cursor-pointer focus:outline-none"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
        </button>
      </div>
      <AddShow
        isOpen={activeModal === "addShow"}
        onClose={handleModalClose}
        existingShows={shows}
        onAddShow={addShow}
        titleFromAbove={titleToUse}
      />
      {/* SHOW DETAILS */}
      {selectedShow && (
        <ShowDetails
          isOpen={activeModal === "showDetails"}
          show={selectedShow}
          onClose={handleModalClose}
          onUpdate={handleShowUpdates}
        />
      )}
    </div>
  );
}
