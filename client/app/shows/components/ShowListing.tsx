"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { ShowProps, SortConfig } from "@/types/show";
// hooks
import { useSortShows } from "@/app/shows/hooks/useSortShow";
import { useShowData } from "@/app/shows/hooks/useShowData";
// components
import { AddShow } from "./addShow/AddShow";
import { ShowDetails } from "./ShowDetails";
// utils and ui components
import { formatDateShort, getStatusBorderColor } from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";

export default function ShowList() {
  //
  const { shows, addShow, updateShow, deleteShow, isProcessingShow } =
    useShowData();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const sortedShows = useSortShows(shows, sortConfig);
  //
  const [selectedShow, setSelectedShow] = useState<ShowProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "showDetails" | "addShow" | null
  >(null);

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

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setTitleToUse("");
    setSelectedShow(null);
  }, []);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setActiveModal("addShow");
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

  return (
    <div className="min-h-screen">
      <div className="w-full md:w-[70%] lg:w-[60%] mx-auto">
        {/* HEADING */}
        <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
          <span className="font-semibold text-zinc-300 text-sm">#</span>
          <span className="font-semibold text-zinc-300 text-sm">Cover</span>
          {/* TITLE */}
          <div
            className="flex justify-start items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("title")}
          >
            <span className="font-semibold text-zinc-300 text-sm">Title</span>
            {sortConfig?.type === "title" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* SCORE */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("score")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "score" ? "ml-4" : ""
              }`}
            >
              Score
            </span>
            {sortConfig?.type === "score" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* DATE COMPLETED */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("dateCompleted")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "dateCompleted" ? "ml-4" : ""
              }`}
            >
              Completed
            </span>
            {sortConfig?.type === "dateCompleted" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* STUDIO */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("studio")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "studio" ? "ml-4" : ""
              }`}
            >
              Studio
            </span>
            {sortConfig?.type === "studio" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* DATE RELEASED */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("dateReleased")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "dateReleased" ? "ml-4" : ""
              }`}
            >
              Released
            </span>
            {sortConfig?.type === "dateReleased" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
            Notes
          </span>
        </div>
        {/* LOADER */}
        <div className="relative bg-black/20 backdrop-blur-lg">
          {isProcessingShow && (
            <Loading customStyle={"mt-72 h-12 w-12 border-gray-400"} text="" />
          )}
        </div>
        {!isProcessingShow && sortedShows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 italic text-lg">
              No shows yet — add one above!
            </p>
          </div>
        )}
        {/* LISTING */}
        {!isProcessingShow &&
          sortedShows.map((show, index) => (
            <div
              key={show.id}
              className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-950/40 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
                show.status
              )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
                index === 0 ? "pt-1.5 rounded-bl-none" : "rounded-l-none"
              } hover:cursor-pointer`}
              onClick={() => {
                setActiveModal("showDetails");
                setSelectedShow(show);
              }}
            >
              <span className="font-medium text-zinc-300 text-sm">
                {index + 1}
              </span>
              <div className="w-12.5 h-18">
                {show.posterUrl !== undefined ? (
                  <Image
                    src={show.posterUrl}
                    alt={show.title || "Untitled"}
                    width={50}
                    height={75}
                    priority
                    className="object-fill rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-emerald-400 transition-colors duration-200 truncate max-w-53">
                  {show.title || "-"}
                </span>
              </div>
              <span className="text-center font-semibold text-zinc-300 text-sm">
                {show.score || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate">
                {show.status === "Completed"
                  ? formatDateShort(show.dateCompleted) || "?"
                  : "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm truncate">
                {show.studio || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate pl-0.5">
                {show.dateReleased || "-"}
              </span>
              <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center">
                {show.note || "No notes"}
              </span>
            </div>
          ))}
      </div>
      {/* ADD BUTTON */}
      <div className="fixed bottom-10 right-12 z-10">
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
