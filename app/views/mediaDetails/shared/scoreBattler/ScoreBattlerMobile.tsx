import Image from "next/image";
import { BaseMediaProps } from "@/types/media";
import { actions, ScoreBattlerUIProps } from "./shared";
import { useEffect, useRef, useState } from "react";
import { getStatusBg, getStatusWaveColor } from "@/utils/formattingUtils";

export function ScoreBattlerMobile<T extends BaseMediaProps>({
  selectedItem,
  itemFacing,
  curScore,
  onPick,
  onClose,
  mediaType,
}: ScoreBattlerUIProps<T>) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startY = useRef(0);
  const startScrollY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragVelocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("textarea") ||
      target.closest("[data-no-drag]")
    )
      return;

    const modal = modalRef.current;
    if (!modal) return;

    if (modal.scrollTop < 3) {
      startY.current = e.touches[0].clientY;
      lastY.current = e.touches[0].clientY;
      lastTime.current = Date.now();
      startScrollY.current = modal.scrollTop;
      dragVelocity.current = 0;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const modal = modalRef.current;
    if (!modal) return;

    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - startY.current;

    const timeDelta = currentTime - lastTime.current;
    if (timeDelta > 0) {
      dragVelocity.current = (currentY - lastY.current) / timeDelta;
    }

    lastY.current = currentY;
    lastTime.current = currentTime;

    if (modal.scrollTop < 3 && deltaY > 0) {
      const resistance = Math.max(0.3, 1 - deltaY / 800);
      setTranslateY(deltaY * resistance);
    } else if (deltaY < 0) {
      setIsDragging(false);
      setTranslateY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 50;
    const velocityThreshold = 0.5;

    if (translateY > threshold || dragVelocity.current > velocityThreshold) {
      const finalY = Math.max(
        translateY + dragVelocity.current * 200,
        window.innerHeight,
      );
      setTranslateY(finalY);
      setIsExiting(true);
      setTimeout(() => onClose(), 75);
    } else {
      setTranslateY(0);
    }

    setIsDragging(false);
    dragVelocity.current = 0;
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const coverFor = (item: T | null) => item?.posterUrl ?? item?.coverUrl ?? "";

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-30 bg-zinc-950 flex flex-col justify-between overflow-y-auto"
      style={{
        transform: `translateY(${translateY}px)`,
        transition: isDragging
          ? "none"
          : isExiting
            ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pb-10">
        {/* PIC */}
        <div
          className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-300 ${
            isDragging ? "rounded-lg" : ""
          }`}
        >
          <Image
            src={coverFor(itemFacing)}
            alt={itemFacing.title || "Untitled"}
            width={1280}
            height={900}
            className="object-cover w-full"
          />
          {/* BOTTOM FADE */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* TITLES */}
      <div className="flex flex-col items-center gap-0.5 px-5 -mt-5">
        <span className="text-xl font-bold text-zinc-300 text-center">
          {itemFacing.title}
        </span>
        {/*  */}
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 my-1 italic">
          vs
        </span>
        <span className="text-xl font-bold text-zinc-300 text-center">
          {selectedItem.title}
        </span>
        <div className="my-3 w-full rounded-md h-1 overflow-hidden">
          <div
            className={`${getStatusBg(selectedItem.status)} h-1 transition-all duration-500 ease-out rounded-md overflow-hidden relative`}
          >
            <div
              className="absolute inset-0"
              style={{
                background: getStatusWaveColor(selectedItem.status),
                animation: "wave 4s ease-in-out infinite",
                width: "200%",
              }}
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div
        className={`flex flex-col px-4 pb-8 ${mediaType !== "game" ? "pt-3" : ""}`}
      >
        {actions.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={
              (choice === "better" && curScore === 11) ||
              (choice === "worse" && curScore === 1)
            }
            onClick={() => onPick(choice)}
            className="w-full min-h-12 px-18 py-3 text-sm rounded-xl font-semibold uppercase tracking-[0.15em] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-[#1a1a1a] border-none shadow-island mb-2 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {choice === "same" ? "Same Tier" : choice}
          </button>
        ))}
      </div>
    </div>
  );
}
