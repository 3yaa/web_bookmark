import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
// utils and ui components
import {
  formatDateShort,
  getStatusBg,
  getStatusBorderColor,
} from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { ShowProps, SortConfig } from "@/types/show";
import React, { useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { calcCurProgress } from "../../utils/progressCalc";

interface ShowDesktopListingProps {
  shows: ShowProps[];
  isProcessingShow: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onShowClicked: (show: ShowProps) => void;
}

const ShowItem = React.memo(
  ({
    show,
    index,
    totalShows,
    onClick,
  }: {
    show: ShowProps;
    index: number;
    totalShows: number;
    onClick: (show: ShowProps) => void;
  }) => (
    <div
      key={show.id}
      className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
        show.status
      )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
        index === 0 ? "rounded-bl-none" : "rounded-l-none"
      } 
        ${index === totalShows - 1 && "rounded-bl-md"}  
        hover:cursor-pointer`}
      onClick={() => onClick(show)}
    >
      <span className="font-medium text-zinc-300 text-sm">{index + 1}</span>
      <div className="w-14 h-21">
        {show.posterUrl ? (
          <Image
            src={show.posterUrl}
            alt={show.title || "Untitled"}
            width={1280}
            height={720}
            priority
            className="w-full h-full object-fill rounded-sm"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30"></div>
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1 relative">
        <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-emerald-400 transition-colors duration-200 truncate max-w-53">
          {show.title || "-"}
        </span>
        <div className="absolute right-0 -bottom-8 text-zinc-400 text-[11px] font-medium mb-0.5 tracking-tight">
          S{show.curSeasonIndex + 1 || "-"} · E{show.curEpisode || "-"}/
          {show.seasons?.[show.curSeasonIndex]?.episode_count || 0}
        </div>
        <div className="absolute -bottom-2.5 left-0 w-full bg-zinc-800/80 rounded-md h-1 overflow-hidden">
          <div
            className={`${getStatusBg(
              show.status
            )} h-1 transition-all duration-500 ease-out rounded-md`}
            style={{
              width: `${
                show.seasons?.[show.curSeasonIndex]?.episode_count
                  ? calcCurProgress(
                      show.seasons,
                      show.curSeasonIndex,
                      show.curEpisode,
                      show.status
                    )
                  : 0
              }%`,
            }}
          />
        </div>
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
  )
);
ShowItem.displayName = "ShowItem";

export function ShowDesktopListing({
  shows,
  isProcessingShow,
  sortConfig,
  onSortConfig,
  onShowClicked,
}: ShowDesktopListingProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: shows.length,
    estimateSize: () => 88,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 88,
  });

  return (
    <div className="w-full md:w-[70%] lg:w-[60%] mx-auto">
      {/* HEADING */}
      <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
        <span className="font-semibold text-zinc-300 text-sm">#</span>
        <span className="font-semibold text-zinc-300 text-sm">Cover</span>
        {/* TITLE */}
        <div
          className="flex justify-start items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("title")}
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
          onClick={() => onSortConfig("score")}
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
          onClick={() => onSortConfig("dateCompleted")}
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
          onClick={() => onSortConfig("studio")}
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
          onClick={() => onSortConfig("dateReleased")}
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
      {isProcessingShow && (
        <div className="relative bg-black/20 backdrop-blur-lg">
          <Loading customStyle="mt-72 h-12 w-12 border-gray-400" text="" />
        </div>
      )}
      {!isProcessingShow && shows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 italic text-lg">
            No shows yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingShow && shows.length > 0 && (
        <div ref={parentRef} className="w-full">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const show = shows[virtualItem.index];
              return (
                <div
                  key={show.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ShowItem
                    show={show}
                    index={virtualItem.index}
                    totalShows={shows.length}
                    onClick={onShowClicked}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
