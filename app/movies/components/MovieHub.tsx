"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { MovieDetails } from "./MovieDetailsHub";
import { MovieMobileListing } from "./listingViews/MovieMobileListing";
import { MovieDesktopListing } from "./listingViews/MovieDesktopListing";
import { debounce } from "@/utils/debounce";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export default function MoviesHub() {
  const { movies, addMovie, updateMovie, deleteMovie, isProcessingMovie } =
    useMovieData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  //delegation
  const [selectedMovie, setSelectedMovie] = useState<MovieProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "movieDetails" | "addMovie" | null
  >(null);
  //
  const isButtonsVisible = useScrollVisibility(30);

  // set deboucne
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300)
  ).current;
  // SEARCH
  const searchedMovies = useMemo(() => {
    if (!debouncedQuery) return movies;

    return movies.filter((movie) =>
      movie.title.toLowerCase().trim().includes(debouncedQuery)
    );
  }, [movies, debouncedQuery]);
  // FILTER
  const [isFilterPending, startTransition] = useTransition();
  const filteredMovies = useMemo(() => {
    if (!statusFilter) return searchedMovies;
    //
    return searchedMovies.filter((movie) => movie.status === statusFilter);
  }, [searchedMovies, statusFilter]);
  // SORT
  const sortedMovies = useSortMovies(filteredMovies, sortConfig);

  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (targetTitle) {
        // !NEEDS TO MAKE THIS CALL WITH THE ENTIRE DB
        const targetMovie = movies.find(
          (movie) =>
            movie.title.toLowerCase().trim() ===
            targetTitle.toLowerCase().trim()
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
    // wait a frame before clearing state
    requestAnimationFrame(() => {
      setTitleToUse("");
      setSelectedMovie(null);
    });
  }, []);

  const handleMovieClicked = useCallback((movie: MovieProps) => {
    setActiveModal("movieDetails");
    setSelectedMovie(movie);
  }, []);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value.toLowerCase().trim());
  };

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      const isDesktop = window.matchMedia("(min-width: 900px)").matches;
      if (!isDesktop) return;
      // if no modal is open and not typing in an input/textarea
      if (
        e.key === "Enter" &&
        !activeModal &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
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
          onSearchChange={handleSearchQueryChange}
          searchQuery={searchQuery}
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
      <div
        className={`fixed lg:bottom-8 lg:right-10 bottom-1 right-1 z-10
        lg:translate-y-0 transition-transform duration-300 ease-in-out
        ${isButtonsVisible ? "translate-y-0" : "translate-y-24"}`}
      >
        <button
          onClick={() => setActiveModal("addMovie")}
          className="flex items-center justify-center w-14 h-14 lg:w-14 lg:h-14 rounded-full 
          bg-linear-to-br from-zinc-transparent to-zinc-800/60 
          hover:bg-linear-to-br hover:from-zinc-800/60 hover:to-transparent
          backdrop-blur-xl shadow-md shadow-zinc-800/60
          hover:scale-105 active:scale-95 
          transition-all duration-200 relative z-10 hover:cursor-pointer focus:outline-none"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
        </button>
      </div>
      <AddMovie
        isOpen={activeModal === "addMovie"}
        onClose={handleModalClose}
        existingMovies={movies}
        onAddMovie={addMovie}
        titleFromAbove={titleToUse}
      />
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
