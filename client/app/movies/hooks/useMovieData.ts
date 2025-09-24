import { MovieProps } from "@/types/movie";
import { useEffect, useState, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useMovieData() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [movies, setMovies] = useState<MovieProps[]>([]);
  const [movieDataLoading, setMovieDataLoading] = useState(true);

  const isProcessingMovie = movieDataLoading || isAuthLoading;

  // READ
  const getMovies = useCallback(async () => {
    try {
      setMovieDataLoading(true);
      //
      const url = `/api/movies`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const moviesDB = resJson.data || [];
      setMovies(moviesDB);
    } catch (e) {
      console.error("Error loading movies", e);
      setMovies([]);
    } finally {
      setMovieDataLoading(false);
    }
  }, [authFetch]);

  // CREATE
  const addMovie = useCallback(
    async (movie: MovieProps) => {
      // req data
      if (!movie.title || !movie.status || !movie.imdbId) {
        return;
      }
      //
      try {
        setMovieDataLoading(true);
        //
        const url = `/api/movies`;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movie),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const newMovie = resJson.data;
        setMovies((prev) => [...prev, newMovie]);
      } catch (e) {
        console.error("Error adding movie", e);
      } finally {
        setMovieDataLoading(false);
      }
    },
    [authFetch]
  );

  // UPDATE
  const updateMovie = useCallback(
    async (movieId: number, updates: Partial<MovieProps>) => {
      try {
        // only updates these
        const allowedFields = ["score", "status", "note", "dateCompleted"];
        const invalidFields = Object.keys(updates).filter(
          (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
          console.warn("Invalid fields attempted:", invalidFields);
          return;
        }
        // update local immediately
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.id === movieId ? { ...movie, ...updates } : movie
          )
        );
        // update db
        const url = `/api/movies/${movieId}`;
        const options = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error updating movie", e);
      }
    },
    [authFetch]
  );

  // DELETE
  const deleteMovie = useCallback(
    async (movieId: number) => {
      try {
        setMovieDataLoading(true);
        //
        const url = `/api/movies/${movieId}`;
        const options = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const deletedMovie = resJson.data;
        setMovies((prevMovies) => {
          return prevMovies.filter((movie) => movie.id !== deletedMovie.id);
        });
      } catch (e) {
        console.error("Error deleting movie", e);
      } finally {
        setMovieDataLoading(false);
      }
    },
    [authFetch]
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
