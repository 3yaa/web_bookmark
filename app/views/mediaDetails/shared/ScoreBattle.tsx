import { BaseMediaProps } from "@/types/media";
import { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { getStatusBorderGradient } from "@/utils/formattingUtils";

interface ScoreBattlerProps<T extends BaseMediaProps> {
  items: T[];
  selectedItem: T;
  mediaType?: string;
  initialScore: number;
  onClose: () => void;
  onScoreFinal: (finalScore: number) => void;
}

export function ScoreBattler<T extends BaseMediaProps>({
  items,
  onClose,
  mediaType,
  initialScore,
  selectedItem,
  onScoreFinal,
}: ScoreBattlerProps<T>) {
  const picks = ["better", "worse", "settle"] as const;
  const [curScore, setCurScore] = useState(initialScore);
  const [oldChoice, setOldChoice] = useState<"better" | "worse">();

  const itemFacing = useMemo(() => {
    return items
      .filter((item) => item.score === curScore)
      .reduce<T | null>((latest, item) => {
        if (item.id === selectedItem.id) return latest;
        if (!item.lastUpdated) return latest;
        if (!latest?.lastUpdated) return item;
        return item.lastUpdated > latest.lastUpdated ? item : latest;
      }, null);
  }, [items, curScore, selectedItem]);

  useEffect(() => {
    if (!itemFacing) {
      if (curScore) onScoreFinal(curScore);
      onClose();
    }
  }, [itemFacing, curScore, onScoreFinal, onClose]);

  const finalize = useCallback(
    (score: number) => {
      onScoreFinal(score);
      onClose();
    },
    [onScoreFinal, onClose],
  );

  const handlePick = (choice: "better" | "worse" | "settle") => {
    if (!curScore) return;
    //
    if (choice === "better") {
      if (curScore === 11) return finalize(curScore);
      // pre check if theres any opponent left
      const next = curScore + 1;
      const hasOpponent = items.some((i) => i.score === next && i.lastUpdated);
      if (!hasOpponent) return finalize(next);
      //
      setCurScore(next);
      setOldChoice("better");
      if (oldChoice === "worse") return finalize(next);
    } else if (choice === "worse") {
      if (curScore === 1) return finalize(curScore);
      // pre check
      const next = curScore - 1;
      const hasOpponent = items.some((i) => i.score === next && i.lastUpdated);
      if (!hasOpponent) return finalize(next);
      //
      setCurScore(next);
      setOldChoice("worse");
      if (oldChoice === "better") return finalize(next);
    } else {
      finalize(curScore);
    }
  };

  const coverFor = (item: T | null) => item?.posterUrl ?? item?.coverUrl ?? "";
  const imgFit = mediaType === "game" ? "object-cover" : "object-fill";

  if (!itemFacing) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-linear-to-br from-black/50 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-linear-to-b ${getStatusBorderGradient(selectedItem.status)} p-1.5 py-2 lg:min-w-215 lg:max-w-215`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-linear-to-br bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          <div
            className={`flex justify-between px-5 py-3.5 border-0 rounded-2xl overflow-hidden`}
          >
            {/* LEFT */}
            <div
              className={`
                group relative rounded-xl select-none
                bg-[#1a1a1a] p-3.5 shadow-island
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              `}
            >
              <div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg select-none">
                <Image
                  src={coverFor(selectedItem)}
                  alt={selectedItem.title || "Untitled"}
                  width={1280}
                  height={720}
                  className={`min-w-62 min-h-93 ${imgFit}`}
                />
              </div>
              {/* Inner vignette */}
              <div className="absolute -inset-1 pointer-events-none rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.4)]" />
              {/* gradient overlay */}
              <div
                className="absolute inset-0 left-3.5 top-3.5 max-w-62 max-h-93 rounded-lg pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.3) 100%)",
                }}
              />
            </div>
            {/* MIDDLE */}
            <div className="flex flex-col justify-between items-center gap-5 shrink-0 select-none">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500/90 mt-3">
                vs
              </span>
              {/* flowah */}
              <Image
                src="/flower.png"
                alt="flower"
                width={240}
                height={360}
                className="max-w-24"
              />
              {/* ACTION BUTTONS */}
              <div className="flex flex-col">
                {picks.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    disabled={
                      (choice === "better" && curScore === 11) ||
                      (choice === "worse" && curScore === 1)
                    }
                    onClick={() => handlePick(choice)}
                    className="px-18 py-3 text-sm rounded-xl font-semibold uppercase tracking-[0.15em]transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-[#1a1a1a] border-none shadow-island mb-2 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {choice === "settle" ? "Settle" : choice}
                  </button>
                ))}
              </div>
            </div>
            {/* RIGHT */}
            <div
              className={`
                group relative rounded-xl select-none
                bg-[#1a1a1a] p-3.5 shadow-island
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              `}
            >
              <div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg select-none">
                <Image
                  src={coverFor(itemFacing)}
                  alt={itemFacing?.title || "Untitled"}
                  width={1280}
                  height={720}
                  className={`min-w-62 min-h-93 ${imgFit}`}
                />
              </div>
              {/* Inner vignette */}
              <div className="absolute -inset-1 pointer-events-none rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.4)]" />
              {/* gradient overlay */}
              <div
                className="absolute inset-0 left-3.5 top-3.5 max-w-62 max-h-93 rounded-lg pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.3) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
