import { MovieProps } from "@/types/movie";
import { MovieAction } from "../MovieDetailsHub";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";
import { movieStatusOptions, scoreOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobileScorePicker } from "@/app/components/ui/MobileScorePicker";
import { MobileAutoTextarea } from "@/app/components/ui/MobileAutoTextArea";
import { Loading } from "@/app/components/ui/Loading";

interface MovieMobileDetailsProps {
  movie: MovieProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingMovie?: boolean;
  onAddMovie: () => void;
  onAction: (action: MovieAction) => void;
  showAnotherSeries?: (dir: "left" | "right") => void;
}

export function MovieMobileDetails({
  movie,
  localNote,
  onClose,
  onAddMovie,
  addingMovie,
  onAction,
  isLoading,
  showAnotherSeries,
}: MovieMobileDetailsProps) {
  const [isScorePickerOpen, setIsScorePickerOpen] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startY = useRef(0);
  const startScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragVelocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const currentTranslateY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isScorePickerOpen) return;

    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("textarea") ||
      target.closest("[data-no-drag]")
    ) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    if (scrollContainer.scrollTop <= 5) {
      startY.current = e.touches[0].clientY;
      lastY.current = e.touches[0].clientY;
      lastTime.current = Date.now();
      startScrollY.current = scrollContainer.scrollTop;
      dragVelocity.current = 0;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isScorePickerOpen) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - startY.current;

    const timeDelta = currentTime - lastTime.current;
    if (timeDelta > 0) {
      dragVelocity.current = (currentY - lastY.current) / timeDelta;
    }

    lastY.current = currentY;
    lastTime.current = currentTime;

    if (scrollContainer.scrollTop <= 5 && deltaY > 0) {
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
    } else if (deltaY < 0 && scrollContainer.scrollTop <= 0) {
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

      // Calculate final position based on velocity
      const finalY = Math.max(
        currentTranslateY.current + dragVelocity.current * 250,
        window.innerHeight
      );

      // Immediately sync the current position to state before enabling transition
      setTranslateY(currentTranslateY.current);
      
      // Then enable transition and animate to final position
      requestAnimationFrame(() => {
        setIsDragging(false);
        setIsExiting(true);
        requestAnimationFrame(() => {
          setTranslateY(finalY);
        });
      });

      setTimeout(() => {
        onClose();
      }, 350);
    } else {
      setTranslateY(0);
      currentTranslateY.current = 0;
      setIsDragging(false);
    }

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
        className="fixed inset-0 z-30"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
          opacity: isVisible ? 1 : 0,
          willChange: isDragging ? "transform" : "auto",
          transition: isDragging
            ? "none"
            : isExiting
            ? "transform 0.35s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.25s ease-out"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={scrollContainerRef}
          className={`w-full h-full bg-zinc-950 flex flex-col ${
            isScorePickerOpen ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
        {isLoading?.isTrue && (
          <Loading
            customStyle={isLoading.style}
            text={isLoading.text}
            isMobile={true}
          />
        )}
        {/* ACTION BAR */}
        {(posterLoaded || addingMovie) && (
          <div className="sticky top-0 z-30">
            <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
              {addingMovie && (
                <>
                  {/* ADD BUTTON */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                    onClick={onAddMovie}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                  <div className="flex items-center gap-2">
                    {/* DIFFERENT SERIES OPTIONS */}
                    {showAnotherSeries && (
                      <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
                        <button
                          className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform duration-150"
                          onClick={() => showAnotherSeries("left")}
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-400 transition-colors" />
                        </button>
                        <button
                          className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                          onClick={() => showAnotherSeries("right")}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-400 transition-colors" />
                        </button>
                      </div>
                    )}
                    {/* NEED YEAR */}
                    <button
                      className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5 active:scale-95 transition-transform duration-150"
                      onClick={() => {
                        onAction({ type: "needYearField" });
                      }}
                      title={"Search with year"}
                    >
                      <ChevronsUp className="w-5 h-5 text-slate-400 transition-colors" />
                    </button>
                  </div>
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
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title || "Poster"}
                width={1280}
                height={900}
                className="object-cover w-full"
                onLoad={() => setPosterLoaded(true)}
              />
            ) : (
              <div className="h-64 bg-linear-to-br from-zinc-700 to-zinc-800" />
            )}
            {/* BOTTOM FADE */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>
          <div className="px-4">
            <div className="mt-4">
              {/* SERIES TITLE */}
              {movie.seriesTitle ? (
                <div className="text-zinc-400 text-sm font-medium -mt-2.5">
                  {movie.seriesTitle}
                </div>
              ) : (
                <div></div>
              )}
              <div className="flex justify-between">
                {/* TITLE */}
                <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                  {movie.title}
                </h1>
                {/* SCORE */}
                <div data-no-drag>
                  <button
                    onClick={() => setIsScorePickerOpen(true)}
                    className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md shadow-inner shadow-black/40 cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
                  >
                    {movie.score || "-"}
                  </button>
                </div>
              </div>
              {/* DIR AND DATE */}
              <div className="text-zinc-400 text-sm -mt-1 flex items-center gap-2">
                <span>{movie.director || "Unknown"}</span>•
                <span>{movie.dateReleased || "-"}</span>
                {movie.dateCompleted && (
                  <>
                    •<span>{formatDateShort(movie.dateCompleted)}</span>
                  </>
                )}
              </div>
            </div>
            {/* STATUS */}
            <div className="mt-3" data-no-drag>
              <label className="text-zinc-400 text-xs font-medium">
                Status
              </label>
              <div className="pt-1 flex justify-center gap-2 pb-1">
                {movieStatusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() =>
                      onAction({
                        type: "changeStatus",
                        payload: `${status.label}`,
                      })
                    }
                    className={`flex-1 px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      status.label === movie.status
                        ? `${getStatusBg(status.label)} text-zinc-100`
                        : "text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            {/* PREQUEL AND SEQUEL */}
            {movie.placeInSeries && (
              <div
                className="pt-2.5 grid grid-cols-[1fr_2rem_1fr]"
                data-no-drag
              >
                {/* PREQUEL */}
                <div className="min-w-0 text-left">
                  {movie.prequel && (
                    <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                      <span className="shrink-0">←</span>
                      <span
                        className={`truncate min-w-0 transition-all duration-200 ${
                          !addingMovie ? "hover:underline active:scale-95" : ""
                        }`}
                        onClick={() => {
                          if (!addingMovie) {
                            onAction({
                              type: "seriesNav",
                              payload: "prequel",
                            });
                          }
                        }}
                      >
                        {movie.prequel}
                      </span>
                    </div>
                  )}
                </div>
                {/* PLACEMENT */}
                <div className="flex justify-center items-end shrink-0">
                  {movie.placeInSeries && (
                    <label className="text-sm font-medium text-zinc-400/85">
                      {movie.placeInSeries}
                    </label>
                  )}
                </div>
                {/* SEQUEL */}
                <div className="min-w-0 text-right flex justify-end">
                  {movie.sequel && (
                    <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                      <span
                        className={`truncate min-w-0 transition-all duration-200 ${
                          !addingMovie ? "hover:underline active:scale-95" : ""
                        }`}
                        onClick={() => {
                          if (!addingMovie) {
                            onAction({
                              type: "seriesNav",
                              payload: "sequel",
                            });
                          }
                        }}
                      >
                        {movie.sequel}
                      </span>
                      <span className="shrink-0">→</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  placeholder="Add your thoughts about this movie..."
                  className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <MobileScorePicker
        isOpen={isScorePickerOpen}
        score={movie.score ?? 0}
        scoreOptions={scoreOptions}
        onClose={() => setIsScorePickerOpen(false)}
        onScoreChange={(nScore) =>
          onAction({ type: "changeScore", payload: nScore })
        }
      />
    </>
  );
}
