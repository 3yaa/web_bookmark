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
import { BackdropImageMobile } from "@/app/components/ui/BackdropMobile";
import { useNav } from "@/app/components/NavContext";

interface ShowMobileListingProps {
  shows: ShowProps[];
  isProcessingShow: boolean;
  sortConfig: SortConfig | null;
  curStatusFilter: MediaStatus | null;
  onShowClicked: (show: ShowProps) => void;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onStatusFilter: (status: MediaStatus) => void;
}

const ShowItem = React.memo(
  ({
    show,
    isNavOpen,
    onClick,
  }: {
    show: ShowProps;
    isNavOpen: boolean;
    onClick: (show: ShowProps) => void;
  }) => (
    <div
      key={show.id}
      className={`relative mx-auto flex bg-zinc-950 backdrop-blur-2xl shadow-sm rounded-md border-b border-b-zinc-700/20 ${
        isNavOpen ? "pointer-events-none" : ""
      }`}
      onClick={() => onClick(show)}
    >
      <div className="w-30 overflow-hidden rounded-md shadow-sm shadow-black/40">
        {show.posterUrl ? (
          <Image
            src={show.posterUrl}
            alt={show.title || "Untitled"}
            width={300}
            height={450}
            priority
            className="object-fill w-full h-full rounded-md border border-zinc-700/40"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
        )}
      </div>
      <div className="px-3 pt-3 flex flex-col w-full min-w-0">
        {/* BACKDROP */}
        {show.backdropUrl && (
          <BackdropImageMobile
            src={show.backdropUrl}
            width={1280}
            height={720}
          />
        )}
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
            <span className="pr-1">S{show.curSeasonIndex + 1 || "-"}</span>
            <span>Ep {show.curEpisode || "-"}/</span>
            {show.seasons?.[show.curSeasonIndex]?.episode_count ? (
              <>
                <span>{show.seasons[show.curSeasonIndex].episode_count}</span>
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
                      show.curEpisode,
                      show.status
                    )
                  : 0
              }%`,
            }}
          />
        </div>
        {/* NOTES */}
        <p className="text-zinc-500 text-sm line-clamp-2 overflow-hidden leading-snug font-medium flex items-center justify-center text-center min-h-8 w-full wrap-break-word mt-1.5">
          <span className="line-clamp-2">{show.note || "No notes"}</span>
        </p>
      </div>
    </div>
  )
);
ShowItem.displayName = "ShowItem";

export function ShowMobileListing({
  shows,
  isProcessingShow,
  sortConfig,
  curStatusFilter,
  onSortConfig,
  onShowClicked,
  onStatusFilter,
}: ShowMobileListingProps) {
  const { isNavOpen } = useNav();
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

  return (
    <div className="w-full mx-auto font-inter tracking-tight">
      {/* HEADING */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-zinc-900/35 backdrop-blur-xl shadow-lg border-b border-zinc-700/20 select-none flex justify-between items-center rounded-b-md px-3 will-change-transform">
        {/* STATUS FILTER */}
        <div
          className="relative py-3 px-5"
          onClick={() => {
            setOpenStatusOption(!openStatusOption);
            setOpenSortOption(false);
          }}
        >
          <div
            className={`
              relative z-20 transition-all duration-300 ease-out rounded-md
              ${openStatusOption ? "bg-zinc-800/60 p-2 -m-2" : ""}
            `}
          >
            <Settings2
              className={`
                w-5 h-5 transition-all duration-300 ease-out cursor-pointer
                ${
                  openStatusOption
                    ? "text-zinc-200 rotate-90 scale-110"
                    : "text-zinc-400 rotate-0 scale-100"
                }
              `}
            />
          </div>

          {/* STATUS FILTER OPTIONS */}
          <div
            className={`
              fixed left-2 mt-2 min-w-44 bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/40 rounded-lg shadow-2xl overflow-hidden
              origin-top-left z-10
              transition-all duration-300 ease-out
              ${
                openStatusOption
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }
            `}
          >
            {[
              { value: "Watching" as MediaStatus },
              { value: "Want to Watch" as MediaStatus },
              { value: "Completed" as MediaStatus },
              { value: "Dropped" as MediaStatus },
            ].map((status, index) => (
              <div
                key={status.value}
                className={`
                  flex items-center justify-between px-4 py-3 text-zinc-300 text-sm
                  transition-all duration-200 ease-out cursor-pointer
                  hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-98
                  ${index !== 3 ? "border-b border-zinc-800/60" : ""}
                  ${curStatusFilter === status.value ? "bg-zinc-800/40" : ""}
                `}
                style={{
                  transitionDelay: openStatusOption ? `${index * 30}ms` : "0ms",
                }}
                onClick={() => {
                  onStatusFilter(status.value);
                  setOpenStatusOption(false);
                }}
              >
                <span className="font-medium">{status.value}</span>
                <div
                  className={`
                  transition-all duration-200 ease-out
                  ${
                    curStatusFilter === status.value
                      ? "scale-100 opacity-100"
                      : "scale-75 opacity-40"
                  }
                `}
                >
                  {curStatusFilter === status.value ? (
                    <div className="relative w-4 h-4">
                      <Circle className="w-4 h-4 text-slate-400 absolute" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full absolute top-1 left-1 animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STAT */}
        <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
          <ChartNoAxesColumn className="w-4 h-4 text-slate-500" />
          <span>{shows.length} Entries</span>
        </div>

        {/* SORT */}
        <div
          className="relative py-3 px-5"
          onClick={() => {
            setOpenSortOption(!openSortOption);
            setOpenStatusOption(false);
          }}
        >
          <div
            className={`
              relative z-20 transition-all duration-300 ease-out rounded-md
              ${openSortOption ? "bg-zinc-800/60 p-2 -m-2" : ""}
            `}
          >
            <SlidersHorizontal
              className={`
                w-5 h-5 transition-all duration-300 ease-out cursor-pointer
                ${
                  openSortOption
                    ? "text-zinc-200 rotate-90 scale-110"
                    : "text-zinc-400 rotate-0 scale-100"
                }
              `}
            />
          </div>
          {/* SORT OPTIONS */}
          <div
            className={`
              fixed right-2 mt-2 min-w-48 bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/40 rounded-lg shadow-2xl overflow-hidden
              origin-top-right z-10
              transition-all duration-300 ease-out
              ${
                openSortOption
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }
            `}
          >
            {[
              { label: "Title", value: "title" as SortConfig["type"] },
              { label: "Score", value: "score" as SortConfig["type"] },
              { label: "Studio", value: "studio" as SortConfig["type"] },
              {
                label: "Date Released",
                value: "dateReleased" as SortConfig["type"],
              },
              {
                label: "Date Completed",
                value: "dateCompleted" as SortConfig["type"],
              },
            ].map((sort, index) => (
              <div
                key={sort.value}
                className={`
                  flex items-center justify-between px-4 py-3 text-zinc-300 text-sm
                  transition-all duration-200 ease-out cursor-pointer
                  hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-98
                  ${index !== 4 ? "border-b border-zinc-800/60" : ""}
                  ${sortConfig?.type === sort.value ? "bg-zinc-800/40" : ""}
                `}
                style={{
                  transitionDelay: openSortOption ? `${index * 30}ms` : "0ms",
                }}
                onClick={() => onSortConfig(sort.value)}
              >
                <span className="font-medium">{sort.label}</span>
                <div
                  className={`
                  transition-all duration-200 ease-out
                  ${
                    sortConfig?.type === sort.value
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }
                `}
                >
                  {sortConfig?.type === sort.value &&
                    (sortConfig?.order === "desc" ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-11" />
      {/* LOADER */}
      <div className="relative bg-black/20 backdrop-blur-xl">
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
          <ShowItem
            key={show.id}
            show={show}
            isNavOpen={isNavOpen}
            onClick={handleShowClicked}
          />
        ))}
    </div>
  );
}
