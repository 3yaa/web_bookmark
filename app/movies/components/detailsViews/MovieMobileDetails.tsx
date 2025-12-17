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

  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);

  // Velocity tracking with smoothing
  const velocityHistory = useRef<number[]>([]);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number>(0);

  // Rubber band resistance - exponential decay feels more natural
  const applyResistance = (deltaY: number): number => {
    const maxDrag = window.innerHeight * 0.5;
    // Exponential decay: starts 1:1, then progressively harder
    return maxDrag * (1 - Math.exp(-deltaY / maxDrag));
  };

  // Smooth velocity calculation using weighted average
  const getSmoothedVelocity = (): number => {
    const history = velocityHistory.current;
    if (history.length === 0) return 0;

    // Weight recent samples more heavily
    const weights = history.map((_, i) => Math.pow(2, i));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = history.reduce((sum, v, i) => sum + v * weights[i], 0);

    return weightedSum / totalWeight;
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

    // Allow drag when at top of scroll
    if (modal.scrollTop <= 1) {
      startY.current = e.touches[0].clientY;
      lastY.current = e.touches[0].clientY;
      lastTime.current = performance.now();
      velocityHistory.current = [];
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isScorePickerOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const currentY = e.touches[0].clientY;
    const currentTime = performance.now();
    const rawDelta = currentY - startY.current;

    // Track velocity with timestamps
    const timeDelta = currentTime - lastTime.current;
    if (timeDelta > 0) {
      const instantVelocity = (currentY - lastY.current) / timeDelta;
      velocityHistory.current.push(instantVelocity);
      // Keep only last 5 samples for smoothing
      if (velocityHistory.current.length > 5) {
        velocityHistory.current.shift();
      }
    }

    lastY.current = currentY;
    lastTime.current = currentTime;

    if (rawDelta > 0) {
      // Dragging down - apply rubber band
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setTranslateY(applyResistance(rawDelta));
      });
    } else if (modal.scrollTop <= 1 && rawDelta < -10) {
      // Trying to scroll up from top - release drag
      setIsDragging(false);
      setTranslateY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    cancelAnimationFrame(rafId.current);

    const velocity = getSmoothedVelocity();
    const screenHeight = window.innerHeight;

    // Dismiss thresholds - either position OR velocity
    const positionThreshold = screenHeight * 0.2; // 20% of screen
    const velocityThreshold = 0.4; // px/ms

    const shouldDismiss =
      translateY > positionThreshold ||
      (translateY > 50 && velocity > velocityThreshold);

    if (shouldDismiss) {
      safeUnlock();
      setIsExiting(true);

      // Calculate exit position based on velocity for natural feel
      const exitY = Math.max(screenHeight, translateY + velocity * 300);
      setTranslateY(exitY);

      setTimeout(onClose, 280);
    } else {
      // Snap back with spring animation
      setTranslateY(0);
    }

    setIsDragging(false);
    velocityHistory.current = [];
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

  useEffect(() => {
    scrollYRef.current = lockBodyScroll();
    requestAnimationFrame(() => setIsVisible(true));
    return () => safeUnlock();
  }, [safeUnlock]);

  // Dynamic styles based on drag state
  const dragProgress = Math.min(translateY / (window.innerHeight * 0.3), 1);
  const scale = isDragging ? 1 - dragProgress * 0.04 : 1;
  const borderRadius = isDragging ? Math.min(dragProgress * 24, 24) : 0;
  const backdropOpacity = 1 - dragProgress * 0.3;

  return (
    <>
      {/* Backdrop that fades during drag */}
      <div
        className="fixed inset-0 z-20 bg-black transition-opacity duration-300"
        style={{
          opacity: isVisible ? backdropOpacity : 0,
          pointerEvents: "none",
        }}
      />

      <div
        ref={modalRef}
        className={`fixed inset-0 z-30 bg-zinc-950 flex flex-col ${
          isScorePickerOpen ? "overflow-hidden" : "overflow-y-auto"
        }`}
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          borderRadius: `${borderRadius}px`,
          opacity: isVisible ? 1 : 0,
          transition: isDragging
            ? "none"
            : isExiting
            ? "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.28s ease-out, border-radius 0.28s ease-out"
            : "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease-out, border-radius 0.3s ease-out",
          willChange: isDragging ? "transform" : "auto",
          transformOrigin: "top center",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator pill */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 bg-zinc-600 rounded-full z-40 transition-opacity duration-200"
          style={{ opacity: isDragging ? 0.8 : 0.4 }}
        />

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
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                    onClick={onAddMovie}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                  <div className="flex items-center gap-2">
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
                    <button
                      className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5 active:scale-95 transition-transform duration-150"
                      onClick={() => onAction({ type: "needYearField" })}
                      title="Search with year"
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
            className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-300`}
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
            <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>

          <div className="px-4">
            <div className="mt-4">
              {movie.seriesTitle ? (
                <div className="text-zinc-400 text-sm font-medium -mt-2.5">
                  {movie.seriesTitle}
                </div>
              ) : (
                <div></div>
              )}
              <div className="flex justify-between">
                <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                  {movie.title}
                </h1>
                <div data-no-drag>
                  <button
                    onClick={() => setIsScorePickerOpen(true)}
                    className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md shadow-inner shadow-black/40 cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
                  >
                    {movie.score || "-"}
                  </button>
                </div>
              </div>
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
                            onAction({ type: "seriesNav", payload: "prequel" });
                          }
                        }}
                      >
                        {movie.prequel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-end shrink-0">
                  {movie.placeInSeries && (
                    <label className="text-sm font-medium text-zinc-400/85">
                      {movie.placeInSeries}
                    </label>
                  )}
                </div>
                <div className="min-w-0 text-right flex justify-end">
                  {movie.sequel && (
                    <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                      <span
                        className={`truncate min-w-0 transition-all duration-200 ${
                          !addingMovie ? "hover:underline active:scale-95" : ""
                        }`}
                        onClick={() => {
                          if (!addingMovie) {
                            onAction({ type: "seriesNav", payload: "sequel" });
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
                    onAction({ type: "changeNote", payload: e.target.value })
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
