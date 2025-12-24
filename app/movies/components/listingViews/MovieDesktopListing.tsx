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
import { MovieProps, SortConfig } from "@/types/movie";
import React, { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface MovieDesktopListingProps {
  movies: MovieProps[];
  isProcessingMovie: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onMovieClicked: (movie: MovieProps) => void;
  onSearchChange: (searchVal: string) => void;
  searchQuery: string;
}

const MovieItem = React.memo(
  ({
    movie,
    index,
    totalMovies,
    onClick,
  }: {
    movie: MovieProps;
    index: number;
    totalMovies: number;
    onClick: (movie: MovieProps) => void;
  }) => (
    <div
      key={movie.id}
      className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
        movie.status
      )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
        index === 0 ? "rounded-bl-none" : "rounded-l-none"
      }
        ${index === totalMovies - 1 && "rounded-bl-md"}  
           hover:cursor-pointer`}
      onClick={() => onClick(movie)}
    >
      <span className="font-medium text-zinc-300 text-sm">{index + 1}</span>
      <div className="w-14 h-21">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title || "Untitled"}
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
          {movie.seriesTitle ? (
            <>
              <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
                {movie.seriesTitle}
              </span>
              <span>᭡</span>
              <span>{movie.placeInSeries}</span>
            </>
          ) : (
            ""
          )}
        </span>
        <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-zinc-300 transition-colors duration-200 truncate max-w-53">
          {movie.title || "-"}
        </span>
        {/* STATUS */}
        <div
          className={`absolute -bottom-2.5 left-0 w-full ${getStatusBg(
            movie.status
          )} h-1 rounded-md overflow-hidden`}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `${getStatusWaveColor(movie.status)}`,
              animation: "wave 4s ease-in-out infinite",
              width: "200%",
            }}
          />
        </div>
      </div>
      <span className="flex items-center justify-center font-bold text-zinc-300 text-sm bg-linear-to-br from-zinc-800/80 to-zinc-900/90 mx-7.5 py-2 pb-1 rounded-lg shadow-lg shadow-black/20 border border-zinc-800/40">
        {movie.score || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {movie.status === "Completed"
          ? formatDateShort(movie.dateCompleted) || "?"
          : "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {movie.director || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate pl-0.5">
        {movie.dateReleased || "-"}
      </span>
      <span className="text-zinc-300/95 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center font-semibold group-hover:underline">
        {movie.note || "No notes"}
      </span>
    </div>
  )
);
MovieItem.displayName = "MovieItem";

export function MovieDesktopListing({
  movies,
  isProcessingMovie,
  sortConfig,
  onSortConfig,
  onMovieClicked,
  onSearchChange,
  searchQuery,
}: MovieDesktopListingProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 88,
  });

  return (
    <div className="" onClick={() => setSearchOpen(!searchOpen)}>
      <div className="w-full md:w-[70%] lg:w-[60%] mx-auto flex flex-col h-screen">
        {/* HEADING */}
        <div className="fixed top-0 right-5">
          {searchOpen && (
            <div className="px-4 pb-3">
              <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search movies…"
                  autoFocus
                  className="
            w-full
            bg-zinc-900/70
            border border-zinc-700/50
            rounded-lg
            pl-10 pr-4 py-2
            text-sm text-zinc-100
            placeholder-zinc-500
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-600/40
          "
                />
              </div>
            </div>
          )}
        </div>
        <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_1fr_6rem_6rem_11rem_5rem_0.85fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
          {/* SEARCH */}
          <div className="absolute -top-2 -right-13 flex items-center gap-3 px-4 py-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={`
                group flex items-center justify-center
                h-9 w-9 rounded-lg
                hover:bg-zinc-800
                transition-all
                ${searchOpen ? "ring-2 ring-emerald-600/40" : ""}
              `}
            >
              <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
            </button>
          </div>
          {/*  */}
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
          {/* DIRECTOR */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => onSortConfig("director")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "director" ? "ml-4" : ""
              }`}
            >
              Director
            </span>
            {sortConfig?.type === "director" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* DATE RELEASED */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => onSortConfig("dateReleased")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "dateReleased" ? "ml-4" : ""
              }`}
            >
              Released
            </span>
            {sortConfig?.type === "dateReleased" &&
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
        {isProcessingMovie && (
          <div className="relative bg-black/20 backdrop-blur-lg">
            <Loading customStyle="mt-72 h-12 w-12 border-gray-400" text="" />
          </div>
        )}
        {!isProcessingMovie && movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 italic text-lg">
              No movies yet — add one!
            </p>
          </div>
        )}
        {/* LISTING */}
        {!isProcessingMovie && movies.length > 0 && (
          <div ref={parentRef} className="w-full overflow-auto flex-1">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const movie = movies[virtualItem.index];
                return (
                  <div
                    key={movie.id}
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
                    <MovieItem
                      movie={movie}
                      index={virtualItem.index}
                      totalMovies={movies.length}
                      onClick={onMovieClicked}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
