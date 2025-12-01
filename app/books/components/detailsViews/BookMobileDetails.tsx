import { BookProps } from "@/types/book";
import { BookAction } from "../BookDetailsHub";
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
} from "lucide-react";
import { bookStatusOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobilePicker } from "@/app/components/ui/MobileScorePicker";
import { MobileAutoTextarea } from "@/app/components/ui/MobileAutoTextArea";
import { Loading } from "@/app/components/ui/Loading";

interface BookMobileDetailsProps {
  book: BookProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingBook?: boolean;
  onAddBook: () => void;
  onAction: (action: BookAction) => void;
  showBookInSeries?: (dir: "left" | "right") => void;
  coverUrls?: string[];
  coverIndex?: number;
}

export function BookMobileDetails({
  book,
  localNote,
  onClose,
  onAddBook,
  addingBook,
  onAction,
  isLoading,
  showBookInSeries,
  coverUrls,
  coverIndex,
}: BookMobileDetailsProps) {
  const [posterLoaded, setPosterLoaded] = useState(false);
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

  const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
    //detects which side of the div was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const elementWidth = rect.width;
    const isRightSide = clickX > elementWidth / 2;

    onAction({
      type: "changeCover",
      payload: isRightSide ? "next" : "prev",
    });
  };

  useEffect(() => {
    // original values
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    // lock body in place
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // trigger mount animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

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
      const finalY = Math.max(
        translateY + dragVelocity.current * 200,
        window.innerHeight
      );
      setTranslateY(finalY);
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 75);
    } else {
      setTranslateY(0);
    }

    setIsDragging(false);
    dragVelocity.current = 0;
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-30 bg-zinc-950 overflow-y-auto flex flex-col"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity: isVisible ? 1 : 0,
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
      {(posterLoaded || addingBook) && (
        <div className="sticky top-0 z-30">
          <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
            <button
              className="bg-zinc-800/20 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
              onClick={handleClose}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              {addingBook ? (
                <>
                  {/* DIFFERENT SERIES OPTIONS */}
                  {showBookInSeries && (
                    <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
                      <button
                        className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform duration-150"
                        onClick={() => showBookInSeries("left")}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400 transition-colors" />
                      </button>
                      <button
                        className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                        onClick={() => showBookInSeries("right")}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 transition-colors" />
                      </button>
                    </div>
                  )}
                  {/* MORE BOOKS */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5 active:scale-95 transition-transform duration-150"
                    onClick={() => {
                      onAction({ type: "moreBooks" });
                    }}
                    title={"More books"}
                  >
                    <ChevronsUp className="w-5 h-5 text-slate-400 transition-colors" />
                  </button>
                  {/* ADD BUTTON */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                    onClick={onAddBook}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                </>
              ) : (
                <button
                  className="bg-zinc-800/20 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                  onClick={() => onAction({ type: "deleteBook" })}
                >
                  <Trash2 className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* INFO */}
      <div className="pb-10">
        {/* COVER */}
        <div
          className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-300 ${
            isDragging && "rounded-lg"
          } ${coverUrls && coverUrls.length > 1 ? "cursor-pointer" : ""}`}
          onClick={
            coverUrls && coverUrls.length > 1 ? handleCoverChange : undefined
          }
        >
          {coverIndex !== undefined &&
          coverUrls !== undefined &&
          coverUrls[coverIndex] ? (
            <Image
              src={coverUrls[coverIndex]}
              alt={book.title || "Cover"}
              width={1280}
              height={900}
              className="object-cover w-full"
              onLoad={() => setPosterLoaded(true)}
            />
          ) : book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title || "Cover"}
              width={1280}
              height={900}
              className="object-cover w-full"
              onLoad={() => setPosterLoaded(true)}
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-zinc-700 to-zinc-800" />
          )}

          {/* COVER INDICATOR */}
          {coverUrls && coverUrls.length > 1 && coverIndex !== undefined && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-800/60 backdrop-blur-sm rounded-md">
              <span className="text-xs text-zinc-300 font-medium">
                {coverIndex + 1}/{coverUrls.length}
              </span>
            </div>
          )}

          {/* BOTTOM FADE */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>

        <div className="px-4">
          <div className="mt-4">
            {/* SERIES TITLE */}
            {book.seriesTitle ? (
              <div className="text-zinc-400 text-sm font-medium -mt-2.5">
                {book.seriesTitle}
              </div>
            ) : (
              <div></div>
            )}
            <div className="flex justify-between">
              {/* TITLE */}
              <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                {book.title}
              </h1>
              {/* SCORE */}
              <div data-no-drag>
                <MobilePicker
                  score={book.score || 0}
                  onScoreChange={(newScore) =>
                    onAction({
                      type: "changeScore",
                      payload: newScore,
                    })
                  }
                />
              </div>
            </div>
            {/* AUTHOR AND DATE */}
            <div className="text-zinc-400 text-sm -mt-1 flex items-center gap-2">
              <span>{book.author || "Unknown"}</span>•
              <span>{book.datePublished || "-"}</span>
              {book.dateCompleted && (
                <>
                  •<span>{formatDateShort(book.dateCompleted)}</span>
                </>
              )}
            </div>
          </div>
          {/* STATUS */}
          <div className="mt-3" data-no-drag>
            <label className="text-zinc-400 text-xs font-medium">Status</label>
            <div className="pt-1 flex justify-center gap-2 pb-1">
              {bookStatusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    onAction({
                      type: "changeStatus",
                      payload: `${status.label}`,
                    })
                  }
                  className={`flex-1 px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    status.label === book.status
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
          {book.placeInSeries && (
            <div className="pt-2.5 grid grid-cols-[1fr_2rem_1fr]" data-no-drag>
              {/* PREQUEL */}
              <div className="min-w-0 text-left">
                {book.prequel && (
                  <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                    <span className="flex-shrink-0">←</span>
                    <span
                      className={`truncate min-w-0 transition-all duration-200 ${
                        !addingBook ? "hover:underline active:scale-95" : ""
                      }`}
                      onClick={() => {
                        if (!addingBook) {
                          onAction({
                            type: "seriesNav",
                            payload: "prequel",
                          });
                        }
                      }}
                    >
                      {book.prequel}
                    </span>
                  </div>
                )}
              </div>
              {/* PLACEMENT */}
              <div className="flex justify-center items-end flex-shrink-0">
                {book.placeInSeries && (
                  <label className="text-sm font-medium text-zinc-400/85">
                    {book.placeInSeries}
                  </label>
                )}
              </div>
              {/* SEQUEL */}
              <div className="min-w-0 text-right flex justify-end">
                {book.sequel && (
                  <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                    <span
                      className={`truncate min-w-0 transition-all duration-200 ${
                        !addingBook ? "hover:underline active:scale-95" : ""
                      }`}
                      onClick={() => {
                        if (!addingBook) {
                          onAction({
                            type: "seriesNav",
                            payload: "sequel",
                          });
                        }
                      }}
                    >
                      {book.sequel}
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
                placeholder="Add your thoughts about this book..."
                className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
