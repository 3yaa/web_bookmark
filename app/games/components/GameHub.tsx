"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Plus } from "lucide-react";
import { MediaStatus } from "@/types/media";
import { GameProps, IGDBInitProps, SortConfig } from "@/types/game";
// hooks
import { useSortGames } from "@/app/games/hooks/useSortGames";
import { useGameData } from "@/app/games/hooks/useGameData";
// components
import { AddGame } from "./addGame/AddGame";
import { GameDetails } from "./GameDetailsHub";
import { GameMobileListing } from "./listing/GameMobileListing";
import { GameDesktopListing } from "./listing/GameDesktopListing";

export default function GameList() {
  const { games, addGame, updateGame, deleteGame, isProcessingGame } =
    useGameData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  // delegation
  const [selectedGame, setSelectedGame] = useState<GameProps | null>(null);
  const [titleToAdd, setTitleToAdd] = useState<{
    dlcIndex: number;
    mainTitle: string;
    dlcs: IGDBInitProps[];
  } | null>(null);
  const [activeModal, setActiveModal] = useState<
    "gameDetails" | "addGame" | null
  >(null);

  // change ground truth
  const [isFilterPending, startTransition] = useTransition();
  const filteredGames = useMemo(() => {
    if (statusFilter) {
      return statusFilter
        ? games.filter((game) => game.status === statusFilter)
        : games;
    }
    return games;
  }, [games, statusFilter]);
  const sortedGames = useSortGames(filteredGames, sortConfig);

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
    setTitleToAdd(null);
    setSelectedGame(null);
  }, []);

  const handleGameClicked = useCallback((game: GameProps) => {
    setActiveModal("gameDetails");
    setSelectedGame(game);
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
      <div className="lg:block hidden">
        <GameDesktopListing
          games={sortedGames}
          isProcessingGame={isProcessingGame}
          sortConfig={sortConfig}
          onSortConfig={handleSortConfig}
          onGameClicked={handleGameClicked}
        />
      </div>
      <div className="block lg:hidden">
        <GameMobileListing
          games={sortedGames}
          isProcessingGame={isProcessingGame || isFilterPending}
          sortConfig={sortConfig}
          curStatusFilter={statusFilter}
          onGameClicked={handleGameClicked}
          onSortConfig={handleSortConfig}
          onStatusFilter={handleStatusFilterConfig}
        />
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
