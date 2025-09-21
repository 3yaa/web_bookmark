import { IGDBProps } from "@/types/game";
import { X, DiamondPlus } from "lucide-react";
import Image from "next/image";
import { Loading } from "@/app/components/ui/Loading";

interface MultSearchProps {
  isOpen: boolean;
  onClose: (action: "manualAdd" | null) => void;
  prompt: string;
  games: IGDBProps[];
  onClickedGame: (book: IGDBProps) => void;
  isLoading?: boolean;
}

export function ShowMultGames({
  isOpen,
  onClose,
  games,
  prompt,
  onClickedGame,
  isLoading,
}: MultSearchProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Modal content */}
      <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        {isLoading && (
          <Loading
            customStyle={"border-emerald-400 h-8 w-8"}
            text="Searching..."
          />
        )}
        {/* ACTION BUTTON */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* ADD */}
          <button
            className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
            onClick={() => {
              onClose("manualAdd");
            }}
            title={"Manually Add"}
          >
            <DiamondPlus className="w-5 h-5 text-gray-400 group-hover:text-green-500  transition-colors" />
          </button>
          {/* CLOSE -- go back to detail page*/}
          <button
            className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
            onClick={() => {
              onClose(null);
            }}
            title={"Close"}
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
          </button>
        </div>

        {/* TITLE */}
        {prompt ? (
          <h2 className="text-xl font-semibold text-white mb-4">
            Search Results:
            <span className="text-gray-200 text-lg"> {prompt}</span>
          </h2>
        ) : (
          <h2 className="text-xl font-semibold text-white mb-4">
            Search Results
          </h2>
        )}

        <div className="overflow-y-auto space-y-2.5">
          {games.map((game, index) => (
            <button
              key={`${game.igdbId}-${index}`}
              className="relative w-full text-left p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-600/40 transition flex gap-5"
              onClick={() => onClickedGame(game)}
            >
              {/* COVER */}
              <div className="w-12.5 h-18">
                {game.cover_url ? (
                  <Image
                    src={game.cover_url!}
                    alt={game.title || "Untitled"}
                    width={50}
                    height={75}
                    className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                )}
              </div>
              {/* DETAILS */}
              <div className="flex flex-col">
                <span className="text-lg font-medium text-zinc-100 truncate max-w-132">
                  {game.title}
                </span>
                {game.developer && (
                  <span className="text-sm text-gray-400 truncate max-w-135">
                    {game.developer[0].name}
                  </span>
                )}
                {game.released_year && (
                  <span className="text-xs text-gray-500 truncate max-w-135">
                    First published: {game.released_year}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
