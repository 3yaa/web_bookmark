import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
// utils and ui components
import { formatDateShort, getStatusBorderColor } from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { MovieProps, SortConfig } from "@/types/movie";

interface DesktopListingProps {
  movies: MovieProps[];
  isProcessingMovie: boolean;
  sortConfig: SortConfig | null;
  onSortConfig: (sortType: SortConfig["type"]) => void;
  onMovieClicked: (show: MovieProps) => void;
}

export default function DesktopListing({
  movies,
  isProcessingMovie,
  sortConfig,
  onSortConfig,
  onMovieClicked,
}: DesktopListingProps) {
  return (
    <div className="w-full md:w-[70%] lg:w-[60%] mx-auto">
      {/* HEADING */}
      <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
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
      <div className="relative bg-black/20 backdrop-blur-lg">
        {isProcessingMovie && (
          <Loading customStyle={"mt-72 h-12 w-12 border-gray-400"} text="" />
        )}
      </div>
      {!isProcessingMovie && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 italic text-lg">
            No movies yet — add one!
          </p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessingMovie &&
        movies.map((movie, index) => (
          <div
            key={movie.id}
            className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
              movie.status
            )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
              index === 0 ? "pt-1.5 rounded-bl-none" : "rounded-l-none"
            }
              ${index === movies.length - 1 && "rounded-bl-md"}  
                 hover:cursor-pointer`}
            onClick={() => onMovieClicked(movie)}
          >
            <span className="font-medium text-zinc-300 text-sm">
              {index + 1}
            </span>
            <div className="w-12.5 h-18">
              {movie.posterUrl !== undefined ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title || "Untitled"}
                  width={1280}
                  height={720}
                  priority
                  className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-zinc-400 text-[70%] group-hover:text-emerald-400 flex gap-1">
                {movie.seriesTitle ? (
                  <>
                    <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden flex-shrink">
                      {movie.seriesTitle}
                    </span>
                    <span>᭡</span>
                    <span>{movie.placeInSeries}</span>
                  </>
                ) : (
                  ""
                )}
              </span>
              <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-emerald-400 transition-colors duration-200 truncate max-w-53">
                {movie.title || "-"}
              </span>
            </div>
            <span className="text-center font-semibold text-zinc-300 text-sm">
              {movie.score || "-"}
            </span>
            <span className="text-center font-medium text-zinc-300 text-sm truncate">
              {movie.status === "Completed"
                ? formatDateShort(movie.dateCompleted) || "?"
                : "-"}
            </span>
            <span className="text-center font-semibold text-zinc-300 text-sm truncate">
              {movie.director || "-"}
            </span>
            <span className="text-center font-medium text-zinc-300 text-sm truncate pl-0.5">
              {movie.dateReleased || "-"}
            </span>
            <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center">
              {movie.note || "No notes"}
            </span>
          </div>
        ))}
    </div>
  );
}
