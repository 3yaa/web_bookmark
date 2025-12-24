import Image from "next/image";
import {
  formatDateShort,
  getStatusTextColor,
  getStatusBorderGradient,
} from "@/utils/formattingUtils";
import { showStatusOptions, scoreOptions } from "@/utils/dropDownDetails";
//
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { Loading } from "@/app/components/ui/Loading";
import { BackdropImage } from "@/app/components/ui/Backdrop";
import {
  Trash2,
  Plus,
  X,
  ChevronsUp,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { ShowProps } from "@/types/show";
import { ShowAction } from "../ShowDetailsHub";

interface ShowDesktopDetailsProps {
  show: ShowProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingShow: boolean;
  onAddShow: () => void;
  onAction: (action: ShowAction) => void;
  editingMode: { season: boolean; episode: boolean };
  inputValues: { season: number | ""; episode: number | "" };
}

export function ShowDesktopDetails({
  show,
  localNote,
  onClose,
  isLoading,
  addingShow,
  onAddShow,
  onAction,
  editingMode,
  inputValues,
}: ShowDesktopDetailsProps) {
  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAction({ type: "saveNote" });
      e.currentTarget.blur();
    }
  };

  const handleInputKeyDown = (key: string, type: "season" | "episode") => {
    if (key === "Enter") {
      onAction({
        type: type === "season" ? "submitSeasonInput" : "submitEpisodeInput",
      });
    } else if (key === "Escape") {
      onAction({
        type: type === "season" ? "clickSeasonInput" : "clickEpisodeInput",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-black/50 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div
        className="fixed inset-0"
        onClick={() => {
          onAction({ type: "closeModal" });
        }}
      />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-linear-to-b ${getStatusBorderGradient(
          show.status
        )} p-1.5 py-2 lg:min-w-215 lg:max-w-215`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-linear-to-br bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          {isLoading?.isTrue && (
            <Loading customStyle={isLoading.style} text={isLoading.text} />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl overflow-hidden`}>
            {/* ACTION BUTTONS */}
            {addingShow ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                {/* ADD */}
                <button
                  className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
                  onClick={onAddShow}
                  title={"Add Book"}
                >
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
                </button>
                {/* NEED YEAR */}
                <button
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer
                    transition-all group"
                  onClick={() => {
                    onAction({ type: "needYear" });
                  }}
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
                onClick={() => {
                  onAction({ type: "deleteShow" });
                }}
                title={"Delete Show"}
              >
                <Trash2 className="w-4 h-4 text-gray-400/5 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}

            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg select-none">
                {show.posterUrl !== undefined ? (
                  <>
                    <Image
                      src={show.posterUrl}
                      alt={show.title || "Untitled"}
                      width={1280}
                      height={720}
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
                  <div className="min-w-62 min-h-93 bg-linear-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                )}
              </div>
              {/* RIGHT SIDE -- DETAILS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62 relative">
                {/* BACKDROP */}
                {show.backdropUrl && (
                  <BackdropImage
                    src={show.backdropUrl}
                    width={1280}
                    height={720}
                  />
                )}
                <div className={`flex flex-col justify-center flex-1`}>
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
                      {show.title || "Untitled"}
                    </div>
                    <div
                      className={`w-full h-0.5 bg-linear-to-r ${getStatusBorderGradient(
                        show.status
                      )} to-zinc-800 rounded-full`}
                    ></div>
                  </div>
                  {/* STUDIO AND DATES */}
                  <div className="flex justify-start items-center gap-2 w-full mb-3">
                    <span className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 leading-6">
                      {show.studio || "Unknown Studio"}
                    </span>
                    {/* ◎ ◈ ୭ ✿ ✧ */}
                    <div className="font-medium text-zinc-200/70 text-md leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {show.dateReleased || "Unknown"}
                    </span>
                    {show.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200/70 text-md leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDateShort(show.dateCompleted)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* STATUS AND SCORE */}
                  <div className=" flex justify-start gap-4 mb-2.5 max-w-[94%]">
                    <div className="flex-[0.77] lg:min-w-41.25">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={show.status}
                        onChange={(value) => {
                          onAction({
                            type: "changeStatus",
                            payload: value as
                              | "Completed"
                              | "Want to Watch"
                              | "Dropped"
                              | "Watching",
                          });
                        }}
                        options={showStatusOptions}
                        customStyle="text-zinc-300/75 font-semibold"
                        dropDuration={0.24}
                      />
                    </div>
                    <div className="flex-[0.865] lg:min-w-48.75">
                      <label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
                        Score
                      </label>
                      <Dropdown
                        value={show.score?.toString() || "-"}
                        onChange={(value) => {
                          onAction({
                            type: "changeScore",
                            payload: Number(value),
                          });
                        }}
                        options={scoreOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={(() => {
                          const option = showStatusOptions.find(
                            (opt) => opt.value === show.status
                          );
                          return option
                            ? [option.textStyle, option.bgStyle]
                            : [];
                        })()}
                        dropDuration={0.4}
                      />
                    </div>
                  </div>
                  {/* SEASON && EP */}
                  <div className="space-y-1 mb-2">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Currently
                    </label>
                    <div className="flex gap-3 max-w-[97.6%]">
                      {/* SEASON CONTROLS */}
                      <div className="flex-[1.05] bg-linear-to-b from-transparent via-zinc-800/20 to-zinc-700/20 rounded-lg py-1.5 px-3 border border-zinc-800/20 select-none">
                        <div className="flex items-center justify-between pl-1">
                          <span
                            className="text-[15px] text-zinc-300/70 font-bold hover:cursor-pointer"
                            onClick={() => {
                              onAction({ type: "clickSeasonInput" });
                            }}
                          >
                            <span className="text-sm text-zinc-400/85 font-medium mr-2">
                              Season:
                            </span>
                            {editingMode.season ? (
                              <input
                                type="number"
                                value={
                                  inputValues.season === ""
                                    ? ""
                                    : inputValues.season
                                }
                                onChange={(e) => {
                                  onAction({
                                    type: "changeSeasonInput",
                                    payload: e.target.value,
                                  });
                                }}
                                //
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLInputElement>
                                ) => {
                                  handleInputKeyDown(e.key, "season");
                                }}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                }}
                                // WHEN LOSES FOCUS
                                onBlur={() => {
                                  onAction({ type: "submitSeasonInput" });
                                }}
                                //
                                className="max-w-8 text-center focus:outline-none focus:ring-0 border-0 "
                                style={
                                  inputValues.season !== ""
                                    ? {
                                        width: `${Math.min(
                                          8,
                                          inputValues.season.toString().length
                                        )}ch`,
                                      }
                                    : { width: "1ch" }
                                }
                                autoFocus
                                min="1"
                                max={show.seasons ? show.seasons.length : 1}
                              />
                            ) : (
                              <span
                                className={`underline ${getStatusTextColor(
                                  show.status
                                )}`}
                              >
                                {(show.curSeasonIndex ?? 0) + 1}
                              </span>
                            )}
                            <span className="">
                              /{show.seasons?.length ?? 0}
                            </span>
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              className="group flex justify-center items-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-700/50 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default"
                              onClick={() => {
                                onAction({
                                  type: "changeSeason",
                                  payload: "left",
                                });
                              }}
                              disabled={show.curSeasonIndex === 0}
                            >
                              <ChevronsLeft className="w-4 h-4 text-zinc-300/80 group-active:text-zinc-200/80 transition-colors" />
                            </button>
                            <button
                              className="group flex justify-center items-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-700/50 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default"
                              onClick={() => {
                                onAction({
                                  type: "changeSeason",
                                  payload: "right",
                                });
                              }}
                              disabled={
                                show.seasons &&
                                show.curSeasonIndex === show.seasons.length - 1
                              }
                            >
                              <ChevronsRight className="w-4 h-4 text-zinc-300/80 group-active:text-zinc-200/80 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EPISODE CONTROLS */}
                      <div className="flex-[1.05] bg-linear-to-b from-transparent via-zinc-800/20 to-zinc-700/20 rounded-lg py-1.5 px-3 border border-zinc-800/20 select-none">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[15px] text-zinc-300/70 font-bold hover:cursor-pointer"
                            onClick={() => {
                              onAction({ type: "clickEpisodeInput" });
                            }}
                          >
                            <span className="text-sm text-zinc-400/85 font-medium mr-2">
                              Episodes:
                            </span>
                            {editingMode.episode ? (
                              <input
                                type="number"
                                value={
                                  inputValues.episode === ""
                                    ? ""
                                    : inputValues.episode
                                }
                                onChange={(e) => {
                                  onAction({
                                    type: "changeEpisodeInput",
                                    payload: e.target.value,
                                  });
                                }}
                                //
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLInputElement>
                                ) => {
                                  handleInputKeyDown(e.key, "episode");
                                }}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                }}
                                // WHEN LOSES FOCUS
                                onBlur={() => {
                                  onAction({ type: "submitEpisodeInput" });
                                }}
                                //
                                className="max-w-8 text-center focus:outline-none focus:ring-0 border-0 "
                                style={
                                  inputValues.episode !== ""
                                    ? {
                                        width: `${Math.min(
                                          8,
                                          inputValues.episode.toString().length
                                        )}ch`,
                                      }
                                    : { width: "1ch" }
                                }
                                autoFocus
                                min="1"
                                max={
                                  show.seasons
                                    ? show.seasons[show.curSeasonIndex]
                                        .episode_count
                                    : 1
                                }
                              />
                            ) : (
                              <span
                                className={`underline ${getStatusTextColor(
                                  show.status
                                )}`}
                              >
                                {show.curEpisode ?? 1}
                              </span>
                            )}
                            <span className="">
                              /
                              {show.seasons?.[show.curSeasonIndex]
                                ?.episode_count ?? 0}
                            </span>
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              className="group flex justify-center items-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-700/50 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default"
                              onClick={() => {
                                onAction({
                                  type: "changeEpisode",
                                  payload: "left",
                                });
                              }}
                              disabled={
                                show.curSeasonIndex === 0 &&
                                show.curEpisode === 1
                              }
                            >
                              <ChevronLeft className="w-4 h-4 text-zinc-300/80 group-active:text-zinc-200/80 transition-colors" />
                            </button>
                            <button
                              className="group flex justify-center items-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-700/50 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default"
                              onClick={() => {
                                onAction({
                                  type: "changeEpisode",
                                  payload: "right",
                                });
                              }}
                              disabled={
                                show.seasons &&
                                show.curSeasonIndex ===
                                  show.seasons.length - 1 &&
                                show.curEpisode ===
                                  show.seasons[show.curSeasonIndex]
                                    .episode_count
                              }
                            >
                              <ChevronRight className="w-4 h-4 text-zinc-300/80 group-active:text-zinc-200/80 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
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
                        onChange={(e) => {
                          onAction({
                            type: "changeNote",
                            payload: e.target.value,
                          });
                        }}
                        onKeyDown={handleNoteKeyDown}
                        onBlur={() => {
                          onAction({
                            type: "saveNote",
                          });
                        }}
                        placeholder="Add your thoughts about this show..."
                        className="text-gray-300/90 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500 font-medium"
                      />
                    </div>
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
