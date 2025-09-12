"use client";
import { DiamondPlus, X } from "lucide-react";
import { MovieProps } from "@/types/movie";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { getStatusBorderGradient } from "@/utils/formattingUtils";
import { scoreOptions, statusOptions } from "@/utils/dropDownDetails";

interface ManualAddMovieProps {
  isOpen: boolean;
  onClose: () => void;
  addMovie: () => void;
  movie: Partial<MovieProps>;
  onUpdate: (updates: Partial<MovieProps>) => void;
}

export function ManualAddMovie({
  isOpen,
  onClose,
  movie,
  onUpdate,
  addMovie,
}: ManualAddMovieProps) {
  if (!isOpen) return null;

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<MovieProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    }
    onUpdate(statusLoad);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          movie.status ?? "Want to Read"
        )} py-2 px-2`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 lg:min-w-3xl lg:max-w-3xl w-full max-h-[calc(100vh-3rem)]">
          <div className="px-8.5 py-7 border-0 rounded-2xl">
            {/* ACTION BUTTONS */}
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {/* ADD */}
              <button
                className={`py-1.5 px-5 rounded-lg transition-all group ${
                  movie.title && movie.title.trim()
                    ? "bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer"
                    : "bg-zinc-800/40 cursor-not-allowed opacity-50"
                }`}
                onClick={
                  movie.title && movie.title.trim() ? addMovie : undefined
                }
                disabled={!movie.title || !movie.title.trim()}
                title={"Add"}
              >
                <DiamondPlus
                  className={`w-5 h-5 transition-colors ${
                    movie.title && movie.title.trim()
                      ? "text-gray-400 group-hover:text-green-500"
                      : "text-gray-500"
                  }`}
                />
              </button>
              {/* CLOSE -- goes to listing*/}
              <button
                className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
                onClick={onClose}
                title={"Close"}
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
              </button>
            </div>

            <div className="flex gap-8">
              {/* LEFT SIDE -- EMPTY COVER */}
              <div className="w-62 h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg border border-zinc-600/30" />
              {/* RIGHT SIDE -- DETIALS */}
              <div className="flex flex-col flex-1 justify-center min-h-93 min-w-62 gap-1">
                {/* TITLE */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400 block">
                    Movie Title*
                  </label>
                  <input
                    type="text"
                    placeholder="Movie title"
                    value={movie.title || ""}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500  focus:ring-1 focus:ring-zinc-600/60 outline-none transition-all duration-200"
                  />
                </div>
                {/* DIRECTOR */}
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Director
                    </label>
                    <input
                      type="text"
                      placeholder="Director Name"
                      value={movie.director?.join(", ") || ""}
                      onChange={(e) =>
                        onUpdate({
                          director: e.target.value
                            .split(", ")
                            .map((d) => d.trim())
                            .filter((d) => d),
                        })
                      }
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:ring-zinc-600/60 focus:ring-1  outline-none transition-all duration-200"
                    />
                  </div>
                  {/* PUBLICATION YEAR */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Publication year"
                      value={movie.dateReleased || ""}
                      onChange={(e) =>
                        onUpdate({
                          dateReleased: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:ring-zinc-600/60 focus:ring-1 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                {/* STATUS AND SCORE */}
                <div className="flex justify-start gap-4">
                  <div className="lg:min-w-[165px] flex-1">
                    <label className="text-sm font-medium text-zinc-400 mb-1 block">
                      Status
                    </label>
                    <Dropdown
                      value={movie.status || "Want to Read"}
                      onChange={handleStatusChange}
                      options={statusOptions}
                      customStyle="text-zinc-200 font-semibold"
                      dropStyle={
                        movie.status === "Completed"
                          ? ["to-emerald-500/10", "text-emerald-500"]
                          : ["to-blue-500/10", "text-blue-500"]
                      }
                      dropDuration={0.24}
                    />
                  </div>
                  <div className="flex-1 lg:min-w-[195px]">
                    <label className="text-sm font-medium text-zinc-400 mb-1 block">
                      Score
                    </label>
                    <Dropdown
                      value={movie.score?.toString() || "-"}
                      onChange={(value) => {
                        onUpdate({ score: Number(value) });
                      }}
                      options={scoreOptions}
                      customStyle="text-zinc-200 font-semibold"
                      dropStyle={
                        movie.status === "Completed"
                          ? ["to-emerald-500/10", "text-emerald-500"]
                          : ["to-blue-500/10", "text-blue-500"]
                      }
                      dropDuration={0.4}
                    />
                  </div>
                </div>
                {/* NOTES */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400 block">
                    Notes
                  </label>
                  <div className="bg-zinc-800/50 rounded-lg pl-3 pt-2 pr-1 pb-1 max-h-25 overflow-auto focus-within:ring-2 focus-within:ring-zinc-600/60 transition-all duration-200">
                    <AutoTextarea
                      value={movie.note || ""}
                      onChange={(e) => {
                        onUpdate({ note: e.target.value });
                      }}
                      minHeight={100}
                      maxHeight={100}
                      placeholder="Add your thoughts about this movie..."
                      className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                    />
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
