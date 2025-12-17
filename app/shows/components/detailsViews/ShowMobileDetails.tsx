import { ShowProps } from "@/types/show";
import { ShowAction } from "../ShowDetailsHub";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, ChevronsUp } from "lucide-react";
import { scoreOptions, showStatusOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobileAutoTextarea } from "@/app/components/ui/MobileAutoTextArea";
import { Loading } from "@/app/components/ui/Loading";
import { calcCurProgress } from "../../utils/progressCalc";
import { MobileProgressPicker } from "@/app/components/ui/MobileSeasonEpPicker";
import { MobileScorePicker } from "@/app/components/ui/MobileScorePicker";

interface ShowMobileDetailsProps {
  show: ShowProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingShow?: boolean;
  onAddShow: () => void;
  onAction: (action: ShowAction) => void;
}

export function ShowMobileDetails({
  show,
  localNote,
  onClose,
  onAddShow,
  addingShow,
  onAction,
  isLoading,
}: ShowMobileDetailsProps) {
  const [isScorePickerOpen, setIsScorePickerOpen] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [isProgressPickerOpen, setIsProgressPickerOpen] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startY = useRef(0);
  const startScrollY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragVelocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const currentTranslateY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProgressPickerOpen || isScorePickerOpen) return;

    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("textarea") ||
      target.closest("[data-no-drag]")
    ) {
      return;
    }

    const modal = modalRef.current;
    if (!modal) return;

    if (modal.scrollTop <= 5) {
      startY.current = e.touches[0].clientY;
      lastY.current = e.touches[0].clientY;
      lastTime.current = Date.now();
      startScrollY.current = modal.scrollTop;
      dragVelocity.current = 0;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isProgressPickerOpen || isScorePickerOpen) return;

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

    if (modal.scrollTop <= 5 && deltaY > 0) {
      e.preventDefault();
      const resistance = Math.max(0.4, 1 - deltaY / 600);
      const newTranslateY = deltaY * resistance;
      currentTranslateY.current = newTranslateY;

      // Use RAF to batch updates and avoid jitter
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          setTranslateY(currentTranslateY.current);
          rafRef.current = null;
        });
      }
    } else if (deltaY < 0 && modal.scrollTop <= 0) {
      setIsDragging(false);
      setTranslateY(0);
      currentTranslateY.current = 0;
    }
  };

  const safeUnlock = useCallback(() => {
    if (bodyUnlockedRef.current) return;
    bodyUnlockedRef.current = true;

    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollYRef.current);
  }, []);

  const lockBodyScroll = () => {
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return scrollY;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // Cancel any pending RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const threshold = 80;
    const velocityThreshold = 0.6;

    if (currentTranslateY.current > threshold || dragVelocity.current > velocityThreshold) {
      // UNLOCK BODY IMMEDIATELY
      safeUnlock();

      const finalY = Math.max(
        currentTranslateY.current + dragVelocity.current * 250,
        window.innerHeight
      );

      setIsExiting(true);
      setTranslateY(finalY);

      setTimeout(() => {
        onClose();
      }, 50);
    } else {
      setTranslateY(0);
      currentTranslateY.current = 0;
    }

    setIsDragging(false);
    dragVelocity.current = 0;
  };

  useEffect(() => {
    scrollYRef.current = lockBodyScroll();

    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      safeUnlock(); // fallback only
    };
  }, [safeUnlock]);

  return (
    <>
      <div
        ref={modalRef}
        className={`fixed inset-0 z-30 bg-zinc-950 flex flex-col ${
          isProgressPickerOpen || isScorePickerOpen
            ? "overflow-hidden"
            : "overflow-y-auto"
        }`}
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
          opacity: isVisible ? 1 : 0,
          willChange: isDragging ? "transform" : "auto",
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
        {isLoading?.isTrue && (
          <Loading
            customStyle={isLoading.style}
            text={isLoading.text}
            isMobile={true}
          />
        )}
        {/* ACTION BAR */}
        {(posterLoaded || addingShow) && (
          <div className="sticky top-0 z-30">
            <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
              {addingShow && (
                <>
                  {/* ADD */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                    onClick={onAddShow}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                  {/* YEAR */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5 active:scale-95 transition-transform duration-150"
                    onClick={() => {
                      onAction({ type: "needYear" });
                    }}
                    title={"Search with year"}
                  >
                    <ChevronsUp className="w-5 h-5 text-slate-400 transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* INFO */}
        <div className="pb-10">
          {/* POSTER */}
          <div
            className={`relative w-full overflow-hidden bg-zinc-900/40 ${
              isDragging ? "rounded-lg" : ""
            }`}
            style={{
              willChange: isDragging ? "transform" : "auto",
            }}
          >
            {show.posterUrl ? (
              <Image
                src={show.posterUrl}
                alt={show.title || "Poster"}
                width={1280}
                height={900}
                className="object-cover w-full"
                onLoad={() => setPosterLoaded(true)}
              />
            ) : (
              <div className="h-64 bg-linear-to-br from-zinc-700 to-zinc-800" />
            )}

            <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>

          <div className="px-4">
            <div className="mt-4">
              <div></div>
              <div className="flex justify-between">
                <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                  {show.title}
                </h1>
                {/* SCORE */}
                <div data-no-drag>
                  <button
                    onClick={() => setIsScorePickerOpen(true)}
                    className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md shadow-inner shadow-black/40 cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
                  >
                    {show.score || "-"}
                  </button>
                </div>
              </div>
              <div className="text-zinc-400 text-sm -mt-1 flex items-center gap-2">
                <span>{show.studio || "Unknown"}</span>•
                <span>{show.dateReleased || "-"}</span>
                {show.dateCompleted && (
                  <>
                    •<span>{formatDateShort(show.dateCompleted)}</span>
                  </>
                )}
              </div>
            </div>
            {/* PROGRESS BAR */}
            <div
              className="mt-4.5 w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden"
              onClick={() => setIsProgressPickerOpen(true)}
            >
              <div
                className={`${getStatusBg(
                  show.status
                )} h-1.5 transition-all duration-500 ease-out rounded-md`}
                style={{
                  width: `${
                    show.seasons?.[show.curSeasonIndex]?.episode_count
                      ? calcCurProgress(
                          show.seasons,
                          show.curSeasonIndex,
                          show.curEpisode
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            {/* SEASON / EPISODES */}
            <div className="mt-1 flex justify-between text-zinc-400 text-sm font-bold mb-0.5">
              <span onClick={() => setIsProgressPickerOpen(true)}>
                Season: {show.curSeasonIndex + 1 || "-"}
              </span>
              <span onClick={() => setIsProgressPickerOpen(true)}>
                Episode: {show.curEpisode || "-"}
              </span>
            </div>
            {/* STATUS */}
            <div className="mt-2.5" data-no-drag>
              <label className="text-zinc-400 text-xs font-medium">
                Status
              </label>
              <div className="pt-1 flex flex-wrap gap-2 pb-1">
                {showStatusOptions.map((status, index) => (
                  <button
                    key={status.value}
                    onClick={() =>
                      onAction({
                        type: "changeStatus",
                        payload: `${status.label}`,
                      })
                    }
                    className={`${
                      index === 3 ? "w-full" : "flex-1"
                    } px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      status.label === show.status
                        ? `${getStatusBg(status.label)} text-zinc-100`
                        : "text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            {/* NOTE */}
            <div className="mt-1" data-no-drag>
              <label className="text-zinc-400 text-xs font-medium">Notes</label>
              <div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 focus-within:ring-1 focus-within:ring-zinc-700 transition-all duration-200 max-h-22 overflow-auto">
                <MobileAutoTextarea
                  value={localNote}
                  onChange={(e) =>
                    onAction({
                      type: "changeNote",
                      payload: e.target.value,
                    })
                  }
                  onBlur={() => onAction({ type: "saveNote" })}
                  placeholder="Add your thoughts about this show..."
                  className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileScorePicker
        isOpen={isScorePickerOpen}
        score={show.score ?? 0}
        scoreOptions={scoreOptions}
        onClose={() => setIsScorePickerOpen(false)}
        onScoreChange={(nScore) =>
          onAction({ type: "changeScore", payload: nScore })
        }
      />
      <MobileProgressPicker
        isOpen={isProgressPickerOpen}
        seasons={show.seasons || []}
        curSeasonIndex={show.curSeasonIndex}
        curEpisode={show.curEpisode}
        onClose={() => setIsProgressPickerOpen(false)}
        onSeasonIndexChange={(seasonIndex) => {
          onAction({
            type: "changeSeasonNum",
            payload: seasonIndex,
          });
        }}
        onEpisodeChange={(episode) => {
          onAction({
            type: "changeEpisodeNum",
            payload: episode,
          });
        }}
      />
    </>
  );
}
