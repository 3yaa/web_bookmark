import { ShowProps } from "@/types/show";
import { getStatusTextColor } from "@/utils/formattingUtils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface EditProgressProps {
  item: ShowProps;
  editingMode: { season: boolean; episode: boolean };
  inputValues: { season: number | ""; episode: number | "" };
  onAction: (action: { type: string; payload?: unknown }) => void;
}

export function EditProgress({
  item,
  editingMode,
  inputValues,
  onAction,
}: EditProgressProps) {
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

  const seasons = item.seasons;
  const curSeasonIndex = item.curSeasonIndex ?? 0;
  const curEpisode = item.curEpisode ?? 1;
  const maxEpisodes = seasons?.[curSeasonIndex]?.episode_count ?? 0;

  const navBtnClass =
    "group flex justify-center items-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-700/50 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default";

  const iconClass =
    "w-4 h-4 text-zinc-300/80 group-active:text-zinc-200/80 transition-colors";

  return (
    <div className="space-y-1 mb-2">
      <label className="text-sm font-medium text-zinc-400 block">
        Progress
      </label>
      <div className="flex gap-4 max-w-[94%]">
        {/* SEASON CONTROLS */}
        <div className="flex-1 bg-linear-to-b from-transparent via-zinc-800/20 to-zinc-700/20 rounded-lg py-1.5 px-3 border border-zinc-800/50 select-none shadow-lg shadow-black/20">
          <div className="flex items-center justify-between pl-1">
            <span
              className="mt-0.5 text-[15px] text-zinc-300/70 font-bold hover:cursor-pointer"
              onClick={() => onAction({ type: "clickSeasonInput" })}
            >
              <span className="text-sm text-zinc-400/85 font-medium mr-2">
                Season:
              </span>
              {editingMode.season ? (
                <input
                  type="number"
                  value={inputValues.season === "" ? "" : inputValues.season}
                  onChange={(e) =>
                    onAction({
                      type: "changeSeasonInput",
                      payload: e.target.value,
                    })
                  }
                  onKeyDown={(e) => handleInputKeyDown(e.key, "season")}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => onAction({ type: "submitSeasonInput" })}
                  className="max-w-8 text-center focus:outline-none focus:ring-0 border-0"
                  style={
                    inputValues.season !== ""
                      ? {
                          width: `${Math.min(8, inputValues.season.toString().length)}ch`,
                        }
                      : { width: "1ch" }
                  }
                  autoFocus
                  min="1"
                  max={seasons ? seasons.length : 1}
                />
              ) : (
                <span
                  className={`underline ${getStatusTextColor(item.status)}`}
                >
                  {curSeasonIndex + 1}
                </span>
              )}
              <span>/{seasons?.length ?? 0}</span>
            </span>
            <div className="flex gap-1.5">
              <button
                className={navBtnClass}
                onClick={() =>
                  onAction({ type: "changeSeason", payload: "left" })
                }
                disabled={curSeasonIndex === 0}
              >
                <ChevronsLeft className={iconClass} />
              </button>
              <button
                className={navBtnClass}
                onClick={() =>
                  onAction({ type: "changeSeason", payload: "right" })
                }
                disabled={
                  seasons !== undefined && curSeasonIndex === seasons.length - 1
                }
              >
                <ChevronsRight className={iconClass} />
              </button>
            </div>
          </div>
        </div>

        {/* EPISODE CONTROLS */}
        <div className="flex-1 bg-linear-to-b from-transparent via-zinc-800/20 to-zinc-700/20 rounded-lg py-1.5 px-3 border border-zinc-800/50 select-none shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span
              className="mt-0.5 text-[15px] text-zinc-300/70 font-bold hover:cursor-pointer"
              onClick={() => onAction({ type: "clickEpisodeInput" })}
            >
              <span className="text-sm text-zinc-400/85 font-medium mr-2">
                Ep:
              </span>
              {editingMode.episode ? (
                <input
                  type="number"
                  value={inputValues.episode === "" ? "" : inputValues.episode}
                  onChange={(e) =>
                    onAction({
                      type: "changeEpisodeInput",
                      payload: e.target.value,
                    })
                  }
                  onKeyDown={(e) => handleInputKeyDown(e.key, "episode")}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => onAction({ type: "submitEpisodeInput" })}
                  className="max-w-8 text-center focus:outline-none focus:ring-0 border-0"
                  style={
                    inputValues.episode !== ""
                      ? {
                          width: `${Math.min(8, inputValues.episode.toString().length)}ch`,
                        }
                      : { width: "1ch" }
                  }
                  autoFocus
                  min="0"
                  max={maxEpisodes || 1}
                />
              ) : (
                <span
                  className={`underline ${getStatusTextColor(item.status)}`}
                >
                  {curEpisode}
                </span>
              )}
              <span>/{maxEpisodes}</span>
            </span>
            <div className="flex gap-1.5">
              <button
                className={navBtnClass}
                onClick={() =>
                  onAction({ type: "changeEpisode", payload: "left" })
                }
                disabled={curSeasonIndex === 0 && curEpisode === 0}
              >
                <ChevronLeft className={iconClass} />
              </button>
              <button
                className={navBtnClass}
                onClick={() =>
                  onAction({ type: "changeEpisode", payload: "right" })
                }
                disabled={
                  seasons !== undefined &&
                  curSeasonIndex === seasons.length - 1 &&
                  curEpisode === maxEpisodes
                }
              >
                <ChevronRight className={iconClass} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
