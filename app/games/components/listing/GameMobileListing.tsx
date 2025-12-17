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
import { GameProps, SortConfig } from "@/types/game";
import React, { useRef, useState } from "react";
import { MediaStatus } from "@/types/media";
import { BackdropImageMobile } from "@/app/components/ui/BackdropMobile";
import { useNav } from "@/app/components/NavContext";
import { useVirtualizer } from "@tanstack/react-virtual";

interface GameMobileListingProps {
  games: GameProps[];
  isProcessingGame: boolean;
  sortConfig: SortConfig | null;
  curStatusFilter: MediaStatus | null;
  onGameClicked: (game: GameProps) => void;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onStatusFilter: (status: MediaStatus) => void;
}

const GameItem = React.memo(
  ({
    game,
    isNavOpen,
    onClick,
  }: {
    game: GameProps;
    isNavOpen: boolean;
    onClick: (game: GameProps) => void;
  }) => (
    <div
      key={game.id}
      className={`relative mx-auto flex bg-zinc-950 backdrop-blur-2xl shadow-sm rounded-md border-b border-b-zinc-700/20 ${
        isNavOpen ? "pointer-events-none" : ""
      }`}
      onClick={() => onClick(game)}
    >
      <div className="w-30 overflow-hidden rounded-md shadow-sm shadow-black/40">
        {game.posterUrl ? (
          <Image
            src={game.posterUrl}
            alt={game.title || "Untitled"}
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
        {game.backdropUrl && (
          <BackdropImageMobile
            src={game.backdropUrl}
            width={1280}
            height={720}
          />
        )}
        {/* TITLE/SCORE */}
        <div className="flex justify-between items-start">
          <span className="text-zinc-200 font-semibold text-base leading-tight max-w-52 truncate">
            {game.title || "-"}
          </span>
          <span className="text-zinc-400 text-sm font-semibold bg-zinc-800/60 px-2.5 py-1 rounded-md shadow-inner shadow-black/40 -mt-1.5">
            {game.score || "-"}
          </span>
        </div>

        {/* STUDIO/RELEASE DATE */}
        <div className="text-zinc-500 text-xs font-medium flex space-x-1 pt-1">
          <span className="truncate max-w-35">{game.studio || "-"},</span>
          <span>{game.dateReleased || "-"}</span>
        </div>
        {/* COMPLETION DATE */}
        <div className={`${game.dateCompleted ? "-mt-1.5" : "pt-2.5"}`}>
          <span className="flex justify-end text-zinc-500 text-[0.65rem] font-medium">
            {formatDateShort(game.dateCompleted)}
          </span>
        </div>
        {/* STATUS BAR */}
        <div className="mt-1.5 w-full rounded-md h-1.5 overflow-hidden">
          <div
            className={`${getStatusBg(
              game.status
            )} h-1.5 transition-all duration-500 ease-out rounded-md`}
          />
        </div>
        {/* PREQUEL/SEQUEL */}
        <div
          className={`${
            game.dlcIndex !== 0 ? "grid grid-cols-[1fr_2rem_1fr] mt-1" : "mt-3"
          }`}
        >
          {/* PREQUEL */}
          <div className="truncate text-left">
            {game.dlcIndex - 1 >= 0 && game.dlcs !== undefined && (
              <div
                className={`flex gap-1 items-center text-[0.60rem] text-zinc-400/80`}
              >
                <span>←</span>
                <span className="truncate">
                  {game.dlcs[game.dlcIndex - 1].name}
                </span>
              </div>
            )}
          </div>
          {/* PLACEMENT */}
          <div className="flex justify-center items-end">
            {game.dlcIndex !== 0 && (
              <label className="text-[0.65rem] font-medium text-zinc-400/85">
                {game.dlcIndex}
              </label>
            )}
          </div>
          {/* SEQUEL */}
          <div className="text-right flex justify-end">
            {game.dlcs !== undefined &&
              game.dlcIndex + 1 < game.dlcs?.length && (
                <div
                  className={`flex gap-1 items-center text-[0.60rem] text-zinc-400/80`}
                >
                  <span className="truncate">
                    {game.dlcs[game.dlcIndex + 1].name}
                  </span>
                  <span>→</span>
                </div>
              )}
          </div>
        </div>
        {/* NOTES */}
        <p className="text-zinc-500 text-sm line-clamp-2 overflow-hidden leading-snug font-medium flex items-center justify-center text-center min-h-8 w-full wrap-break-word">
          <span className="line-clamp-2">{game.note || "No notes"}</span>
        </p>
      </div>
    </div>
  )
);
GameItem.displayName = "GameItem";

export function GameMobileListing({
  games,
  isProcessingGame,
  sortConfig,
  curStatusFilter,
  onSortConfig,
  onGameClicked,
  onStatusFilter,
}: GameMobileListingProps) {
  const { isNavOpen } = useNav();
  const [openSortOption, setOpenSortOption] = useState(false);
  const [openStatusOption, setOpenStatusOption] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: games.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 135.562, // height of each item in pixels
    overscan: 5, // render 5 extra items above/below viewport
  });

  const handleGameClicked = (game: GameProps) => {
    if (openSortOption || openStatusOption) {
      setOpenSortOption(false);
      setOpenStatusOption(false);
      return;
    }
    onGameClicked(game);
  };

  return (
    <div className="w-full mx-auto font-inter tracking-tight">
      {/* HEADING */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-zinc-900/35 backdrop-blur-xl shadow-lg border-b border-zinc-700/20 select-none flex justify-between items-center rounded-b-md px-3 will-change-transform pointer-events-none">
        {/* STATUS FILTER */}
        <div
          className="relative py-3 px-5 pointer-events-auto"
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
              { value: "Playing" as MediaStatus },
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
        <div className="flex items-center gap-1 text-slate-400 text-sm font-medium pointer-events-none">
          <ChartNoAxesColumn className="w-4 h-4 text-slate-500" />
          <span>{games.length} Entries</span>
        </div>

        {/* SORT */}
        <div
          className="relative py-3 px-5 pointer-events-auto"
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
        {isProcessingGame && (
          <Loading customStyle="mt-72 h-12 w-12 border-zinc-500/40" text="" />
        )}
      </div>
      {/* EMPTY */}
      {!isProcessingGame && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 italic text-lg">
            No games yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingGame && games.length > 0 && (
        <div
          ref={parentRef}
          className="w-full overflow-auto"
          style={{
            height: "calc(100vh - 44px)", // account for header
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const game = games[virtualItem.index];
              return (
                <div
                  key={game.id}
                  data-index={virtualItem.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <GameItem
                    game={game}
                    isNavOpen={isNavOpen}
                    onClick={handleGameClicked}
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
