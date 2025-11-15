import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
// utils and ui components
import {
  formatDateShort,
  getStatusBg,
  getStatusBorderColor,
} from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { ShowProps, SortConfig } from "@/types/show";

interface MobileListingProps {
  shows: ShowProps[];
  isProcessingShow: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onShowClicked: (show: ShowProps) => void;
}

export default function MobileListing({
  shows,
  isProcessingShow,
  sortConfig,
  onSortConfig,
  onShowClicked,
}: MobileListingProps) {
  return (
    <div className="w-full mx-auto">
      {/* LOADER */}
      <div className="relative bg-black/20 backdrop-blur-xl">
        {isProcessingShow && (
          <Loading customStyle="mt-72 h-12 w-12 border-zinc-500/40" text="" />
        )}
      </div>

      {!isProcessingShow && shows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 italic text-lg tracking-wide">
            No shows yet — add one above!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingShow &&
        shows.map((show, index) => (
          <div
            key={show.id}
            className={`mx-auto flex items-center bg-zinc-900/65 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm rounded-md border-b border-b-zinc-700/20`}
            onClick={() => onShowClicked(show)}
          >
            <div className="w-19">
              {show.posterUrl !== undefined ? (
                <Image
                  src={show.posterUrl}
                  alt={show.title || "Untitled"}
                  width={100}
                  height={75}
                  priority
                  className="object-fill rounded-[0.25rem] border border-zinc-600/30"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
              )}
            </div>
            <div className="pt-2 px-5 flex flex-col w-full">
              {/* TITLE/SCORE */}
              <div className="flex justify-between items-start">
                <span className="text-zinc-200 font-medium text-base leading-tight tracking-tight max-w-52 truncate">
                  {show.title || "-"}
                </span>
                <span className="text-zinc-400 text-sm font-semibold bg-zinc-800/60 px-2 py-0.5 rounded-md shadow-inner shadow-black/40 -mt-1.5">
                  {show.score || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-1.5 pt-1">
                <div className="text-zinc-500 text-xs flex space-x-1 ">
                  <span className="truncate max-w-35">
                    {show.studio || "-"},
                  </span>
                  <span>{show.dateReleased || "-"}</span>
                </div>

                {/* SEASON / EPISODES */}
                <div className="text-zinc-400 text-xs flex justify-end">
                  <span className="pr-1">
                    S{show.curSeasonIndex + 1 || "-"}
                  </span>
                  <span>Ep {show.curEpisode || "-"}/</span>
                  {show.seasons?.[show.curSeasonIndex]?.episode_count ? (
                    <>
                      <span>
                        {show.seasons[show.curSeasonIndex].episode_count}
                      </span>
                    </>
                  ) : (
                    0
                  )}
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden">
                <div
                  className={`${getStatusBg(
                    show.status
                  )} h-1.5 transition-all duration-500 ease-out rounded-md`}
                  style={{
                    width: `${
                      show.seasons?.[show.curSeasonIndex]?.episode_count
                        ? (show.curEpisode /
                            show.seasons[show.curSeasonIndex].episode_count) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="pt-1.5 text-zinc-500 text-sm text-center line-clamp-1 whitespace-normal overflow-hidden leading-snug">
                {show.note || "No notes"}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
