"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Plus } from "lucide-react";
import { MediaStatus } from "@/types/media";
import { MovieProps, SortConfig } from "@/types/movie";
// hooks
import { useSortMovies } from "@/app/movies/hooks/useSortMovies";
import { useMovieData } from "@/app/movies/hooks/useMovieData";
// components
import { AddMovie } from "./addMovie/AddMovie";
import { MovieDetails } from "./MovieDetails";
import { MovieMobileListing } from "./listing/MovieMobileListing";
import { MovieDesktopListing } from "./listing/MovieDesktopListing";

export default function MoviesHub() {
  const { movies, addMovie, updateMovie, deleteMovie, isProcessingMovie } =
    useMovieData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  //delegation
  const [selectedMovie, setSelectedMovie] = useState<MovieProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "movieDetails" | "addMovie" | null
  >(null);

  // change ground truth
  const [isFilterPending, startTransition] = useTransition();
  const filteredMovies = useMemo(() => {
    if (statusFilter) {
      return statusFilter
        ? movies.filter((movie) => movie.status === statusFilter)
        : movies;
    }
    return movies;
  }, [movies, statusFilter]);
  const sortedMovies = useSortMovies(filteredMovies, sortConfig);

  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (targetTitle) {
        // !NEEDS TO MAKE THIS CALL WITH THE ENTIRE DB
        const targetMovie = movies.find(
          (movie) => movie.title.toLowerCase() === targetTitle.toLowerCase()
        );

        if (targetMovie) {
          setSelectedMovie(targetMovie);
        } else {
          // need to call external API
          setTitleToUse(targetTitle);
          setActiveModal("addMovie");
        }
        return;
      }
    },
    [movies]
  );

  const handleMovieUpdates = useCallback(
    async (
      movieId: number,
      updates?: Partial<MovieProps>,
      shouldDelete?: boolean
    ) => {
      if (updates) {
        if (selectedMovie?.id === movieId) {
          setSelectedMovie({ ...selectedMovie, ...updates });
        }
        updateMovie(movieId, updates);
      } else if (shouldDelete) {
        await deleteMovie(movieId);
      }
    },
    [deleteMovie, selectedMovie, updateMovie]
  );

  const handleSortConfig = (sortType: SortConfig["type"]) => {
    setSortConfig((prev) => {
      if (!prev || prev.type !== sortType) {
        return { type: sortType, order: "desc" };
      } else if (prev.order === "desc") {
        return { type: sortType, order: "asc" };
      } else {
        return null;
      }
    });
  };

  const handleStatusFilterConfig = (status: MediaStatus) => {
    startTransition(() => {
      if (statusFilter === status) {
        setStatusFilter(null);
      } else {
        setStatusFilter(status);
      }
    });
  };

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setTitleToUse("");
    setSelectedMovie(null);
  }, []);

  const handleMovieClicked = useCallback((movie: MovieProps) => {
    setActiveModal("movieDetails");
    setSelectedMovie(movie);
  }, []);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setActiveModal("addMovie");
      }
    };
    //
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return (
    <div className="min-h-screen">
      <div className="lg:block hidden">
        <MovieDesktopListing
          movies={sortedMovies}
          isProcessingMovie={isProcessingMovie}
          sortConfig={sortConfig}
          onSortConfig={handleSortConfig}
          onMovieClicked={handleMovieClicked}
        />
      </div>
      <div className="block lg:hidden">
        <MovieMobileListing
          movies={sortedMovies}
          isProcessingMovie={isProcessingMovie || isFilterPending}
          sortConfig={sortConfig}
          curStatusFilter={statusFilter}
          onMovieClicked={handleMovieClicked}
          onSortConfig={handleSortConfig}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      {/* ADD BUTTON */}
      <div className="fixed lg:bottom-10 lg:right-12 bottom-4 right-4 z-10">
        <button
          onClick={() => setActiveModal("addMovie")}
          className="bg-emerald-700 hover:bg-emerald-600 p-4.5 rounded-full shadow-lg shadow-emerald-700/20 hover:shadow-emerald-500/30 transition-all duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
        </button>
        <AddMovie
          isOpen={activeModal === "addMovie"}
          onClose={handleModalClose}
          existingMovies={movies}
          onAddMovie={addMovie}
          titleFromAbove={titleToUse}
        />
      </div>
      {/* MOVIE DETAILS */}
      {selectedMovie && (
        <MovieDetails
          isOpen={activeModal === "movieDetails"}
          movie={selectedMovie}
          onClose={handleModalClose}
          onUpdate={handleMovieUpdates}
          showSequelPrequel={showSequelPrequel}
        />
      )}
    </div>
  );
}
