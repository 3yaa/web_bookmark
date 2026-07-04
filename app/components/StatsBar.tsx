import { useMemo, useRef, useState } from "react";

const statusColors: Record<string, { bg: string; shadow: string }> = {
  Watching: {
    bg: "linear-gradient(180deg, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.16) 100%)",
    shadow:
      "inset 0 1px 0 rgba(6, 182, 212, 0.08), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
  "Want to Watch": {
    bg: "linear-gradient(180deg, rgba(37, 99, 235, 0.45) 0%, rgba(37, 99, 235, 0.37) 100%)",
    shadow:
      "inset 0 1px 0 rgba(96, 165, 250, 0.05), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
  "Want to Read": {
    bg: "linear-gradient(180deg, rgba(37, 99, 235, 0.37) 0%, rgba(37, 99, 235, 0.30) 100%)",
    shadow:
      "inset 0 1px 0 rgba(96, 165, 250, 0.05), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
  Playing: {
    bg: "linear-gradient(180deg, rgba(37, 99, 235, 0.37) 0%, rgba(37, 99, 235, 0.30) 100%)",
    shadow:
      "inset 0 1px 0 rgba(96, 165, 250, 0.05), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
  Completed: {
    bg: "linear-gradient(180deg, rgba(16, 185, 129, 0.37) 0%, rgba(16, 185, 129, 0.30) 100%)",
    shadow:
      "inset 0 1px 0 rgba(52, 211, 153, 0.05), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
  Dropped: {
    bg: "linear-gradient(180deg, rgba(239, 68, 68, 0.28) 0%, rgba(239, 68, 68, 0.21) 100%)",
    shadow:
      "inset 0 1px 0 rgba(252, 129, 129, 0.03), inset 0 -1px 0 rgba(0,0,0,0.14)",
  },
};

const defaultColor = {
  bg: "linear-gradient(180deg, rgba(82, 82, 91, 0.28) 0%, rgba(82, 82, 91, 0.21) 100%)",
  shadow:
    "inset 0 1px 0 rgba(255,255,255,0.02), inset 0 -1px 0 rgba(0,0,0,0.14)",
};

const statusOrder = [
  "Watching",
  "Want to Watch",
  "Want to Read",
  "Playing",
  "Completed",
  "Dropped",
];

const ENTER_DELAY = 150; // ms debounce before showing hover label
const LEAVE_DELAY = 30; // ms grace period for crossing between segments

export function StatsBar({
  data,
  avgScore,
}: {
  data: Record<string, number>;
  avgScore?: number;
}) {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (status: string) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
    }
    // If already hovering a segment, switch immediately
    if (hoveredStatus) {
      setHoveredStatus(status);
      enterTimer.current = null;
    } else {
      enterTimer.current = setTimeout(() => {
        setHoveredStatus(status);
        enterTimer.current = null;
      }, ENTER_DELAY);
    }
  };

  const handleLeave = () => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => {
      setHoveredStatus(null);
      leaveTimer.current = null;
    }, LEAVE_DELAY);
  };

  const { entries, total } = useMemo(() => {
    const entries = Object.entries(data).sort(
      (a, b) =>
        (statusOrder.indexOf(a[0]) === -1 ? 99 : statusOrder.indexOf(a[0])) -
        (statusOrder.indexOf(b[0]) === -1 ? 99 : statusOrder.indexOf(b[0])),
    );
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return { entries, total };
  }, [data]);

  if (total === 0) return null;

  return (
    <div className="w-full space-y-2">
      {/* TOTAL + MEAN SCORE */}
      <div className="h-4 flex items-center justify-between">
        {hoveredStatus ? (
          <span
            className="text-[0.9375rem] text-zinc-400 font-bold mx-auto transition-opacity duration-200"
            key={hoveredStatus}
          >
            {hoveredStatus}: {data[hoveredStatus]}
          </span>
        ) : (
          <>
            <span className="text-zinc-400 pl-0.5">
              <span className="font-medium text-[0.9375rem]">Total: </span>
              <span className="font-bold text-[0.9375rem] text-zinc-300/85">
                {total}
              </span>
            </span>
            <span className="text-[0.9375rem] font-bold text-zinc-300/85 pr-1">
              {avgScore != null ? `${avgScore.toFixed(1)}` : ""}
            </span>
          </>
        )}
      </div>
      {/* bar */}
      <div className="w-full relative">
        <div className="w-full h-5.5 rounded-sm overflow-hidden flex bg-zinc-800/80 ">
          {entries.map(([status, count]) => {
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            const color = statusColors[status] ?? defaultColor;
            return (
              <div
                key={status}
                className="h-full rounded-xs transition-opacity duration-200"
                style={{
                  width: `${pct}%`,
                  background: color.bg,
                  boxShadow: color.shadow,
                  opacity: hoveredStatus && hoveredStatus !== status ? 0.4 : 1,
                  borderRight: "1.5px solid rgba(0, 0, 0, 0.6)",
                }}
                onMouseEnter={() => handleEnter(status)}
                onMouseLeave={handleLeave}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
