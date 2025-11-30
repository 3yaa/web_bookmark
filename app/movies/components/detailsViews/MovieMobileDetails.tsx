import { MovieProps } from "@/types/movie";
import { MovieAction } from "../MovieDetailsHub";
import React, { useEffect, useState, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobilePicker } from "@/app/components/ui/MobileScorePicker";
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
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [exitStyle, setExitStyle] = useState<{
    opacity?: number;
    scale?: number;
    translateY?: number;
  }>({});

  const startY = useRef(0);
  const startScrollY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragVelocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    // 🔥 iOS-friendly body lock
    document.body.style.overflow = "hidden";

    // if (!isIOS) {
    //   document.body.style.position = "fixed";
    //   document.body.style.top = `-${scrollY}px`;
    //   document.body.style.width = "100%";
    // }

    requestAnimationFrame(() => setIsVisible(true));

    return () => {
      const cleanup = () => {
        document.body.style.overflow = originalOverflow;

        // if (!isIOS) {
        //   document.body.style.position = originalPosition;
        //   document.body.style.top = originalTop;
        //   document.body.style.width = "";
        //   window.scrollTo(0, scrollY);
        // }
      };

      // 🔥 iOS needs delay to prevent address bar flash
      setTimeout(cleanup, 60);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
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
      setIsExiting(true);

      // 🔥 iOS-safe exit
      setExitStyle({ translateY: window.innerHeight });

      setTimeout(() => onClose(), 180);
    } else {
      setTranslateY(0);
    }

    setIsDragging(false);
    dragVelocity.current = 0;
  };

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-30 bg-zinc-950 flex flex-col overflow-y-auto`}
      style={{
        transform: isExiting
          ? `scale(${exitStyle.scale ?? 1})`
          : `translateY(${translateY}px)`,
        opacity: isExiting ? exitStyle.opacity ?? 1 : isVisible ? 1 : 0,
        transition: isDragging
          ? "none"
          : "transform 0.28s cubic-bezier(0.3,0,0.2,1), opacity 0.25s ease",
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

      {(posterLoaded || addingMovie) && (
        <div className="sticky top-0 z-30">
          <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {addingMovie && (
                <>
                  {showAnotherSeries && (
                    <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
                      <button
                        className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform"
                        onClick={() => showAnotherSeries("left")}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform"
                        onClick={() => showAnotherSeries("right")}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  )}

                  <button
                    className="bg-zinc-800/50 p-2 rounded-md px-2.5 active:scale-95 transition-transform"
                    onClick={() => onAction({ type: "needYearField" })}
                  >
                    <ChevronsUp className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform"
                    onClick={onAddMovie}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="pb-10">
        <div
          className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-300 ${
            isDragging && "rounded-lg"
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

          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>

        <div className="px-4">
          <div className="mt-4">
            {movie.seriesTitle && (
              <div className="text-zinc-400 text-sm font-medium -mt-2.5">
                {movie.seriesTitle}
              </div>
            )}

            <div className="flex justify-between">
              <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                {movie.title}
              </h1>

              <div data-no-drag>
                <MobilePicker
                  score={movie.score || 0}
                  onScoreChange={(newScore) =>
                    onAction({ type: "changeScore", payload: newScore })
                  }
                />
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
            <label className="text-zinc-400 text-xs font-medium">Status</label>

            <div className="pt-1 flex justify-center gap-2 pb-1">
              {movieStatusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    onAction({ type: "changeStatus", payload: status.label })
                  }
                  className={`flex-1 px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold transition-all active:scale-95 ${
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

          {/* SERIES NAV */}
          {movie.placeInSeries && (
            <div className="pt-2.5 grid grid-cols-[1fr_2rem_1fr]" data-no-drag>
              <div className="min-w-0 text-left">
                {movie.prequel && (
                  <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                    <span className="flex-shrink-0">←</span>
                    <span
                      className={`truncate min-w-0 ${
                        !addingMovie ? "hover:underline active:scale-95" : ""
                      }`}
                      onClick={() =>
                        !addingMovie &&
                        onAction({ type: "seriesNav", payload: "prequel" })
                      }
                    >
                      {movie.prequel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center items-end">
                <label className="text-sm font-medium text-zinc-400/85">
                  {movie.placeInSeries}
                </label>
              </div>

              <div className="min-w-0 text-right flex justify-end">
                {movie.sequel && (
                  <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                    <span
                      className={`truncate min-w-0 ${
                        !addingMovie ? "hover:underline active:scale-95" : ""
                      }`}
                      onClick={() =>
                        !addingMovie &&
                        onAction({ type: "seriesNav", payload: "sequel" })
                      }
                    >
                      {movie.sequel}
                    </span>
                    <span className="flex-shrink-0">→</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTE */}
          <div className="mt-1" data-no-drag>
            <label className="text-zinc-400 text-xs font-medium">Notes</label>

            <div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 max-h-22 overflow-auto">
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
  );
}
