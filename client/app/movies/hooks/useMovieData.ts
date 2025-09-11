import { MovieProps } from "@/types/movie";
import { useEffect, useState, useCallback } from "react";

const MOVIES_STORAGE_KEY = "mouthful_movies";

export function useMovieData() {
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [movieDataLoading, setMovieDataLoading] = useState(true);

  const isProcessingMovie = movieDataLoading;

  // Helper function to save movies to localStorage
  const saveMoviesToStorage = useCallback((moviesData: MovieProps[]) => {
    try {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(moviesData));
    } catch (e) {
      console.error("Error saving movies to localStorage", e);
    }
  }, []);

  // Helper function to load movies from localStorage
  const loadMoviesFromStorage = useCallback((): MovieProps[] => {
    try {
      const storedMovies = localStorage.getItem(MOVIES_STORAGE_KEY);
      return storedMovies ? JSON.parse(storedMovies) : [];
    } catch (e) {
      console.error("Error loading movies from localStorage", e);
      return [];
    }
  }, []);

  // GET
  const getMovies = useCallback(async () => {
    try {
      setMovieDataLoading(true);
      const moviesFromStorage = loadMoviesFromStorage();
      setMovies(moviesFromStorage);
    } catch (e) {
      console.error("Error loading movies", e);
      setMovies([]);
    } finally {
      setMovieDataLoading(false);
    }
  }, [loadMoviesFromStorage]);

  // POST (Add Movie)
  const addMovie = useCallback(
    async (movie: MovieProps) => {
      // req data
      if (!movie.title || !movie.status || !movie.imdbId) {
        return;
      }

      try {
        setMovieDataLoading(true);

        // Generate a temporary ID if not provided
        const newMovie = {
          ...movie,
          id: movie.id || Date.now(), // Use timestamp as temporary ID
        };

        const updatedMovies = [...movies, newMovie];
        setMovies(updatedMovies);
        saveMoviesToStorage(updatedMovies);
      } catch (e) {
        console.error("Error adding movie", e);
      } finally {
        setMovieDataLoading(false);
      }
    },
    [movies, saveMoviesToStorage]
  );

  // PATCH
  const updateMovie = useCallback(
    async (movieId: number, updates: Partial<MovieProps>) => {
      // only updates these
      const allowedFields = [
        "score",
        "status",
        "note",
        "dateCompleted",
        "curCoverIndex",
      ];
      const invalidFields = Object.keys(updates).filter(
        (field) => !allowedFields.includes(field)
      );
      if (invalidFields.length > 0) {
        console.warn("Invalid fields attempted:", invalidFields);
        return;
      }

      try {
        // update local immediately
        const updatedMovies = movies.map((movie) =>
          movie.id === movieId ? { ...movie, ...updates } : movie
        );
        setMovies(updatedMovies);
        saveMoviesToStorage(updatedMovies);
      } catch (e) {
        console.error("Error updating movie", e);
      }
    },
    [movies, saveMoviesToStorage]
  );

  // DELETE
  const deleteMovie = useCallback(
    async (movieId: number) => {
      try {
        setMovieDataLoading(true);

        const updatedMovies = movies.filter((movie) => movie.id !== movieId);
        setMovies(updatedMovies);
        saveMoviesToStorage(updatedMovies);
      } catch (e) {
        console.error("Error deleting movie", e);
      } finally {
        setMovieDataLoading(false);
      }
    },
    [movies, saveMoviesToStorage]
  );

  // Load movies on component mount
  useEffect(() => {
    getMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    movies,
    addMovie,
    updateMovie,
    deleteMovie,
    isProcessingMovie,
  };
}
