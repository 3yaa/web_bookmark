"use client";
import { useState } from "react";
import Image from "next/image";
//
import { GameProps } from "@/types/game";
import {
  formatDateShort,
  getStatusBorderGradient,
} from "@/utils/formattingUtils";
import { statusOptions, scoreOptions } from "@/utils/dropDownDetails";
//
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { Loading } from "@/app/components/ui/Loading";
import { Trash2, Plus, X, ChevronsUp } from "lucide-react";
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
}

export function GameDetails({
  isOpen,
  onClose,
  game,
  onUpdate,
  addGame,
  isLoading,
  showDlc,
}: GameDetailsProps) {
  const [localNote, setLocalNote] = useState(game.note || "");

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

  const openGameDlcs = (dir: string) => {
    if (!showDlc) return;
    let targetIgdbId;
    let dlcIndex;
    if (game.dlcs) {
      if (dir === "next" && game.dlcIndex < game.dlcs.length) {
        dlcIndex = game.dlcIndex + 1;
        targetIgdbId = game.dlcs[dlcIndex].id;
      } else {
        dlcIndex = game.dlcIndex - 1;
        targetIgdbId = game.dlcs[dlcIndex].id;
      }
    }
    //
    if (targetIgdbId && dlcIndex !== undefined) {
      showDlc(targetIgdbId, dlcIndex);
    }
  };

  const saveNote = () => {
    if (localNote !== game.note) {
      onUpdate(game.id, { note: localNote });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      saveNote();
      e.currentTarget.blur(); // Optional: remove focus
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNote(e.target.value);
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

  const handleAddGame = () => {
    if (!addGame) return;
    addGame();
    onClose();
  };

  const handleNeedYear = () => {
    const needYear = true;
    onUpdate(game.id, undefined, needYear);
  };

  const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
    //detects which side of the div was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const elementWidth = rect.width;
    const isRightSide = clickX > elementWidth / 2;

    //
    if (
      game.curBackdropIndex !== undefined &&
      game.backdropUrls !== undefined
    ) {
      let newCoverIndex = game.curBackdropIndex;
      if (isRightSide) {
        newCoverIndex = (game.curBackdropIndex + 1) % game.backdropUrls.length;
      } else {
        newCoverIndex =
          game.curBackdropIndex === 0
            ? game.backdropUrls.length - 1
            : game.curBackdropIndex - 1;
      }
      onUpdate(game.id, { curBackdropIndex: newCoverIndex });
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={handleModalClose} />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          game.status
        )} py-2 px-2 lg:min-w-[45%] lg:max-w-[45%]`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          {isLoading?.isTrue && (
            <Loading customStyle={isLoading.style} text={isLoading.text} />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl overflow-hidden`}>
            {/* ACTION BUTTONS */}
            {addGame ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                {/* ADD */}
                <button
                  className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
                  onClick={handleAddGame}
                  title={"Add Book"}
                >
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
                </button>
                {/* NEED YEAR */}
                <button
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer
                    transition-all group"
                  onClick={handleNeedYear}
                  title={"See More Options"}
                >
                  <ChevronsUp className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>
                {/* CLOSE BUTTON */}
                <button
                  className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
                  onClick={onClose}
                  title={"Close"}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/0 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group z-10"
                onClick={handleDelete}
                title={"Delete Game"}
              >
                <Trash2 className="w-4 h-4 text-gray-400/5 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}

            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg">
                {game.posterUrl !== undefined ? (
                  <>
                    <Image
                      src={game.posterUrl}
                      alt={game.title || "Untitled"}
                      width={248}
                      height={372}
                      className="min-w-62 min-h-93 object-fill"
                    />
                    <div
                      className="absolute inset-0 left-8.5 top-7 max-w-62 max-h-93"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.5) 100%)",
                      }}
                    />
                  </>
                ) : (
                  <div className="min-w-62 min-h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                )}
              </div>
              {/* RIGHT SIDE -- DETAILS */}
              <div
                className="flex flex-col flex-1 min-h-93 min-w-62 relative hover:cursor-pointer"
                onClick={
                  game.backdropUrls && game.backdropUrls?.length > 1
                    ? handleCoverChange
                    : undefined
                }
                title={
                  game.backdropUrls
                    ? `${game.curBackdropIndex}/${game.backdropUrls?.length}`
                    : ""
                }
              >
                {/* BACKDROP */}
                {game.backdropUrls && (
                  <div className="absolute -top-7 left-20 -right-25 h-[70%] -z-10 overflow-hidden rounded-2xl">
                    <div className="relative h-full">
                      <Image
                        src={game.backdropUrls[game.curBackdropIndex]}
                        alt="Backdrop"
                        fill
                        className="object-cover opacity-30"
                        style={{
                          objectPosition: "center -10px", // image positioning
                        }}
                      />
                      {/* HORIZONTAL */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(24,24,27,1) 0%, rgba(24,24,27,0.1) 30%, transparent 50%, rgba(24,24,27,0.2) 100%)",
                        }}
                      />
                      {/* VERTICAL GRADIENT */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0.8) 50%, rgba(24,24,27,1) 75%, rgba(24,24,27,1) 100%)",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                    game.mainTitle ? "justify-center" : "justify-center mt-12"
                  } flex-1`}
                >
                  {/* SERIES TITLE */}
                  {game.mainTitle && (
                    <span className="font-semibold text-zinc-100/80 text-xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-0">
                      {game.mainTitle}
                    </span>
                  )}
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
                      {game.title || "Untitled"}
                    </div>
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r ${getStatusBorderGradient(
                        game.status
                      )} to-zinc-800 rounded-full`}
                    ></div>
                  </div>
                  {/* DIRECTOR AND DATES */}
                  <div className="flex justify-start items-center gap-2 w-full mb-3">
                    <span className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 leading-6">
                      {game.studio || "Unknown Director"}
                    </span>
                    {/* ◎ ◈ ୭ ✿ ✧ */}
                    <div className="font-medium text-zinc-200/70 text-md leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {game.dateReleased || "Unknown"}
                    </span>
                    {game.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200/70 text-md leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDateShort(game.dateCompleted)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div></div>
                  {/* STATUS AND SCORE */}
                  <div className=" flex justify-start gap-4 mb-2.5 max-w-[94%]">
                    <div className="flex-[0.77] lg:min-w-[165px]">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={game.status}
                        onChange={handleStatusChange}
                        options={statusOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          game.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.24}
                      />
                    </div>
                    <div className="flex-[0.865] lg:min-w-[195px]">
                      <label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
                        Score
                      </label>
                      <Dropdown
                        value={game.score?.toString() || "-"}
                        onChange={(value) => {
                          onUpdate(game.id, { score: Number(value) });
                        }}
                        options={scoreOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          game.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.4}
                      />
                    </div>
                  </div>
                  {/* NOTES */}
                  <div className="space-y-1 mb-2">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Notes
                    </label>
                    <div className="bg-zinc-800/50 rounded-lg pl-3 pt-3 pr-1 pb-1.5 max-h-21.5 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200">
                      <AutoTextarea
                        value={localNote}
                        onChange={handleNoteChange}
                        onKeyDown={handleKeyDown}
                        onBlur={saveNote}
                        placeholder="Add your thoughts about this game..."
                        className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                {/* PREQUEL AND SEQUEL */}
                <div className="grid grid-cols-[1fr_3rem_1fr] pr-1.5 select-none w-full">
                  <div className="truncate text-left">
                    {game.dlcIndex - 1 >= 0 && game.dlcs !== undefined && (
                      <div
                        className={`text-sm text-zinc-400/80 ${
                          !addGame ? "hover:underline hover:cursor-pointer" : ""
                        }`}
                      >
                        <label className="text-xs font-medium text-zinc-400 block">
                          <span className="inline-flex items-center gap-1">
                            <span>←</span>
                            <span>Previous</span>
                          </span>
                        </label>
                        <span
                          onClick={() => {
                            if (!addGame) openGameDlcs("prev");
                          }}
                        >
                          {game.dlcs[game.dlcIndex - 1].name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-end">
                    {game.dlcIndex !== 0 && (
                      <label className="text-xs font-medium text-zinc-400/85 block">
                        {game.dlcIndex}
                      </label>
                    )}
                  </div>
                  <div className="truncate text-right">
                    {game.dlcs !== undefined &&
                      game.dlcIndex + 1 < game.dlcs?.length && (
                        <div
                          className={`text-sm text-zinc-400/80 ${
                            !addGame
                              ? "hover:underline hover:cursor-pointer"
                              : ""
                          }`}
                        >
                          <label className="text-xs font-medium text-zinc-400 block">
                            <span className="inline-flex items-center gap-1">
                              <span>Next</span>
                              <span>→</span>
                            </span>
                          </label>
                          <span
                            onClick={() => {
                              if (!addGame) openGameDlcs("next");
                            }}
                          >
                            {game.dlcs[game.dlcIndex + 1].name}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
