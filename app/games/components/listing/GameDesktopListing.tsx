import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
// utils and ui components
import {
  formatDateShort,
  getStatusBg,
  getStatusBorderColor,
} from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { GameProps, SortConfig } from "@/types/game";
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface GameDesktopListingProps {
  games: GameProps[];
  isProcessingGame: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onGameClicked: (game: GameProps) => void;
}

const GameItem = React.memo(
  ({
    game,
    index,
    totalGames,
    onClick,
  }: {
    game: GameProps;
    index: number;
    totalGames: number;
    onClick: (game: GameProps) => void;
  }) => (
    <div
      className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
        game.status
      )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
        index === 0 ? "rounded-bl-none" : "rounded-l-none"
      } 
        ${index === totalGames - 1 && "rounded-bl-md"}  
          hover:cursor-pointer`}
      onClick={() => onClick(game)}
    >
      <span className="font-medium text-zinc-300 text-sm">{index + 1}</span>
      <div className="w-14 h-21">
        {game.posterUrl ? (
          <Image
            src={game.posterUrl}
            alt={game.title || "Untitled"}
            width={1920}
            height={1080}
            priority
            className="w-full h-full object-fill rounded-sm"
          />
        ) : (
          <div className="w-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30"></div>
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1 relative">
        <span className="font-semibold text-zinc-400 text-[70%] group-hover:text-zinc-300 flex gap-1">
          {game.mainTitle ? (
            <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
              {game.mainTitle} ᭡
            </span>
          ) : (
            ""
          )}
        </span>
        <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-zinc-300 transition-colors duration-200 truncate max-w-53">
          {game.title || "-"}
        </span>
        {/* STATUS */}
        <div
          className={`absolute -bottom-2.5 left-0 w-full ${getStatusBg(
            game.status
          )} h-1 transition-all duration-500 ease-out rounded-md w-full`}
        />
      </div>
      <span className="flex items-center justify-center font-bold text-zinc-300 text-sm bg-linear-to-br from-zinc-800/80 to-zinc-900/90 mx-7.5 py-2 pb-1 rounded-lg shadow-lg shadow-black/20 border border-zinc-800/40">
        {game.score || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {game.status === "Completed"
          ? formatDateShort(game.dateCompleted) || "?"
          : "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {game.studio || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate pl-0.5">
        {game.dateReleased || "-"}
      </span>
      <span className="text-zinc-300/95 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center font-semibold group-hover:underline">
        {game.note || "No notes"}
      </span>
    </div>
  )
);
GameItem.displayName = "GameItem";

export function GameDesktopListing({
  games,
  isProcessingGame,
  sortConfig,
  onSortConfig,
  onGameClicked,
}: GameDesktopListingProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: games.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 88,
  });

  return (
    <div className="w-full md:w-[70%] lg:w-[60%] mx-auto flex flex-col h-screen">
      {/* HEADING */}
      <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
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
      {isProcessingGame && (
        <div className="relative bg-black/20 backdrop-blur-lg">
          <Loading customStyle="mt-72 h-12 w-12 border-gray-400" text="" />
        </div>
      )}
      {!isProcessingGame && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 italic text-lg">
            No games yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingGame && games.length > 0 && (
        <div ref={parentRef} className="w-full overflow-auto flex-1">
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
                  ref={rowVirtualizer.measureElement}
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
                    index={virtualItem.index}
                    totalGames={games.length}
                    onClick={onGameClicked}
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
