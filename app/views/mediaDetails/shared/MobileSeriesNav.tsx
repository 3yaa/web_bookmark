// FOR GAME/MOVIE/BOOK
import { BaseMediaProps, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";

interface MobileSeriesNavProps {
  item: BaseMediaProps;
  mediaType: string;
  isAdding: boolean;
  onAction: (action: { type: string; payload?: unknown }) => void;
}

export function MobileSeriesNav({
  item,
  mediaType,
  isAdding,
  onAction,
}: MobileSeriesNavProps) {
  const nav =
    mediaType === "game"
      ? (() => {
          const g = item as unknown as GameProps;
          return {
            prev:
              g.dlcs && g.dlcIndex - 1 >= 0
                ? {
                    name: g.dlcs[g.dlcIndex - 1].name,
                    action: { type: "dlcNav", payload: "prev" },
                  }
                : null,
            center: g.dlcIndex !== 0 ? String(g.dlcIndex) : null,
            next:
              g.dlcs && g.dlcIndex + 1 < g.dlcs.length
                ? {
                    name: g.dlcs[g.dlcIndex + 1].name,
                    action: { type: "dlcNav", payload: "next" },
                  }
                : null,
          };
        })()
      : (() => {
          const s = item as unknown as SeriesMediaProps;
          return {
            prev: s.prequel
              ? {
                  name: s.prequel,
                  action: { type: "seriesNav", payload: "prequel" },
                }
              : null,
            center: s.placeInSeries ?? null,
            next: s.sequel
              ? {
                  name: s.sequel,
                  action: { type: "seriesNav", payload: "sequel" },
                }
              : null,
          };
        })();

  if (!nav.center) return null;

  return (
    <div className="pt-5 grid grid-cols-[1fr_2rem_1fr]" data-no-drag>
      {/* PREV */}
      <div className="min-w-0 text-left">
        {nav.prev && (
          <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
            <span className="shrink-0">←</span>
            <span
              className={`truncate min-w-0 transition-all duration-200 ${
                !isAdding ? "hover:underline active:scale-95" : ""
              }`}
              onClick={() => {
                if (!isAdding) onAction(nav.prev!.action);
              }}
            >
              {nav.prev.name}
            </span>
          </div>
        )}
      </div>
      {/* CENTER */}
      <div className="flex justify-center items-end shrink-0">
        <label className="text-sm font-medium text-zinc-400/85">
          {nav.center}
        </label>
      </div>
      {/* NEXT */}
      <div className="min-w-0 text-right flex justify-end">
        {nav.next && (
          <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
            <span
              className={`truncate min-w-0 transition-all duration-200 ${
                !isAdding ? "hover:underline active:scale-95" : ""
              }`}
              onClick={() => {
                if (!isAdding) onAction(nav.next!.action);
              }}
            >
              {nav.next.name}
            </span>
            <span className="shrink-0">→</span>
          </div>
        )}
      </div>
    </div>
  );
}
