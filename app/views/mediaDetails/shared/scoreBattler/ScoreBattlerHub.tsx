import { BaseMediaProps } from "@/types/media";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ScoreBattlerDesktop } from "./ScoreBattlerDesktop";
import { ScoreBattlerMobile } from "./ScoreBattlerMobile";

interface ScoreBattlerHubProps<T extends BaseMediaProps> {
  items: T[];
  selectedItem: T;
  mediaType?: string;
  initialScore: number;
  onClose: () => void;
  onScoreFinal: (finalScore: number) => void;
}

export function ScoreBattlerHub<T extends BaseMediaProps>({
  items,
  onClose,
  mediaType,
  initialScore,
  selectedItem,
  onScoreFinal,
}: ScoreBattlerHubProps<T>) {
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

  const handlePick = (choice: "better" | "worse" | "same") => {
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

  if (!itemFacing) {
    return null;
  }

  return (
    <>
      <div className="lg:block hidden">
        <ScoreBattlerDesktop
          selectedItem={selectedItem}
          itemFacing={itemFacing}
          curScore={curScore}
          mediaType={mediaType}
          onClose={onClose}
          onPick={handlePick}
        />
      </div>
      <div className="block lg:hidden">
        <ScoreBattlerMobile
          selectedItem={selectedItem}
          itemFacing={itemFacing}
          curScore={curScore}
          mediaType={mediaType}
          onClose={onClose}
          onPick={handlePick}
        />
      </div>
    </>
  );
}
