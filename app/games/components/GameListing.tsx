"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { GameProps, IGDBInitProps, SortConfig } from "@/types/game";
// hooks
import { useSortGames } from "@/app/games/hooks/useSortGames";
import { useGameData } from "@/app/games/hooks/useGameData";
// components
import { AddGame } from "./addGame/AddGame";
import { GameDetails } from "./GameDetails";
// utils and ui components
import { formatDateShort, getStatusBorderColor } from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";

export default function GameList() {
  //
  const { games, addGame, updateGame, deleteGame, isProcessingGame } =
    useGameData();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const sortedGames = useSortGames(games, sortConfig);

  //
  const [selectedGame, setSelectedGame] = useState<GameProps | null>(null);
  const [titleToAdd, setTitleToAdd] = useState<{
    dlcIndex: number;
    mainTitle: string;
    dlcs: IGDBInitProps[];
  } | null>(null);
  const [activeModal, setActiveModal] = useState<
    "gameDetails" | "addGame" | null
  >(null);

  const showDlc = useCallback(
    (targetIgdbId: number, dlcIndex: number) => {
      if (targetIgdbId) {
        // !NEEDS TO MAKE THIS CALL WITH THE ENTIRE DB
        const targetGame = games.find((game) => game.igdbId === targetIgdbId);

        if (targetGame) {
          setSelectedGame(targetGame);
        } else if (selectedGame && selectedGame.dlcs) {
          let mainTitle;
          if (dlcIndex === 1) {
            mainTitle = selectedGame.title;
          } else {
            mainTitle = selectedGame.mainTitle;
          }
          // need to call external API
          setTitleToAdd({
            dlcIndex: dlcIndex,
            mainTitle: mainTitle || "",
            dlcs: selectedGame.dlcs,
          });
          setActiveModal("addGame");
        }
        return;
      }
    },
    [games, selectedGame]
  );

  const handleGameUpdates = useCallback(
    async (
      gameId: number,
      updates?: Partial<GameProps>,
      shouldDelete?: boolean
    ) => {
      if (updates) {
        if (selectedGame?.id === gameId) {
          setSelectedGame({ ...selectedGame, ...updates });
        }
        updateGame(gameId, updates);
      } else if (shouldDelete) {
        await deleteGame(gameId);
      }
    },
    [deleteGame, selectedGame, updateGame]
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
    setTitleToAdd(null);
    setSelectedGame(null);
  }, []);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setActiveModal("addGame");
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
          {isProcessingGame && (
            <Loading customStyle={"mt-72 h-12 w-12 border-gray-400"} text="" />
          )}
        </div>
        {!isProcessingGame && sortedGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 italic text-lg">
              No games yet — add one!
            </p>
          </div>
        )}
        {/* LISTING */}
        {!isProcessingGame &&
          sortedGames.map((game, index) => (
            <div
              key={game.id}
              className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
                game.status
              )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
                index === 0 ? "pt-1.5 rounded-bl-none" : "rounded-l-none"
              } 
              ${index === sortedGames.length - 1 && "rounded-bl-md"}  
                hover:cursor-pointer`}
              onClick={() => {
                setActiveModal("gameDetails");
                setSelectedGame(game);
              }}
            >
              <span className="font-medium text-zinc-300 text-sm">
                {index + 1}
              </span>
              <div className="w-12.5 h-18">
                {game.posterUrl !== undefined ? (
                  <Image
                    src={game.posterUrl}
                    alt={game.title || "Untitled"}
                    width={1920}
                    height={1080}
                    priority
                    className="w-full object rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-zinc-400 text-[70%] group-hover:text-emerald-400 flex gap-1">
                  {game.mainTitle ? (
                    <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden flex-shrink">
                      {game.mainTitle} ᭡
                    </span>
                  ) : (
                    ""
                  )}
                </span>
                <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-emerald-400 transition-colors duration-200 truncate max-w-53">
                  {game.title || "-"}
                </span>
              </div>
              <span className="text-center font-semibold text-zinc-300 text-sm">
                {game.score || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate">
                {game.status === "Completed"
                  ? formatDateShort(game.dateCompleted) || "?"
                  : "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm truncate">
                {game.studio || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate pl-0.5">
                {game.dateReleased || "-"}
              </span>
              <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center">
                {game.note || "No notes"}
              </span>
            </div>
          ))}
      </div>
      {/* ADD BUTTON */}
      <div className="fixed lg:bottom-10 lg:right-12 bottom-4 right-4 z-10">
        <button
          onClick={() => setActiveModal("addGame")}
          className="bg-emerald-700 hover:bg-emerald-600 p-4.5 rounded-full shadow-lg shadow-emerald-700/20 hover:shadow-emerald-500/30 transition-all duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
        </button>
        <AddGame
          isOpen={activeModal === "addGame"}
          onClose={handleModalClose}
          existingGames={games}
          onAddGame={addGame}
          titleFromAbove={titleToAdd}
        />
      </div>
      {/* GAME DETAILS */}
      {selectedGame && (
        <GameDetails
          isOpen={activeModal === "gameDetails"}
          game={selectedGame}
          onClose={handleModalClose}
          onUpdate={handleGameUpdates}
          showDlc={showDlc}
        />
      )}
    </div>
  );
}
