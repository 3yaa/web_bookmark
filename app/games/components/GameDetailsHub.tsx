"use client";
import { GameProps } from "@/types/game";
import { useCallback, useEffect, useState } from "react";
import { GameDetailsDesktop } from "./detailViews/GameDetailsDesktop";

export type GameAction =
  | { type: "closeModal" }
  | { type: "deleteGame" }
  | { type: "changeStatus"; payload: "Playing" | "Completed" | "Dropped" }
  | { type: "changeScore"; payload: number }
  | { type: "changeNote"; payload: string }
  | { type: "saveNote" }
  | { type: "dlcNav"; payload: "next" | "prev" }
  | { type: "needYearField" }
  | { type: "changeCover"; payload: "next" | "prev" };

interface GameDetailsProps {
  game: GameProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    gameId: number,
    updates?: Partial<GameProps>,
    takeAction?: boolean
  ) => void;
  addGame?: () => void;
  showDlc?: (igdbId: number, dlcIndex: number) => void;
  //
  backdropUrls?: string[];
  backdropIndex?: number;
  updateBackdropIndex?: (newIndex: number) => void;
}

export function GameDetails({
  isOpen,
  onClose,
  game,
  onUpdate,
  addGame,
  isLoading,
  showDlc,
  backdropUrls,
  backdropIndex,
  updateBackdropIndex,
}: GameDetailsProps) {
  const [localNote, setLocalNote] = useState(game.note || "");

  const handleAction = (action: GameAction) => {
    switch (action.type) {
      // =========modal actions=============
      case "closeModal":
        handleModalClose();
        break;
      case "deleteGame":
        handleDelete();
        break;
      case "needYearField":
        handleNeedYear();
        break;
      // =========update actions=============
      case "changeStatus":
        handleStatusChange(action.payload);
        break;
      case "changeScore":
        onUpdate(game.id, { score: Number(action.payload) });
        break;
      case "changeNote":
        setLocalNote(action.payload);
        break;
      case "saveNote":
        handleSaveNote();
        break;
      case "changeCover":
        handleCoverChange(action.payload);
        break;
      // =========other actions=============
      case "dlcNav": // switches modal to DLC
        hanldeDlcOpen(action.payload);
        break;
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Playing" | "Completed";
    const statusLoad: Partial<GameProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    } else if (game.dateCompleted) {
      statusLoad.dateCompleted = null;
    }
    onUpdate(game.id, statusLoad);
  };

  const hanldeDlcOpen = (dir: string) => {
    if (!showDlc) return;
    let targetIgdbId;
    let dlcIndex;
    if (game.dlcs) {
      if (dir === "next" && game.dlcIndex < game.dlcs.length) {
        dlcIndex = game.dlcIndex + 1;
        targetIgdbId = game.dlcs[dlcIndex].id;
      } else if (dir === "prev") {
        dlcIndex = game.dlcIndex - 1;
        targetIgdbId = game.dlcs[dlcIndex].id;
      }
    }
    //
    if (targetIgdbId && dlcIndex !== undefined) {
      showDlc(targetIgdbId, dlcIndex);
    }
  };

  const handleSaveNote = () => {
    if (localNote !== game.note) {
      onUpdate(game.id, { note: localNote });
    }
  };

  const handleDelete = () => {
    onClose();
    const shouldDelete = true;
    onUpdate(game.id, undefined, shouldDelete);
  };

  const handleModalClose = () => {
    if (addGame) return;
    onClose();
  };

  const handleNeedYear = () => {
    const needYear = true;
    onUpdate(game.id, undefined, needYear);
  };

  const handleAddGame = useCallback(() => {
    if (!addGame) return;
    addGame();
    onClose();
  }, [addGame, onClose]);

  const handleCoverChange = (dir: string) => {
    if (!updateBackdropIndex || backdropIndex === undefined || !backdropUrls) {
      return;
    }
    //
    let newCoverIndex = backdropIndex;
    if (dir === "next") {
      newCoverIndex = (backdropIndex + 1) % backdropUrls.length;
    } else if (dir === "prev") {
      newCoverIndex =
        backdropIndex === 0 ? backdropUrls.length - 1 : backdropIndex - 1;
    }
    updateBackdropIndex(newCoverIndex);
  };

  useEffect(() => {
    const handleLeave = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter") {
        const activeElement = document.activeElement;
        const isInTextarea = activeElement?.tagName === "TEXTAREA";
        const isInInput = activeElement?.tagName === "INPUT";
        if (!isInTextarea && !isInInput) {
          handleAddGame();
        }
      }
    };
    //
    window.addEventListener("keydown", handleLeave);
    return () => window.removeEventListener("keydown", handleLeave);
  }, [onClose, handleAddGame]);

  if (!isOpen || !game) return null;

  return (
    <>
      <div className="lg:block hidden">
        <GameDetailsDesktop
          game={game}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingGame={!!addGame}
          onAddGame={handleAddGame}
          onAction={handleAction}
          backdropUrls={backdropUrls}
          backdropIndex={backdropIndex}
        />
      </div>
      <div className="block lg:hidden"></div>
    </>
  );
}
