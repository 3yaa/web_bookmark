import { scoreOptions } from "@/utils/dropDownDetails";
import React, { useRef, useEffect, useState, UIEvent } from "react";

interface ScoreWheelProps {
  value: number;
  onChange: (newScore: number) => void;
}

export const HorizontalScoreWheel: React.FC<ScoreWheelProps> = ({
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(value);

  // Sizes (you can tweak)
  const ITEM_SIZE = 70;
  const GAP = 12;

  // Haptic feedback
  const doHaptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  // Scroll to current score when opening
  useEffect(() => {
    const index = scoreOptions.findIndex((s) => Number(s.value) === value);

    if (
      index !== -1 &&
      containerRef.current &&
      containerRef.current.children[index]
    ) {
      const el = containerRef.current.children[index] as HTMLElement;
      el.scrollIntoView({ behavior: "instant", inline: "center" });
    }
  }, [value]);

  // Main scroll handler — determines the centered score
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const center = container.scrollLeft + container.offsetWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    const children = Array.from(container.children) as HTMLElement[];

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(center - childCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const newScore = Number(scoreOptions[closestIndex].value);

    if (newScore !== currentScore) {
      setCurrentScore(newScore);
      onChange(newScore);
      doHaptic();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Score Label */}
      <div className="mb-2 text-lg font-semibold">
        {scoreOptions.find((s) => Number(s.value) === currentScore)?.label}
      </div>

      {/* Horizontal Wheel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory px-[40%]"
      >
        {scoreOptions.map((s) => {
          const scoreNum = Number(s.value);
          const dist = Math.abs(scoreNum - currentScore);

          // Fade + scale depending on distance
          const opacity = Math.max(0.2, 1 - dist * 0.2);
          const scale = Math.max(0.7, 1 - dist * 0.1);

          return (
            <div
              key={s.value}
              className="snap-center flex items-center justify-center"
              style={{
                width: ITEM_SIZE,
                marginRight: GAP,
                opacity,
                transform: `scale(${scale})`,
                transition: "opacity 0.15s, transform 0.15s",
              }}
            >
              <span className="text-2xl font-bold">
                {scoreNum === 0 ? "-" : scoreNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
