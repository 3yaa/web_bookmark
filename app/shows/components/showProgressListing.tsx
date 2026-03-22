import { ShowProps } from "@/types/show";
import {
  formatDateShort,
  getStatusBg,
  getStatusWaveColor,
} from "@/utils/formattingUtils";
import { calcCurProgress } from "../utils/progressCalc";

export function ShowProgressBarMobile({ show }: { show: ShowProps }) {
  return (
    <>
      {/* DATE COMPLETED */}
      <div className="flex justify-between items-center pt-0.5">
        <span className="text-zinc-500 text-[0.65rem] font-medium mt-1">
          {formatDateShort(show.dateCompleted)}
        </span>
        {/* PROGRESS TEXT */}
        <div className="text-zinc-400 text-xs font-semibold mb-0.5">
          <span className="pr-1">S{show.curSeasonIndex + 1 || "-"}</span>
          <span>Ep {show.curEpisode || "-"}/</span>
          {show.seasons?.[show.curSeasonIndex]?.episode_count ? (
            <>
              <span>{show.seasons[show.curSeasonIndex].episode_count}</span>
            </>
          ) : (
            0
          )}
        </div>
      </div>
      {/* PROCESS BAR */}
      <div className="mt-1.5 w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden">
        <div
          className={`${getStatusBg(
            show.status,
          )} h-1.5 transition-all duration-500 ease-out rounded-md`}
          style={{
            width: `${
              show.seasons?.[show.curSeasonIndex]?.episode_count
                ? calcCurProgress(
                    show.seasons,
                    show.curSeasonIndex,
                    show.curEpisode,
                    show.status,
                  )
                : 100
            }%`,
          }}
        />
      </div>
    </>
  );
}

export function ShowProgressBarDesktop({ show }: { show: ShowProps }) {
  return (
    <>
      {/* PROGRESS TEXT */}
      <div className="absolute right-0 -bottom-8 text-zinc-400 text-[13px] font-semibold mr-1 tracking-tight">
        S{show.curSeasonIndex + 1 || "-"} · E{show.curEpisode || "-"}/
        {show.seasons?.[show.curSeasonIndex]?.episode_count || 0}
      </div>
      {/* PROGRESS BAR */}
      <div className="absolute -bottom-2.5 left-0 w-full bg-zinc-800/80 rounded-md h-1 overflow-hidden">
        <div
          className={`${getStatusBg(show.status)} h-1 transition-all duration-500 ease-out rounded-md relative overflow-hidden`}
          style={{
            width: `${
              show.seasons?.[show.curSeasonIndex]?.episode_count
                ? calcCurProgress(
                    show.seasons,
                    show.curSeasonIndex,
                    show.curEpisode,
                    show.status,
                  )
                : 100
            }%`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `${getStatusWaveColor(show.status)}`,
              animation: "wave 4s ease-in-out infinite",
              width: "200%",
            }}
          />
        </div>
      </div>
    </>
  );
}
