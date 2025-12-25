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
  const [isSpringBack, setIsSpringBack] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const velocityTracker = useRef<{ y: number; time: number }[]>([]);
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Improved resistance curve - more natural feel
  const applyResistance = (distance: number): number => {
    const maxDistance = 400;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    // Use a cubic easing for more natural resistance
    return distance * (1 - Math.pow(normalizedDistance, 1.5) * 0.7);
  };

  // Calculate velocity with rolling average for smoother detection
  const calculateVelocity = (): number => {
    if (velocityTracker.current.length < 2) return 0;

    // Use last 5 samples for rolling average
    const samples = velocityTracker.current.slice(-5);
    let totalVelocity = 0;

    for (let i = 1; i < samples.length; i++) {
      const timeDelta = samples[i].time - samples[i - 1].time;
      if (timeDelta > 0) {
        const velocity = (samples[i].y - samples[i - 1].y) / timeDelta;
        totalVelocity += velocity;
      }
    }

    return totalVelocity / (samples.length - 1);
  };

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

    const modal = modalRef.current;
    if (!modal) return;

    // More lenient scroll threshold - allow drag from top 20px
    if (modal.scrollTop <= 20) {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      velocityTracker.current = [{ y: e.touches[0].clientY, time: Date.now() }];
      setIsDragging(true);
      setIsSpringBack(false);

      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isScorePickerOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    // Track velocity samples
    velocityTracker.current.push({
      y: currentY.current,
      time: Date.now(),
    });

    // Keep only recent samples (last 100ms)
    const now = Date.now();
    velocityTracker.current = velocityTracker.current.filter(
      (sample) => now - sample.time < 100
    );

    // Only allow downward drag
    if (deltaY > 0) {
      const resistedY = applyResistance(deltaY);
      setTranslateY(resistedY);

      // Prevent scrolling while dragging down
      e.preventDefault();
    } else if (modal.scrollTop <= 0) {
      // Allow slight upward resistance at the top
      const resistedY = deltaY * 0.2;
      setTranslateY(Math.max(resistedY, -30));
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

  // Smooth spring-back animation
  const springBack = () => {
    setIsSpringBack(true);

    const startValue = translateY;
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue * (1 - easeProgress);

      setTranslateY(newValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpringBack(false);
        setTranslateY(0);
      }
    };

    animate();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const velocity = calculateVelocity();
    const dismissThreshold = 100; // Distance threshold
    const velocityThreshold = 0.5; // Velocity threshold (px/ms)

    // Close if: dragged far enough OR fast enough downward swipe
    if (translateY > dismissThreshold || velocity > velocityThreshold) {
      safeUnlock();

      // Calculate momentum distance
      const momentumDistance = velocity * 300; // 300ms of momentum
      const finalY = Math.max(
        translateY + momentumDistance,
        window.innerHeight
      );

      setIsExiting(true);
      setTranslateY(finalY);

      setTimeout(() => {
        onClose();
      }, 250);
    } else {
      // Spring back smoothly
      springBack();
    }

    setIsDragging(false);
    velocityTracker.current = [];
  };

  useEffect(() => {
    scrollYRef.current = lockBodyScroll();

    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      safeUnlock();
    };
  }, [safeUnlock]);

  return (
    <>
      <div
        ref={modalRef}
        className={`fixed inset-0 z-30 bg-zinc-950 flex flex-col ${
          isScorePickerOpen ? "overflow-hidden" : "overflow-y-auto"
        }`}
        style={{
          transform: `translateY(${translateY}px)`,
          opacity: isVisible ? 1 : 0,
          transition:
            isDragging || isSpringBack
              ? "none"
              : isExiting
              ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out"
              : "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: isDragging ? "transform" : "auto",
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

        {/* Drag indicator */}
        <div className="sticky top-0 z-40 flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* ACTION BAR */}
        {(posterLoaded || addingMovie) && (
          <div className="sticky top-5 z-30">
            <div className="px-4 py-3 flex items-center justify-between">
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
            className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-200 ${
              isDragging && translateY > 10
                ? "rounded-2xl mx-4 w-[calc(100%-2rem)]"
                : ""
            }`}
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
              <div className="h-64 bg-gradient-to-br from-zinc-700 to-zinc-800" />
            )}
            {/* BOTTOM FADE */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
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
