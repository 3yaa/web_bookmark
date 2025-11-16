import Image from "next/image";
import {
  SlidersHorizontal,
  ChartNoAxesColumn,
  Settings2,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";
// utils and ui components
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { ShowProps, SortConfig } from "@/types/show";
import { calcCurProgress } from "../../utils/progressCalc";
import React, { useState } from "react";
import { MediaStatus } from "@/types/media";

interface MobileListingProps {
  shows: ShowProps[];
  isProcessingShow: boolean;
  sortConfig: SortConfig | null;
  curStatusFilter: MediaStatus | null;
  onShowClicked: (show: ShowProps) => void;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onStatusFilter: (status: MediaStatus) => void;
}

export default function MobileListing({
  shows,
  isProcessingShow,
  sortConfig,
  curStatusFilter,
  onSortConfig,
  onShowClicked,
  onStatusFilter,
}: MobileListingProps) {
  const [openSortOption, setOpenSortOption] = useState(false);
  const [openStatusOption, setOpenStatusOption] = useState(false);

  const handleShowClicked = (show: ShowProps) => {
    if (openSortOption || openStatusOption) {
      setOpenSortOption(false);
      setOpenStatusOption(false);
      return;
    }
    onShowClicked(show);
  };

  // const handleOptionClose = () => {
  //   if (openSortOption || openStatusOption) {
  //     setOpenSortOption(false);
  //     setOpenStatusOption(false);
  //   }
  // };

  return (
    <div className="w-full mx-auto font-inter tracking-tight">
      {/* HEADING */}
      <div className="sticky top-0 z-10 bg-zinc-900/35 shadow-lg border-b border-zinc-700/20 select-none flex justify-between items-center rounded-b-md px-3">
        {/* STATUS FILTER */}
        <div
          className={`p-3 ${
            openStatusOption ? "bg-zinc-800/60 rounded-md" : ""
          }`}
        >
          <Settings2
            onClick={() => {
              setOpenStatusOption(!openStatusOption);
              setOpenSortOption(false);
            }}
            className="text-zinc-400 w-5 h-5 transition-colors"
          />
          {/* STATUS FILTER OPTIONS */}
          {openStatusOption && (
            <div className="fixed z-10 left-3 bg-zinc-900 border border-zinc-700/40 rounded-md shadow-lg mt-2 min-w-[160px]">
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => {
                  onStatusFilter("Want to Watch");
                  setOpenStatusOption(false);
                }}
              >
                <span>Want to Watch</span>
                {curStatusFilter === "Want to Watch" ? (
                  <div className="relative w-4 h-4">
                    <Circle className="w-4 h-4 text-slate-500 absolute" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full absolute top-1 left-1" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600" />
                )}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => {
                  onStatusFilter("Watching");
                  setOpenStatusOption(false);
                }}
              >
                <span>Watching</span>
                {curStatusFilter === "Watching" ? (
                  <div className="relative w-4 h-4">
                    <Circle className="w-4 h-4 text-slate-500 absolute" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full absolute top-1 left-1" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600" />
                )}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => {
                  onStatusFilter("Completed");
                  setOpenStatusOption(false);
                }}
              >
                <span>Completed</span>
                {curStatusFilter === "Completed" ? (
                  <div className="relative w-4 h-4">
                    <Circle className="w-4 h-4 text-slate-500 absolute" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full absolute top-1 left-1" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600" />
                )}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => {
                  onStatusFilter("Dropped");
                  setOpenStatusOption(false);
                }}
              >
                <span>Dropped</span>
                {curStatusFilter === "Dropped" ? (
                  <div className="relative w-4 h-4">
                    <Circle className="w-4 h-4 text-slate-500 absolute" />
                    <div className="w-2 h-2 bg-slate-500 rounded-full absolute top-1 left-1" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600" />
                )}
              </div>
            </div>
          )}
        </div>
        {/* STAT */}
        <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
          <ChartNoAxesColumn className="w-4 h-4 text-slate-500" />
          <span>{shows.length} Entries</span>
        </div>
        {/* SORT */}
        <div
          className={`p-3 ${openSortOption ? "bg-zinc-800/60 rounded-md" : ""}`}
        >
          <SlidersHorizontal
            onClick={() => {
              setOpenSortOption(!openSortOption);
              setOpenStatusOption(false);
            }}
            className="text-zinc-400 w-5 h-5 transition-colors"
          />
          {/* SORT OPTIONS */}
          {openSortOption && (
            <div className="fixed z-10 right-3 bg-zinc-900 border border-zinc-700/40 rounded-md shadow-lg mt-2 min-w-[165px]">
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => onSortConfig("title")}
              >
                <span>Title</span>
                {sortConfig?.type === "title" &&
                  (sortConfig?.order === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => onSortConfig("score")}
              >
                <span>Score</span>
                {sortConfig?.type === "score" &&
                  (sortConfig?.order === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => onSortConfig("studio")}
              >
                <span>Studio</span>
                {sortConfig?.type === "studio" &&
                  (sortConfig?.order === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors border-b-1 border-zinc-800"
                onClick={() => onSortConfig("dateReleased")}
              >
                <span>Date Released</span>
                {sortConfig?.type === "dateReleased" &&
                  (sortConfig?.order === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2 text-zinc-300 text-md transition-colors rounded-b-md"
                onClick={() => onSortConfig("dateCompleted")}
              >
                <span>Date Completed</span>
                {sortConfig?.type === "dateCompleted" &&
                  (sortConfig?.order === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* LOADER */}
      <div className="relative bg-black/20">
        {isProcessingShow && (
          <Loading customStyle="mt-72 h-12 w-12 border-zinc-500/40" text="" />
        )}
      </div>
      {/* EMPTY */}
      {!isProcessingShow && shows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 italic text-lg">
            No shows yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingShow &&
        shows.map((show) => (
          <div
            key={show.id}
            className={`mx-auto flex bg-zinc-900/35 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm rounded-md border-b border-b-zinc-700/20`}
            onClick={() => handleShowClicked(show)}
          >
            <div className="w-30 overflow-hidden rounded-md shadow-sm shadow-black/40">
              {show.posterUrl ? (
                <Image
                  src={show.posterUrl}
                  alt={show.title || "Untitled"}
                  width={100}
                  height={75}
                  priority
                  className="object-fill w-full h-full rounded-md border border-zinc-700/40"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
              )}
            </div>
            <div className="pl-3 pr-5 pt-3 flex flex-col w-full">
              {/* TITLE/SCORE */}
              <div className="flex justify-between items-start">
                <span className="text-zinc-200 font-semibold text-base leading-tight max-w-52 truncate">
                  {show.title || "-"}
                </span>
                <span className="text-zinc-400 text-sm font-semibold bg-zinc-800/60 px-2.5 py-1 rounded-md shadow-inner shadow-black/40 -mt-1.5">
                  {show.score || "-"}
                </span>
              </div>

              {/* STUDIO/RELEASE DATE */}
              <div className="text-zinc-500 text-xs font-medium flex space-x-1 pt-1">
                <span className="truncate max-w-35">{show.studio || "-"},</span>
                <span>{show.dateReleased || "-"}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                {/* COMPLETION DATE */}
                <span className="text-zinc-500 text-[0.65rem] font-medium mt-1">
                  {formatDateShort(show.dateCompleted)}
                </span>

                {/* SEASON / EPISODES */}
                <div className="text-zinc-400 text-xs font-medium mb-0.5">
                  <span className="pr-1">
                    S{show.curSeasonIndex + 1 || "-"}
                  </span>
                  <span>Ep {show.curEpisode || "-"}/</span>
                  {show.seasons?.[show.curSeasonIndex]?.episode_count ? (
                    <>
                      <span>
                        {show.seasons[show.curSeasonIndex].episode_count}
                      </span>
                    </>
                  ) : (
                    0
                  )}
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-1.5 w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden">
                <div
                  className={`${getStatusBg(
                    show.status
                  )} h-1.5 transition-all duration-500 ease-out rounded-md`}
                  style={{
                    width: `${
                      show.seasons?.[show.curSeasonIndex]?.episode_count
                        ? calcCurProgress(
                            show.seasons,
                            show.curSeasonIndex,
                            show.curEpisode
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              {/* NOTES */}
              <p className="pt-1 text-zinc-500 text-sm line-clamp-2 whitespace-normal overflow-hidden leading-snug font-medium flex items-center justify-center text-center min-h-[2.5rem]">
                <span className="line-clamp-2">{show.note || "No notes"}</span>
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
