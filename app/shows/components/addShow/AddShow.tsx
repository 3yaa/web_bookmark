"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Tv } from "lucide-react";
//
import { ShowProps } from "@/types/show";
//
import { mapTMDBToShow, mapTMDBTVToShow } from "@/app/shows/utils/showMapping";
//
import { ShowDetails } from "../ShowDetailsHub";
import { ManualAddShow } from "./ManualAddShow";
//
import { useShowSearch } from "@/app/shows/hooks/useShowSearch";
interface AddShowProps {
  isOpen: boolean;
  onClose: () => void;
  existingShows: ShowProps[];
  onAddShow: (show: ShowProps) => void;
  titleFromAbove?: string;
}

export function AddShow({
  isOpen,
  onClose,
  onAddShow,
  titleFromAbove,
}: AddShowProps) {
  //failure reasons && their fixes -- for user
  const [failedReason, setFailedReason] = useState("");
  //
  const [isAddManual, setIsAddManual] = useState(false);
  const [needYear, setNeedYear] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "showDetails" | "manualAdd" | null
  >(null);
  //
  const titleToSearch = useRef<HTMLInputElement>(null);
  const yearToSearch = useRef<HTMLInputElement>(null);
  const [isDupTitle, setIsDupTitle] = useState(false);
  //
  const [newShow, setNewShow] = useState<Partial<ShowProps>>({});
  //
  const { searchForShow, searchForShowSeasonInfo, isShowSearching } =
    useShowSearch();

  const reset = useCallback(() => {
    setFailedReason("");
    setIsDupTitle(false);
    setIsAddManual(false);
    setNeedYear(false);
    //
    setActiveModal(null);
    setNewShow({});
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
    if (yearToSearch.current) {
      yearToSearch.current.value = "";
    }
  }, []);

  const handleTitleSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;
    const yearSearchingStr = yearToSearch.current?.value.trim();
    const yearSearching = yearSearchingStr
      ? parseInt(yearSearchingStr, 10)
      : undefined;
    //
    const showData = await searchForShow(titleSearching, yearSearching);
    if (showData && "isDuplicate" in showData) {
      return {
        isDuplicate: true,
        title: showData.title,
      };
    }
    if (!showData) return null;
    //format show
    setNewShow(mapTMDBToShow(showData));
    return {
      title: showData.title,
      tmdbId: showData.tmdbId,
    };
  }, [searchForShow]);

  const handleSeasonInfoSearch = useCallback(
    async (tmdbId: string) => {
      const seasonInfo = await searchForShowSeasonInfo(tmdbId);
      if (!seasonInfo) return null;
      setNewShow((prev) => ({
        ...prev,
        ...mapTMDBTVToShow(seasonInfo),
        status: "Want to Watch",
      }));
    },
    [searchForShowSeasonInfo]
  );

  const handleShowSearch = useCallback(async () => {
    setActiveModal("showDetails");
    // make call to open lib
    const response = await handleTitleSearch();
    // dup logic --- NEEDS TO BE ABOVE EMPTY LOGIC CAUSE REPSONSE IS EMPTY
    if (response && "isDuplicate" in response) {
      setFailedReason(`Already Have Show: ${response.title}`);
      setIsDupTitle(true);
      setActiveModal(null);
      return;
    }
    if (!response?.tmdbId || !response.title) {
      setFailedReason("Could Not Find Show.");
      setNeedYear(true);
      setIsAddManual(true);
      setActiveModal(null);
      return;
    }
    // search for season info
    if (response.tmdbId) await handleSeasonInfoSearch(response.tmdbId);
  }, [handleTitleSearch, handleSeasonInfoSearch]);

  const handleShowDetailsUpdates = useCallback(
    async (_id: number, updates?: Partial<ShowProps>, needYear?: boolean) => {
      if (needYear) {
        setActiveModal(null);
        setNeedYear(true);
        setTimeout(() => {
          yearToSearch.current?.focus();
        }, 0);
        return;
      }
      setNewShow((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleShowAdd = async () => {
    // double check not adding duplicate
    if (newShow.tmdbId && isDupTitle) {
      return;
    }
    //
    let isStatus = newShow.status;
    if (!isStatus) {
      isStatus = "Want to Watch";
    }
    const finalShow = {
      ...newShow,
      status: isStatus,
    };
    onAddShow(finalShow as ShowProps);
    onClose();
  };

  const handleShowDetailsClose = () => {
    reset();
    setActiveModal(null);
    if (titleFromAbove) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleShowSearch();
    }
  };

  const eraseErrMsg = () => {
    if (failedReason) {
      setFailedReason("");
      setIsAddManual(false);
      setIsDupTitle(false);
    }
  };

  //reset on both because sometimes when opening some ui artificate
  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  // for when to search show without modal
  useEffect(() => {
    if (titleFromAbove) {
      if (titleToSearch.current) {
        titleToSearch.current.value = titleFromAbove;
      }
      handleShowSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFromAbove]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    //
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      {!titleFromAbove || needYear ? (
        <div className="bg-linear-to-b from-zinc-950/80 to-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
          <h2 className="text-xl font-semibold mb-4 text-zinc-300/90 flex justify-center items-center gap-2">
            <Tv className="w-5 h-5 text-zinc-300/90" />
            Search for New Show
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              ref={titleToSearch}
              placeholder="Search for show..."
              onKeyDown={handleKeyPress}
              onInput={eraseErrMsg}
              disabled={isShowSearching}
              className="w-full bg-zinc-800/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-300 font-medium placeholder-zinc-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-900/50 outline-none transition-all duration-200 shadow-lg shadow-black/20"
            />
            {needYear && (
              <div className="">
                <input
                  type="number"
                  ref={yearToSearch}
                  placeholder="Release Year"
                  onKeyDown={handleKeyPress}
                  onInput={eraseErrMsg}
                  disabled={isShowSearching}
                  className="w-full bg-zinc-800/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-300 font-medium placeholder-zinc-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-900/50 outline-none transition-all duration-200"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mx-2">
            {failedReason && !isShowSearching && (
              <div className="mt-3 text-zinc-400 text-sm font-medium">
                {failedReason}
              </div>
            )}
            {isAddManual && !isShowSearching && (
              <button
                className="mt-3 text-zinc-400 font-medium text-sm hover:cursor-pointer underline transition-colors duration-200 hover:text-zinc-300/80 hover:scale-102"
                onClick={() => setActiveModal("manualAdd")}
              >
                Manual Add
              </button>
            )}
          </div>
        </div>
      ) : (
        <input
          type="text"
          ref={titleToSearch}
          disabled
          style={{ display: "none" }}
        />
      )}
      {activeModal === "showDetails" && (
        <ShowDetails
          isOpen={activeModal === "showDetails"}
          show={newShow as ShowProps}
          onClose={handleShowDetailsClose}
          onUpdate={handleShowDetailsUpdates}
          addShow={handleShowAdd}
          isLoading={{
            isTrue: isShowSearching,
            style: "h-8 w-8 border-emerald-400",
            text: "Searching...",
          }}
        />
      )}
      {activeModal === "manualAdd" && (
        <ManualAddShow
          isOpen={activeModal === "manualAdd"}
          onClose={() => setActiveModal(null)}
          show={newShow}
          onUpdate={(updates: Partial<ShowProps>) =>
            setNewShow((prev) => ({ ...prev, ...updates }))
          }
          addShow={handleShowAdd}
        />
      )}
    </div>
  );
}
