import { MovieProps } from "@/types/movie";
import { MovieAction } from "../MovieDetailsHub";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { getStatusBg } from "@/utils/formattingUtils";
import { HorizontalScoreWheel } from "@/app/components/ui/WheelSelector";

interface MovieDetailsMobileProps {
  movie: MovieProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingMovie?: boolean;
  onAddMovie: () => void;
  showAnotherSeries?: (seriesDir: "left" | "right") => void;
  onAction: (action: MovieAction) => void;
}

export function MovieDetailsMobile({
  movie,
  onClose,
  isLoading,
  addingMovie,
  showAnotherSeries,
  onAddMovie,
  localNote,
  onAction,
}: MovieDetailsMobileProps) {
  const CLOSE_THRESHOLD = 200;
  const [translateY, setTranslateY] = useState(window.innerHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    //
    if (translateY > CLOSE_THRESHOLD) {
      handleClose();
    } else {
      setTranslateY(0);
    }
  };

  const handleClose = useCallback(() => {
    setTranslateY(window.innerHeight);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleCurStatus = (status: string) => {
    if (status === movie.status) {
      return getStatusBg(status);
    }
    return;
  };

  useEffect(() => {
    // animate on mount
    setTranslateY(0);
    document.body.style.overflow = "hidden";
    //
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-20 flex flex-col">
      <div className="flex-1 transition-opacity" onClick={handleClose} />
      {/* bottom sheet? */}
      <div
        ref={sheetRef}
        className="transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className="bg-black rounded-xs overflow-y-auto min-h-[95dvh]"
        >
          <div className="flex justify-between px-3">
            <X className="bg-white" />
            <span className="bg-white">Save</span>
          </div>
          <span className="flex justify-center">{movie.title}</span>
          {/* STATUS */}
          <span>Status</span>
          <div className="flex justify-center items-center gap-5">
            {movieStatusOptions.map((status) => (
              <div
                key={status.value}
                className={`p-1 px-3.5 rounded-md border border-zinc-800 ${handleCurStatus(
                  status.label
                )}`}
                onClick={() => {
                  onAction({
                    type: "changeStatus",
                    payload: `${status.label}`,
                  });
                }}
              >
                {status.label}
              </div>
            ))}
          </div>
          {/* SCORE */}
          <HorizontalScoreWheel
            value={movie.score ?? 0}
            onChange={(newScore) =>
              onAction({ type: "changeScore", payload: newScore })
            }
          />
        </div>
      </div>
    </div>
  );
}
