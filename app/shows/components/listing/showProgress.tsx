import { ShowProps } from "@/types/show";
import { getStatusBg, getStatusWaveColor } from "@/utils/formattingUtils";
import { calcCurProgress } from "../../utils/progressCalc";

export function ShowProgressBar({ show }: { show: ShowProps }) {
  return (
    <>
      <div className="absolute right-0 -bottom-8 text-zinc-400 text-[11px] font-medium mb-0.5 tracking-tight">
        S{show.curSeasonIndex + 1 || "-"} · E{show.curEpisode || "-"}/
        {show.seasons?.[show.curSeasonIndex]?.episode_count || 0}
      </div>
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
