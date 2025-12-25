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
  const [isVisible, setIsVisible] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // ---- drag refs ----
  const isDraggingRef = useRef(false);
  const startY = useRef(0);
  const translateY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);

  // ---- body lock ----
  const scrollYRef = useRef(0);
  const bodyUnlockedRef = useRef(false);

  const setTranslateY = (y: number) => {
    translateY.current = y;
    if (modalRef.current) {
      modalRef.current.style.transform = `translateY(${y}px)`;
    }
  };

  const lockBodyScroll = () => {
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return y;
  };

  const safeUnlock = useCallback(() => {
    if (bodyUnlockedRef.current) return;
    bodyUnlockedRef.current = true;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    window.scrollTo(0, scrollYRef.current);
  }, []);

  // ---- touch handlers ----
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
    if (!modal || modal.scrollTop > 2) return;

    const y = e.touches[0].clientY;

    isDraggingRef.current = true;
    startY.current = y;
    lastY.current = y;
    lastTime.current = performance.now();
    velocity.current = 0;

    modal.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isScorePickerOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const y = e.touches[0].clientY;
    const deltaY = y - startY.current;
    if (deltaY < 0 || modal.scrollTop > 2) return;

    const now = performance.now();
    const dy = y - lastY.current;
    const dt = now - lastTime.current;

    if (dt > 0) velocity.current = dy / dt;

    lastY.current = y;
    lastTime.current = now;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const resistance = Math.exp(-deltaY / 400);
      setTranslateY(deltaY * resistance);
    });
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const modal = modalRef.current;
    if (!modal) return;

    modal.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";

    if (translateY.current > 80 || velocity.current > 0.6) {
      safeUnlock();
      setTranslateY(window.innerHeight);
      setTimeout(onClose, 120);
    } else {
      setTranslateY(0);
    }
  };

  // ---- lifecycle ----
  useEffect(() => {
    scrollYRef.current = lockBodyScroll();

    requestAnimationFrame(() => setIsVisible(true));

    return () => {
      safeUnlock();
      if (rafId.current) cancelAnimationFrame(rafId.current);
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
          opacity: isVisible ? 1 : 0,
          touchAction: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
                          className="p-2"
                          onClick={() => showAnotherSeries("left")}
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <button
                          className="p-2"
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
          <div className="relative w-full bg-zinc-900/40">
            {movie.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={1280}
                height={900}
                className="object-cover w-full"
                onLoad={() => setPosterLoaded(true)}
              />
            )}
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-zinc-950" />
          </div>

          <div className="px-4 mt-4">
            <h1 className="text-zinc-100 text-2xl font-bold">{movie.title}</h1>

            <div className="mt-1 text-zinc-400 text-sm">
              {movie.director || "Unknown"} • {movie.dateReleased || "-"}
              {movie.dateCompleted && (
                <> • {formatDateShort(movie.dateCompleted)}</>
              )}
            </div>

            {/* STATUS */}
            <div className="mt-3" data-no-drag>
              <label className="text-zinc-400 text-xs">Status</label>
              <div className="flex gap-2 mt-1">
                {movieStatusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() =>
                      onAction({
                        type: "changeStatus",
                        payload: status.label,
                      })
                    }
                    className={`flex-1 px-4 py-1.5 rounded-md text-sm font-semibold ${
                      status.label === movie.status
                        ? getStatusBg(status.label)
                        : "bg-zinc-800/50 text-zinc-300"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* NOTES */}
            <div className="mt-3" data-no-drag>
              <label className="text-zinc-400 text-xs">Notes</label>
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
        onScoreChange={(n) => onAction({ type: "changeScore", payload: n })}
      />
    </>
  );
}
