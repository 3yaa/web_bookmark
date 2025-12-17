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
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const dragVelocity = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);

  /* ================= BODY LOCK ================= */

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

  /* ================= TOUCH HANDLERS ================= */

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

    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    if (scrollEl.scrollTop < 2) {
      startY.current = e.touches[0].clientY;
      lastY.current = startY.current;
      lastTime.current = Date.now();
      dragVelocity.current = 0;
      setIsDragging(true);

      // Disable momentum scrolling during drag (iOS fix)
      scrollEl.style.setProperty("-webkit-overflow-scrolling", "auto");
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isScorePickerOpen) return;

    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - startY.current;

    const timeDelta = currentTime - lastTime.current;
    if (timeDelta > 0) {
      dragVelocity.current = (currentY - lastY.current) / timeDelta;
    }

    lastY.current = currentY;
    lastTime.current = currentTime;

    if (deltaY > 0) {
      const resistance = Math.max(0.35, 1 - deltaY / 800);
      setTranslateY(deltaY * resistance);
    } else {
      setTranslateY(0);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.style.setProperty("-webkit-overflow-scrolling", "touch");
    }

    const threshold = 60;
    const velocityThreshold = 0.6;

    if (translateY > threshold || dragVelocity.current > velocityThreshold) {
      safeUnlock();

      setIsExiting(true);
      setTranslateY(window.innerHeight);

      setTimeout(onClose, 80);
    } else {
      setTranslateY(0);
    }

    setIsDragging(false);
    dragVelocity.current = 0;
  };

  /* ================= MOUNT / UNMOUNT ================= */

  useEffect(() => {
    scrollYRef.current = lockBodyScroll();

    requestAnimationFrame(() => setIsVisible(true));

    return () => {
      safeUnlock();
    };
  }, [safeUnlock]);

  /* ================= RENDER ================= */

  return (
    <>
      {/* OUTER DRAG SHELL */}
      <div
        className="fixed inset-0 z-30 bg-zinc-950"
        style={{
          transform: `translateY(${translateY}px)`,
          opacity: isVisible ? 1 : 0,
          transition: isDragging
            ? "none"
            : isExiting
            ? "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s"
            : "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          className={`h-full overflow-y-auto ${
            isScorePickerOpen ? "overflow-hidden" : ""
          }`}
        >
          {isLoading?.isTrue && (
            <Loading
              customStyle={isLoading.style}
              text={isLoading.text}
              isMobile
            />
          )}

          {/* ACTION BAR */}
          {(posterLoaded || addingMovie) && (
            <div className="sticky top-0 z-30">
              <div className="absolute top-0 left-0 right-0 px-4 py-3 flex justify-between">
                {addingMovie && (
                  <>
                    <button
                      className="bg-zinc-800/50 p-2 rounded-md active:scale-95"
                      onClick={onAddMovie}
                    >
                      <Plus className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="flex gap-2">
                      {showAnotherSeries && (
                        <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
                          <button
                            className="bg-zinc-800/50 p-2 rounded-md"
                            onClick={() => showAnotherSeries("left")}
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                          </button>
                          <button
                            className="bg-zinc-800/50 p-2 rounded-md"
                            onClick={() => showAnotherSeries("right")}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      )}

                      <button
                        className="bg-zinc-800/50 p-2 rounded-md"
                        onClick={() => onAction({ type: "needYearField" })}
                      >
                        <ChevronsUp className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="pb-10">
            {/* POSTER */}
            <div
              className="relative w-full overflow-hidden bg-zinc-900/40"
              style={{
                WebkitTransform: "translateZ(0)",
                transform: "translateZ(0)",
              }}
            >
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title || "Poster"}
                  width={1280}
                  height={900}
                  className="w-full object-cover"
                  onLoad={() => setPosterLoaded(true)}
                />
              ) : (
                <div className="h-64 bg-zinc-800" />
              )}

              <div className="absolute bottom-0 left-0 h-20 w-full bg-linear-to-t from-zinc-950 to-transparent" />
            </div>

            {/* INFO */}
            <div className="px-4">
              <div className="mt-4">
                {movie.seriesTitle && (
                  <div className="text-zinc-400 text-sm font-medium -mt-2.5">
                    {movie.seriesTitle}
                  </div>
                )}

                <div className="flex justify-between">
                  <h1 className="text-zinc-100 text-2xl font-bold">
                    {movie.title}
                  </h1>

                  <div data-no-drag>
                    <button
                      onClick={() => setIsScorePickerOpen(true)}
                      className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md"
                    >
                      {movie.score ?? "-"}
                    </button>
                  </div>
                </div>

                <div className="text-zinc-400 text-sm flex gap-2">
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
                <div className="pt-1 flex gap-2">
                  {movieStatusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() =>
                        onAction({
                          type: "changeStatus",
                          payload: status.label,
                        })
                      }
                      className={`flex-1 px-4 py-1.5 text-sm rounded-md border font-semibold ${
                        status.label === movie.status
                          ? `${getStatusBg(status.label)} text-zinc-100`
                          : "text-zinc-300 bg-zinc-900/40"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTES */}
              <div className="mt-2" data-no-drag>
                <label className="text-zinc-400 text-xs font-medium">
                  Notes
                </label>
                <div className="bg-zinc-800/40 rounded-lg p-3">
                  <MobileAutoTextarea
                    value={localNote}
                    onChange={(e) =>
                      onAction({
                        type: "changeNote",
                        payload: e.target.value,
                      })
                    }
                    onBlur={() => onAction({ type: "saveNote" })}
                    placeholder="Add your thoughts..."
                    className="w-full bg-transparent text-zinc-200 text-sm resize-none outline-none"
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
        onScoreChange={(s) => onAction({ type: "changeScore", payload: s })}
      />
    </>
  );
}
