"use client";
import { useCallback, useEffect, useState } from "react";
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

export default function ShowList() {
  const { shows, addShow, updateShow, deleteShow, isProcessingShow } =
    useShowData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  // delegation
  const [selectedShow, setSelectedShow] = useState<ShowProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "showDetails" | "addShow" | null
  >(null);
  //
  const sortedShows = useSortShows(shows, statusFilter, sortConfig);

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
    if (statusFilter === status) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
  };

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setTitleToUse("");
    setSelectedShow(null);
  }, []);

  const handleShowClicked = useCallback((show: ShowProps) => {
    setActiveModal("showDetails");
    setSelectedShow(show);
  }, []);

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
          isProcessingShow={isProcessingShow}
          sortConfig={sortConfig}
          onSortConfig={handleSortConfig}
          onShowClicked={handleShowClicked}
        />
      </div>
      <div className="block lg:hidden">
        <ShowMobileListing
          shows={sortedShows}
          isProcessingShow={isProcessingShow}
          sortConfig={sortConfig}
          curStatusFilter={statusFilter}
          onShowClicked={handleShowClicked}
          onSortConfig={handleSortConfig}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      {/* ADD BUTTON */}
      <div className="fixed lg:bottom-10 lg:right-12 bottom-4 right-4 z-10">
        <button
          onClick={() => setActiveModal("addShow")}
          className="bg-emerald-700 hover:bg-emerald-600 p-4.5 rounded-full shadow-lg shadow-emerald-700/20 hover:shadow-emerald-500/30 transition-all duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
        </button>
        <AddShow
          isOpen={activeModal === "addShow"}
          onClose={handleModalClose}
          existingShows={shows}
          onAddShow={addShow}
          titleFromAbove={titleToUse}
        />
      </div>
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
