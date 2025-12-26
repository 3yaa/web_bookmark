import { BookProps } from "@/types/book";
import { BookAction } from "../BookDetailsHub";
import React, { useEffect, useState, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";
import { bookStatusOptions, scoreOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobileScorePicker } from "@/app/components/ui/MobileScorePicker";
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
  const [isScorePickerOpen, setIsScorePickerOpen] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  // drag state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("textarea") ||
      target.closest("input") ||
      isScorePickerOpen
    )
      return;

    const container = containerRef.current;
    if (!container) return;

    // only start drag if at top of scroll
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    // only allow downward drag and only when scrolled to top
    if (deltaY > 0 && container.scrollTop <= 0) {
      e.preventDefault(); // Prevent scroll

      // apply resistance curve for natural feel
      const resistance = 1 - Math.min(deltaY / 600, 0.6);
      setDragY(deltaY * resistance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY.current - startY.current;
    const velocity = deltaY; // velocity approximation

    // 120px or fast swipe
    if (deltaY > 120 || velocity > 0.8) {
      // animate out
      setDragY(window.innerHeight);
      setTimeout(onClose, 250);
    } else {
      // spring back
      setDragY(0);
    }

    setIsDragging(false);
  };

  // lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        style={{
          transform: `translate3d(0, ${dragY}px, 0)`,
          transition: isDragging
            ? "none"
            : "transform 0.35s cubic-bezier(0.35, 0.72, 0, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={containerRef}
          className={`w-full h-full bg-zinc-950 flex flex-col ${
            isScorePickerOpen ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
          }}
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
                {addingBook && (
                  <>
                    {/* ADD BUTTON */}
                    <button
                      className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
                      onClick={onAddBook}
                    >
                      <Plus className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {/* INFO */}
          <div className="pb-10">
            {/* COVER */}
            <div
              className={`relative w-full overflow-hidden bg-zinc-900/40 ${
                isDragging ? "rounded-lg" : ""
              } ${coverUrls && coverUrls.length > 1 ? "cursor-pointer" : ""}`}
              style={{
                willChange: isDragging ? "transform" : "auto",
              }}
              onClick={
                coverUrls && coverUrls.length > 1
                  ? handleCoverChange
                  : undefined
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
                  style={{
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                  }}
                  onLoad={() => setPosterLoaded(true)}
                />
              ) : book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title || "Cover"}
                  width={1280}
                  height={900}
                  className="object-cover w-full"
                  style={{
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                  }}
                  onLoad={() => setPosterLoaded(true)}
                />
              ) : (
                <div className="h-64 bg-linear-to-br from-zinc-700 to-zinc-800" />
              )}
              {/* COVER INDICATOR */}
              {coverUrls &&
                coverUrls.length > 1 &&
                coverIndex !== undefined && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-800/60 backdrop-blur-sm rounded-md">
                    <span className="text-xs text-zinc-300 font-medium">
                      {coverIndex + 1}/{coverUrls.length}
                    </span>
                  </div>
                )}
              {/* BOTTOM FADE */}
              <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>
            <div className="px-4">
              <div className="mt-4">
                {/* SERIES TITLE */}
                {book.seriesTitle ? (
                  <div className="text-zinc-400 text-sm font-semibold -mt-2.5">
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
                    <button
                      onClick={() => setIsScorePickerOpen(true)}
                      className="text-zinc-400 font-bold bg-zinc-800/60 px-3.5 py-1.75 rounded-md shadow-lg shadow-black cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
                    >
                      {book.score || "-"}
                    </button>
                  </div>
                </div>
                {/* AUTHOR AND DATE */}
                <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
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
                <label className="text-zinc-400 text-xs font-medium">
                  Status
                </label>
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
                      className={`flex-1 px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 shadow-lg shadow-black/50 ${
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
                <div
                  className="pt-5 grid grid-cols-[1fr_2rem_1fr]"
                  data-no-drag
                >
                  {/* PREQUEL */}
                  <div className="min-w-0 text-left">
                    {book.prequel && (
                      <div className="flex gap-1 font-semibold items-center text-sm text-zinc-400/80 min-w-0">
                        <span className="shrink-0">←</span>
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
                  <div className="flex justify-center items-end shrink-0">
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
                        <span className="shrink-0">→</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* NOTE */}
              <div className="mt-3" data-no-drag>
                <label className="text-zinc-400 text-xs font-medium">
                  Notes
                </label>
                <div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 focus-within:ring-1 focus-within:ring-zinc-700 transition-all duration-200 max-h-22 overflow-auto shadow-lg shadow-black/50">
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
      </div>
      <MobileScorePicker
        isOpen={isScorePickerOpen}
        score={book.score ?? 0}
        scoreOptions={scoreOptions}
        onClose={() => setIsScorePickerOpen(false)}
        onScoreChange={(nScore) =>
          onAction({ type: "changeScore", payload: nScore })
        }
      />
    </>
  );
}
