"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Gamepad2 } from "lucide-react";
//
import { GameProps, IGDBInitProps, IGDBProps } from "@/types/game";
//
import {
  mapIGDBDataToGame,
  mapIGDBDlcsDataToGame,
  resetGameValues,
} from "@/app/games/utils/gameMapping";
//
import { GameDetails } from "../GameDetails";
import { ShowMultGames } from "./ShowMultGames";
import { ManualAddGame } from "./ManualAddGame";
//
import { useGameSearch } from "@/app/games/hooks/useGameSearch";

interface AddGameProps {
  isOpen: boolean;
  onClose: () => void;
  existingGames: GameProps[];
  onAddGame: (game: GameProps) => void;
  titleFromAbove?: {
    dlcIndex: number;
    mainTitle: string;
    dlcs: IGDBInitProps[];
  } | null;
}

const GAMELIMIT = 10;

export function AddGame({
  isOpen,
  onClose,
  onAddGame,
  titleFromAbove,
}: AddGameProps) {
  //failure reasons && their fixes -- for user
  const [failedReason, setFailedReason] = useState("");
  //
  const [isAddManual, setIsAddManual] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "gameDetails" | "multOptions" | "manualAdd" | null
  >(null);
  //
  const titleToSearch = useRef<HTMLInputElement>(null);
  const [isDupTitle, setIsDupTitle] = useState(false);
  //
  const [allNewGames, setAllNewGames] = useState<IGDBProps[]>([]);
  const [newGame, setNewGame] = useState<Partial<GameProps>>({});
  const [backdropUrls, setBackdropUrls] = useState<string[]>([]);
  const [backdropIndex, setBackdropIndex] = useState(0);
  //
  const { searchForGame, searchForGameDlc, isGameSearching } = useGameSearch();

  const reset = useCallback(() => {
    setFailedReason("");
    setIsDupTitle(false);
    setIsAddManual(false);
    //
    setBackdropUrls([]);
    setBackdropIndex(0);
    //
    setActiveModal(null);
    setAllNewGames([]);
    setNewGame({});
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
  }, []);

  const handleTitleSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;
    //
    const response = await searchForGame(titleSearching, GAMELIMIT);
    if (response && "isDuplicate" in response) {
      return {
        isDuplicate: true,
        title: response.title,
      };
    }
    const mainGame = response?.[0];
    if (!mainGame) return null;
    //
    setBackdropUrls(mainGame.screenshot_urls?.map((ss) => ss.ss_url) || []);
    setNewGame({ ...mapIGDBDataToGame(mainGame), status: "Playing" });
    setAllNewGames(response);
    return {
      title: mainGame.title,
      igdbId: mainGame.igdbId,
    };
  }, [searchForGame]);

  const handleGameSearch = useCallback(async () => {
    setActiveModal("gameDetails");
    //
    const response = await handleTitleSearch();
    // dup logic --- NEEDS TO BE ABOVE EMPTY LOGIC CAUSE REPSONSE IS EMPTY
    if (response && "isDuplicate" in response) {
      setFailedReason(`Already Have Game: ${response.title}`);
      setIsDupTitle(true);
      setActiveModal(null);
      return;
    }
    // empty logic
    if (!response?.igdbId || !response.title) {
      setFailedReason("Could Not Find Game.");
      setIsAddManual(true);
      setActiveModal(null);
      return;
    }
  }, [handleTitleSearch]);

  const handleDlcTitleSearch = useCallback(
    async (igdbId: number) => {
      // make call
      const response = await searchForGameDlc(igdbId);
      if (response && "isDuplicate" in response) {
        return {
          isDuplicate: true,
          title: response.title,
        };
      }
      const mainDlc = response?.[0];
      if (!mainDlc) return null;
      //
      const mappedData = mapIGDBDlcsDataToGame(
        mainDlc,
        titleFromAbove?.mainTitle || ""
      );
      setBackdropUrls(mainDlc.screenshot_urls?.map((ss) => ss.ss_url) || []);
      setNewGame((prev) => ({
        ...prev,
        ...mappedData,
        status: "Playing",
      }));
    },
    [searchForGameDlc, titleFromAbove]
  );

  const handleDlcSearch = useCallback(async () => {
    setActiveModal("gameDetails");
    //
    const selectedDlc = titleFromAbove?.dlcs[titleFromAbove.dlcIndex];
    const { igdbId, title } = {
      igdbId: selectedDlc?.id,
      title: selectedDlc?.name,
    };
    if (!igdbId || !title) {
      setFailedReason("igdbId error for dlc details.");
      setIsAddManual(true);
      setActiveModal(null);
      return;
    }
    //
    const response = await handleDlcTitleSearch(igdbId);
    //check for duplicate
    if (response && "isDuplicate" in response) {
      setFailedReason(`Already Have Game: ${response.title}`);
      setIsDupTitle(true);
      setActiveModal(null);
      return;
    }
    setNewGame((prev) => ({
      ...prev,
      ...{
        mainTitle: titleFromAbove?.mainTitle,
        dlcIndex: titleFromAbove?.dlcIndex,
        dlcs: titleFromAbove?.dlcs,
      },
    }));
  }, [titleFromAbove, handleDlcTitleSearch]);

  const handlePickFromMultGames = useCallback((game: IGDBProps) => {
    try {
      setNewGame({ ...mapIGDBDataToGame(game), status: "Playing" });
    } finally {
      setActiveModal("gameDetails");
    }
  }, []);

  const handleGameDetailsUpdates = useCallback(
    async (
      _gameId: number,
      updates?: Partial<GameProps>,
      showMore?: boolean
    ) => {
      if (showMore) {
        setActiveModal("multOptions");
        return;
      }
      setNewGame((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleGameAdd = async () => {
    // double check not adding duplicate
    if (newGame.igdbId && isDupTitle) {
      return;
    }
    //
    let isStatus = newGame.status;
    if (!isStatus) {
      isStatus = "Playing";
    }
    const finalGame = {
      ...newGame,
      backdropUrl: backdropUrls[backdropIndex],
      status: isStatus,
    };
    onAddGame(finalGame as GameProps);
    onClose();
  };

  const handleGameDetailsClose = () => {
    reset();
    setActiveModal(null);
    if (titleFromAbove) {
      onClose();
    }
  };

  const handleMultOptionClose = useCallback((action: "manualAdd" | null) => {
    switch (action) {
      case "manualAdd":
        setNewGame((prev) => resetGameValues(prev));
        setActiveModal("manualAdd");
        return;
      default:
        setActiveModal("gameDetails");
        return;
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleGameSearch();
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

  // for when to search game without modal
  useEffect(() => {
    if (titleFromAbove) {
      handleDlcSearch();
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
      {/* maybe not allow user to close modal as new game coming? */}
      <div className="fixed inset-0" onClick={onClose} />
      {!titleFromAbove ? (
        <div className="bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
          <h2 className="text-xl font-semibold mb-4 text-zinc-100 flex justify-center items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            Search for New Game
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              ref={titleToSearch}
              placeholder="Search for game..."
              onKeyDown={handleKeyPress}
              onInput={eraseErrMsg}
              disabled={isGameSearching}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
            />
          </div>
          <div className="flex justify-between mx-2">
            {failedReason && !isGameSearching && (
              <div className="mt-3 text-zinc-400 text-sm">{failedReason}</div>
            )}
            {isAddManual && !isGameSearching && (
              <button
                className="mt-3 text-zinc-400 text-sm hover:cursor-pointer underline"
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
      {activeModal === "gameDetails" && (
        <GameDetails
          isOpen={activeModal === "gameDetails"}
          game={newGame as GameProps}
          onClose={handleGameDetailsClose}
          onUpdate={handleGameDetailsUpdates}
          addGame={handleGameAdd}
          isLoading={{
            isTrue: isGameSearching,
            style: "h-8 w-8 border-emerald-400",
            text: "Searching...",
          }}
          backdropUrls={backdropUrls}
          backdropIndex={backdropIndex}
          updateBackdropIndex={(newIndex: number) => setBackdropIndex(newIndex)}
        />
      )}
      {activeModal === "multOptions" && (
        <ShowMultGames
          isOpen={activeModal === "multOptions"}
          onClose={handleMultOptionClose}
          games={allNewGames}
          prompt={titleToSearch.current?.value || ""}
          onClickedGame={handlePickFromMultGames}
          isLoading={isGameSearching}
        />
      )}
      {activeModal === "manualAdd" && (
        <ManualAddGame
          isOpen={activeModal === "manualAdd"}
          onClose={() => setActiveModal(null)}
          game={newGame}
          onUpdate={(updates: Partial<GameProps>) =>
            setNewGame((prev) => ({ ...prev, ...updates }))
          }
          addGame={handleGameAdd}
        />
      )}
    </div>
  );
}
