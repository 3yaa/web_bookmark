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
    <div className="w-full mx-auto font-inter tracking-tight">
      {/* LOADER */}
      <div className="relative bg-black/20 backdrop-blur-xl">
        {isProcessingShow && (
          <Loading customStyle="mt-72 h-12 w-12 border-zinc-500/40" text="" />
        )}
      </div>

      {!isProcessingShow && shows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 italic text-lg">
            No shows yet — add one above!
          </p>
        </div>
      )}

      {/* LISTING */}
      {!isProcessingShow &&
        shows.map((show, index) => (
          <div
            key={show.id}
            className={`mx-auto flex bg-zinc-900/65 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm rounded-md border-b border-b-zinc-700/20`}
            onClick={() => onShowClicked(show)}
          >
            <div className="w-30 overflow-hidden rounded-md shadow-sm shadow-black/40">
              {show.posterUrl ? (
                <Image
                  src={show.posterUrl}
                  alt={show.title || "Untitled"}
                  width={100}
                  height={75}
                  priority
                  className="object-fill w-full h-full rounded-md border border-zinc-700/40"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
              )}
            </div>
            <div className="pl-3 pr-5 pt-3 flex flex-col w-full">
              {/* TITLE/SCORE */}
              <div className="flex justify-between items-start">
                <span className="text-zinc-200 font-semibold text-base leading-tight max-w-52 truncate">
                  {show.title || "-"}
                </span>
                <span className="text-zinc-400 text-sm font-semibold bg-zinc-800/60 px-2.5 py-1 rounded-md shadow-inner shadow-black/40 -mt-1.5">
                  {show.score || "-"}
                </span>
              </div>

              {/* STUDIO/RELEASE DATE */}
              <div className="text-zinc-500 text-xs font-medium flex space-x-1 pt-0.5">
                <span className="truncate max-w-35">{show.studio || "-"},</span>
                <span>{show.dateReleased || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                {/* COMPLETION DATE */}
                <span className="text-zinc-500 text-[0.65rem] font-medium mt-1">
                  {formatDateShort(show.dateCompleted)}
                </span>

                {/* SEASON / EPISODES */}
                <div className="text-zinc-400 text-xs font-medium mb-0.5">
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
              <div className="mt-1.5 w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden">
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

              <p className="pt-1 text-zinc-500 text-sm line-clamp-2 whitespace-normal overflow-hidden leading-snug font-normal flex items-center justify-center text-center min-h-[2.5rem]">
                <span className="line-clamp-2">{show.note || "No notes"}</span>
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
