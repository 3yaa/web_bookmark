import { MovieProps } from "@/types/movie";
import { MovieAction } from "../MovieDetailsHub";
import React, { useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { HorizontalScoreWheel } from "@/app/components/ui/WheelSelector";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";

interface MovieDetailsMobileFullProps {
  movie: MovieProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingMovie?: boolean;
  onAddMovie: () => void;
  onAction: (action: MovieAction) => void;
  showAnotherSeries?: (dir: "left" | "right") => void;
}

export function MovieDetailsMobileFull({
  movie,
  localNote,
  onClose,
  onAddMovie,
  addingMovie,
  onAction,
  isLoading,
}: MovieDetailsMobileFullProps) {
  useEffect(() => {
    // Try multiple methods to hide address bar
    window.scrollTo(0, 1);
    setTimeout(() => window.scrollTo(0, 1), 100);

    return () => {
      // Reset on unmount if needed
    };
  }, []);
  return (
    <div className="fixed inset-0 z-30 bg-zinc-950 overflow-y-auto flex flex-col animate-fadeIn">
      {isLoading?.isTrue && (
        <div className="text-zinc-400 text-sm mt-5">{isLoading.text}</div>
      )}
      {/* ACTION BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between">
        <button className="backdrop-blur-2xl p-2 rounded-md" onClick={onClose}>
          <X className="w-5 h-5 text-zinc-300" />
        </button>

        <div className="flex items-center gap-2">
          {addingMovie ? (
            <button
              className="backdrop-blur-2xl p-2 rounded-md "
              onClick={onAddMovie}
            >
              <Plus className="w-5 h-5 text-zinc-300" />
            </button>
          ) : (
            <button
              className="backdrop-blur-2xl p-2 rounded-md"
              onClick={() => onAction({ type: "deleteMovie" })}
            >
              <Trash2 className="w-5 h-5 text-zinc-300" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pb-10 overflow-hidden">
        {/* Poster */}
        <div className="w-full rounded-b-lg overflow-hidden border border-zinc-700/30 bg-zinc-900/40">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title || "Poster"}
              width={600}
              height={900}
              className="object-cover w-full "
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-zinc-700 to-zinc-800" />
          )}
        </div>

        <div className="px-4">
          <div className="mt-4">
            {/* SERIES TITLE */}
            {movie.seriesTitle && (
              <div className="text-zinc-400 text-sm font-medium">
                {movie.seriesTitle}
              </div>
            )}
            {/* TITLE */}
            <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
              {movie.title}
            </h1>
            {/* DIR AND DATE */}
            <div className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
              <span>{movie.director || "Unknown"}</span>•
              <span>{movie.dateReleased || "-"}</span>
              {movie.dateCompleted && (
                <>
                  •<span>{formatDateShort(movie.dateCompleted)}</span>
                </>
              )}
            </div>
          </div>
          {/* Status Pills */}
          <div className="mt-5">
            <div className="text-zinc-400 text-xs font-medium mb-2">Status</div>
            <div className="flex justify-center gap-2 pb-1">
              {movieStatusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    onAction({
                      type: "changeStatus",
                      payload: `${status.label}`,
                    })
                  }
                  className={`px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition ${
                    status.label === movie.status
                      ? `${getStatusBg(status.label)} text-zinc-100`
                      : "text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
          {/* Score */}
          {/* <div className="mt-5">
            <div className="text-zinc-400 text-xs font-medium mb-2">Score</div>
            <div className="bg-zinc-900/40 rounded-lg p-3">
              <HorizontalScoreWheel
                value={movie.score ?? 0}
                onChange={(newScore) =>
                  onAction({
                    type: "changeScore",
                    payload: newScore,
                  })
                }
              />
            </div>
          </div> */}
          {/* Notes */}
          <div className="mt-5">
            <div className="text-zinc-400 text-xs font-medium mb-2">Notes</div>
            <div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 focus-within:ring-1 focus-within:ring-zinc-700 transition">
              <AutoTextarea
                value={localNote}
                onChange={(e) =>
                  onAction({
                    type: "changeNote",
                    payload: e.target.value,
                  })
                }
                onBlur={() => onAction({ type: "saveNote" })}
                placeholder="Add your thoughts about this movie..."
                className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
