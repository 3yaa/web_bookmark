import { MovieProps } from "@/types/movie";
import { MovieAction } from "../MovieDetailsHub";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
  const [translateY, setTranslateY] = useState(window.innerHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const CLOSE_THRESHOLD = 500;

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
            <X />
            <span>Save</span>
          </div>
          <span className="flex justify-center">{movie.title}</span>
        </div>
      </div>
    </div>
  );
}
