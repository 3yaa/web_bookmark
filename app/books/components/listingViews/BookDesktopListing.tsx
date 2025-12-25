import Image from "next/image";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
// utils and ui components
import {
  formatDateShort,
  getStatusBg,
  getStatusBorderColor,
  getStatusWaveColor,
} from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { BookProps, SortConfig } from "@/types/book";
import React, { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface BookDesktopListingProps {
  books: BookProps[];
  isProcessingBook: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onBookClicked: (book: BookProps) => void;
  onSearchChange: (searchVal: string) => void;
  searchQuery: string;
}

const BookItem = React.memo(
  ({
    book,
    index,
    totalBooks,
    onClick,
  }: {
    book: BookProps;
    index: number;
    totalBooks: number;
    onClick: (book: BookProps) => void;
  }) => (
    <div
      className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
        book.status
      )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
        index === 0 ? "rounded-bl-none" : "rounded-l-none"
      } 
        ${index === totalBooks - 1 && "rounded-bl-md"}  
          hover:cursor-pointer`}
      onClick={() => onClick(book)}
    >
      <span className="font-medium text-zinc-300 text-sm">{index + 1}</span>
      <div className="w-14 h-21">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title || "Untitled"}
            width={1280}
            height={720}
            priority
            className="w-full h-full object-fill rounded-sm"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30"></div>
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1 relative">
        <span className="font-semibold text-zinc-400 text-[70%] group-hover:text-zinc-300 flex gap-1">
          {book.seriesTitle ? (
            <>
              <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
                {book.seriesTitle}
              </span>
              <span>᭡</span>
              <span>{book.placeInSeries}</span>
            </>
          ) : (
            ""
          )}
        </span>
        <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-zinc-300 transition-colors duration-200 truncate max-w-53">
          {book.title || "-"}
        </span>
        <div
          className={`absolute -bottom-2.5 left-0 w-full ${getStatusBg(
            book.status
          )} h-0.75 rounded-md overflow-hidden`}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `${getStatusWaveColor(book.status)}`,
              animation: "wave 4s ease-in-out infinite",
              width: "200%",
            }}
          />
        </div>
      </div>
      <span className="flex items-center justify-center font-bold text-zinc-300 text-sm bg-linear-to-br from-zinc-800/80 to-zinc-900/90 mx-7.5 py-2 pb-1 rounded-lg shadow-lg shadow-black/20 border border-zinc-800/40">
        {book.score || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {book.status === "Completed"
          ? formatDateShort(book.dateCompleted) || "?"
          : "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {book.author || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate pl-0.5">
        {book.datePublished || "-"}
      </span>
      <span className="text-zinc-300/95 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center font-semibold group-hover:underline">
        {book.note || "No notes"}
      </span>
    </div>
  )
);
BookItem.displayName = "BookItem";

export function BookDesktopListing({
  books,
  isProcessingBook,
  sortConfig,
  onSortConfig,
  onBookClicked,
  onSearchChange,
  searchQuery,
}: BookDesktopListingProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: books.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 88,
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      //
      if (e.key === "/") {
        if (!searchOpen) {
          setSearchOpen(true);
          searchBarRef.current?.focus();
          e.preventDefault();
        }
      }
    };
    //
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [searchOpen]);

  return (
    <div className="w-full md:w-[70%] lg:w-[60%] mx-auto flex flex-col h-screen">
      {/* SEARCH BUTTON/BAR */}
      <div className="fixed top-1 right-1 z-20">
        <div className="relative">
          {/* SEARCH BUTTON */}
          <div
            className={`flex items-center gap-2 bg-zinc-900/70 backdrop-blur-sm  border-zinc-700/50 rounded-lg transition-all duration-300 ease-out ${
              searchOpen
                ? "w-72 px-3 py-2"
                : "w-9 h-9 px-0 py-0 cursor-pointer hover:bg-zinc-800/70"
            }`}
            onClick={() => {
              if (!searchOpen) {
                setSearchOpen(true);
                searchBarRef.current?.focus();
              }
            }}
          >
            <Search
              className={`w-4 h-4 text-zinc-400 shrink-0 transition-all duration-300 ${
                searchOpen ? "ml-0" : "ml-2.5"
              }`}
            />
            {/* SEARCH BAR */}
            <input
              type="text"
              ref={searchBarRef}
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              onBlur={() => !searchQuery && setSearchOpen(false)}
              placeholder="Search movies…"
              className={`bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none flex-1 transition-all duration-300 ${
                searchOpen
                  ? "w-full opacity-100 pointer-events-auto"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
            />
            {searchOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                  setSearchOpen(false);
                }}
                className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      {/* HEADING */}
      <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
        <span className="font-semibold text-zinc-300 text-sm">#</span>
        <span className="font-semibold text-zinc-300 text-sm">Cover</span>
        {/* TITLE */}
        <div
          className="flex justify-start items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("title")}
        >
          <span className="font-semibold text-zinc-300 text-sm">Title</span>
          {sortConfig?.type === "title" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* SCORE */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("score")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "score" ? "ml-4" : ""
            }`}
          >
            Score
          </span>
          {sortConfig?.type === "score" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* DATE COMPLETED */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("dateCompleted")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "dateCompleted" ? "ml-4" : ""
            }`}
          >
            Completed
          </span>
          {sortConfig?.type === "dateCompleted" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* AUTHOR */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("author")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "author" ? "ml-4" : ""
            }`}
          >
            Author
          </span>
          {sortConfig?.type === "author" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* DATE PUBLISHED */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("datePublished")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "datePublished" ? "ml-4" : ""
            }`}
          >
            Published
          </span>
          {sortConfig?.type === "datePublished" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
          Notes
        </span>
      </div>
      {/* LOADER */}
      {isProcessingBook && (
        <div className="relative bg-black/20 backdrop-blur-lg">
          <Loading customStyle="mt-72 h-12 w-12 border-gray-400" text="" />
        </div>
      )}
      {/* NO BOOKS */}
      {!isProcessingBook && books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 italic text-lg">
            No books yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingBook && books.length > 0 && (
        <div ref={parentRef} className="w-full overflow-auto flex-1">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const book = books[virtualItem.index];
              return (
                <div
                  key={book.id}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <BookItem
                    book={book}
                    index={virtualItem.index}
                    totalBooks={books.length}
                    onClick={onBookClicked}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
