"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { debounce } from "@/utils/debounce";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export default function GameList() {
  const { games, addGame, updateGame, deleteGame, isProcessingGame } =
    useGameData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
  //
  const isButtonsVisible = useScrollVisibility(30);

  // set deboucne
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300)
  ).current;
  // SEARCH
  const searchedGames = useMemo(() => {
    if (!debouncedQuery) return games;

    return games.filter((game) =>
      game.title.toLowerCase().trim().includes(debouncedQuery)
    );
  }, [games, debouncedQuery]);
  // FILTER
  const [isFilterPending, startTransition] = useTransition();
  const filteredGames = useMemo(() => {
    if (!statusFilter) return searchedGames;
    //
    return searchedGames.filter((game) => game.status === statusFilter);
  }, [searchedGames, statusFilter]);
  // SORT
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
    // wait a frame before clearing state
    requestAnimationFrame(() => {
      setTitleToAdd(null);
      setSelectedGame(null);
    });
  }, []);

  const handleGameClicked = useCallback((game: GameProps) => {
    setActiveModal("gameDetails");
    setSelectedGame(game);
  }, []);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value.toLowerCase().trim());
  };

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
          onSearchChange={handleSearchQueryChange}
          searchQuery={searchQuery}
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
      <div
        className={`fixed lg:bottom-8 lg:right-10 bottom-1 right-2 z-10
        lg:translate-y-0 transition-transform duration-300 ease-in-out
        ${isButtonsVisible ? "translate-y-0" : "translate-y-24"}`}
      >
        <button
          onClick={() => setActiveModal("addGame")}
          className="flex items-center justify-center w-14 h-14 lg:w-14 lg:h-14 rounded-full 
          bg-linear-to-br from-zinc-transparent to-zinc-800/60 
          hover:bg-linear-to-br hover:from-zinc-800/60 hover:to-transparent
          backdrop-blur-xl shadow-md shadow-zinc-800/60
          hover:scale-105 active:scale-95 
          transition-all duration-200 relative z-10 hover:cursor-pointer focus:outline-none"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
        </button>
      </div>
      <AddGame
        isOpen={activeModal === "addGame"}
        onClose={handleModalClose}
        existingGames={games}
        onAddGame={addGame}
        titleFromAbove={titleToAdd}
      />
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
