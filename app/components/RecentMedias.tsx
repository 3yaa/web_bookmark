import { BaseMediaProps } from "@/types/media";
import Image from "next/image";
import { getStatusBg, getStatusWaveColor } from "@/utils/formattingUtils";
import { getDisplayScore } from "@/lib/tierConfig";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function RecentItems({ items }: { items: BaseMediaProps[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mt-3 flex flex-col gap-2 -mr-1">
        {items.map((item) => (
          <div
            key={item.title}
            className="relative flex items-center gap-3 rounded-lg px-2 pr-4 py-2
          bg-zinc-900/60 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8),inset_0_-1px_0_rgba(255,255,255,0.1)] border-t border-zinc-950/80"
          >
            {/* poster */}
            <div
              className="w-12 h-16 sm:w-14 sm:h-18 shrink-0 rounded-sm overflow-hidden
              bg-zink-900 relative shadow-island p-0.5"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  className="object-cover w-full h-full"
                  width={112}
                  height={168}
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800/50" />
              )}
            </div>

            {/* title + timestamp */}
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-zinc-300 truncate leading-snug">
                {item.title}
              </p>
              <p className="text-xs sm:text-[0.875rem] font-semibold text-zinc-500/90 mt-0.5">
                {item.lastUpdated ? timeAgo(item.lastUpdated) : "- ago"}
              </p>
            </div>

            {/* score */}
            <span className="shrink-0 flex items-center justify-center w-8 text-center font-bold text-zinc-300/75 sm:text-[0.875rem] text-sm bg-linear-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] border border-zinc-800/40 py-1.5 -mt-3">
              {item.score?.mu ? getDisplayScore(item.score.mu) : "-"}
            </span>

            {/* status bar */}
            <div
              className={`absolute bottom-3 left-19 right-3.5 h-0.75 rounded-full overflow-hidden ${getStatusBg(item.status)}`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: getStatusWaveColor(item.status),
                  animation: "wave 4s ease-in-out infinite",
                  width: "200%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
