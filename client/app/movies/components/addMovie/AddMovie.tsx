"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Clapperboard } from "lucide-react";
//
import { MovieProps, WikidataProps } from "@/types/movie";
//
import {
  cleanName,
  mapOMDbToMovie,
  mapTMDBToMovie,
  mapWikidataToMovie,
} from "@/app/movies/utils/movieMapping";
//
import { MovieDetails } from "../MovieDetails";
import { ManualAddMovie } from "./ManualAddMovie";
//
import { useMovieSearch } from "@/app/movies/hooks/useMovieSearch";
interface AddMovieProps {
  isOpen: boolean;
  onClose: () => void;
  existingMovies: MovieProps[];
  onAddMovie: (movie: MovieProps) => void;
  titleFromAbove?: string;
}

export function AddMovie({
  isOpen,
  onClose,
  existingMovies,
  onAddMovie,
  titleFromAbove,
}: AddMovieProps) {
  //failure reasons && their fixes -- for user
  const [failedReason, setFailedReason] = useState("");
  //
  const [isAddManual, setIsAddManual] = useState(false);
  const [needYear, setNeedYear] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "movieDetails" | "manualAdd" | null
  >(null);
  //
  const titleToSearch = useRef<HTMLInputElement>(null);
  const yearToSearch = useRef<HTMLInputElement>(null);
  //
  const [newMovie, setNewMovie] = useState<Partial<MovieProps>>({});
  const [allSeries, setAllSeries] = useState<WikidataProps[]>([]);
  const [curSeries, setCurSeries] = useState<number>(0);
  //
  const {
    searchForMovie,
    searchForPosters,
    searchForSeriesInfo,
    isMovieSearching,
  } = useMovieSearch();

  const reset = useCallback(() => {
    setFailedReason("");
    setIsAddManual(false);
    setNeedYear(false);
    //
    setActiveModal(null);
    setNewMovie({});
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
    if (yearToSearch.current) {
      yearToSearch.current.value = "";
    }
  }, []);

  const isDuplicate = useCallback(
    (imdbId: string) => {
      if (!existingMovies) return null;
      const duplicate = existingMovies.find(
        (movie: MovieProps) => movie.imdbId === imdbId
      );
      return duplicate ? duplicate.title : null;
    },
    [existingMovies]
  );

  const handleTitleSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;
    const yearSearchingStr = yearToSearch.current?.value.trim();
    const yearSearching = yearSearchingStr
      ? parseInt(yearSearchingStr, 10)
      : undefined;
    //
    const movieData = await searchForMovie(titleSearching, yearSearching);
    if (!movieData) return null;
    //format movie
    setNewMovie(mapOMDbToMovie(movieData));
    return {
      title: movieData.title,
      imdbId: movieData.imdbId,
    };
  }, [searchForMovie]);

  const handlePosterSearch = useCallback(
    async (imdbId: string) => {
      const posters = await searchForPosters(imdbId);
      if (!posters) return null;
      setNewMovie((prev) => ({ ...prev, ...mapTMDBToMovie(posters) }));
    },
    [searchForPosters]
  );

  const handleSeriesSearch = useCallback(
    async (imdbId: string) => {
      // make call
      const seriesData = await searchForSeriesInfo(imdbId);
      if (!seriesData || seriesData.length === 0) return null;
      //
      setAllSeries(seriesData);
      const mappedData = mapWikidataToMovie(seriesData[0]);
      setNewMovie((prev) => ({
        ...prev,
        title: cleanName(prev.title, mappedData.seriesTitle),
        ...mapWikidataToMovie(seriesData[0]),
        status: "Want to Watch",
      }));
    },
    [searchForSeriesInfo]
  );

  const handleMovieSearch = useCallback(async () => {
    setActiveModal("movieDetails");
    // make call to open lib
    const response = await handleTitleSearch();
    if (!response?.imdbId || !response.title) {
      setFailedReason("Could Not Find Movie.");
      setNeedYear(true);
      setIsAddManual(true);
      setActiveModal(null);
      return;
    }
    //check for duplicate
    const duplicate = isDuplicate(response.imdbId);
    if (duplicate) {
      setFailedReason(`Already Have Movie: ${duplicate}`);
      setActiveModal(null);
      return;
    }
    // seearch for poster
    if (response.imdbId) await handlePosterSearch(response.imdbId);
    // do series search for main movie
    if (response.imdbId) await handleSeriesSearch(response.imdbId);
  }, [isDuplicate, handleTitleSearch, handlePosterSearch, handleSeriesSearch]);

  const handleMovieDetailsUpdates = useCallback(
    async (
      _movieId: number,
      updates?: Partial<MovieProps>,
      needYear?: boolean
    ) => {
      if (needYear) {
        setActiveModal(null);
        setNeedYear(true);
        setTimeout(() => {
          yearToSearch.current?.focus();
        }, 0);
        return;
      }
      setNewMovie((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleMovieAdd = async () => {
    let isStatus = newMovie.status;
    if (!isStatus) {
      isStatus = "Want to Watch";
    }
    const finalMovie = {
      ...newMovie,
      status: isStatus,
    };
    onAddMovie(finalMovie as MovieProps);
    onClose();
  };

  const handleSeriesChange = useCallback(
    (option: "left" | "right") => {
      let newSeries = curSeries;
      if (option === "left") {
        newSeries = curSeries === 0 ? allSeries.length - 1 : curSeries - 1;
      } else if (option === "right") {
        newSeries = curSeries === allSeries.length - 1 ? 0 : curSeries + 1;
      }
      setCurSeries(newSeries);
      const mappedData = mapWikidataToMovie(allSeries[newSeries]);
      setNewMovie((prev) => ({
        ...prev,
        title: cleanName(prev.title, mappedData.seriesTitle),
        ...mappedData,
      }));
    },
    [allSeries, curSeries]
  );

  const handleMovieDetailsClose = () => {
    reset();
    setActiveModal(null);
    if (titleFromAbove) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleMovieSearch();
    }
  };

  const eraseErrMsg = () => {
    if (failedReason) {
      setFailedReason("");
      setIsAddManual(false);
    }
  };

  //reset on both because sometimes when opening some ui artificate
  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  // useEffect(() => {
  //   if (activeModal === null && !failedReason) {
  //     reset();
  //   }
  // }, [activeModal, reset, failedReason]);

  // for when to search movie without modal
  useEffect(() => {
    if (titleFromAbove) {
      if (titleToSearch.current) {
        titleToSearch.current.value = titleFromAbove;
      }
      handleMovieSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFromAbove]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    //
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      {!titleFromAbove ? (
        <div className="bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
          <h2 className="text-xl font-semibold mb-4 text-zinc-100 flex justify-center items-center gap-2">
            <Clapperboard className="w-5 h-5 text-emerald-400" />
            Search for New Movie
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              ref={titleToSearch}
              placeholder="Search for movie..."
              onKeyDown={handleKeyPress}
              onInput={eraseErrMsg}
              disabled={isMovieSearching}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
            />
            {needYear && (
              <div className="">
                <input
                  type="number"
                  ref={yearToSearch}
                  placeholder="Release Year"
                  onKeyDown={handleKeyPress}
                  onInput={eraseErrMsg}
                  disabled={isMovieSearching}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mx-2">
            {failedReason && !isMovieSearching && (
              <div className="mt-3 text-zinc-400 text-sm">{failedReason}</div>
            )}
            {isAddManual && !isMovieSearching && (
              <button
                className="mt-3 text-zinc-400 text-sm hover:cursor-pointer underline"
                onClick={() => setActiveModal("manualAdd")}
              >
                Manual Add
              </button>
            )}
          </div>
        </div>
      ) : (
        <input
          type="text"
          ref={titleToSearch}
          disabled
          style={{ display: "none" }}
        />
      )}
      {activeModal === "movieDetails" && (
        <MovieDetails
          isOpen={activeModal === "movieDetails"}
          movie={newMovie as MovieProps}
          onClose={handleMovieDetailsClose}
          onUpdate={handleMovieDetailsUpdates}
          addMovie={handleMovieAdd}
          isLoading={{
            isTrue: isMovieSearching,
            style: "h-8 w-8 border-emerald-400",
            text: "Searching...",
          }}
          showAnotherSeries={
            allSeries.length > 1 ? handleSeriesChange : undefined
          }
        />
      )}
      {activeModal === "manualAdd" && (
        <ManualAddMovie
          isOpen={activeModal === "manualAdd"}
          onClose={() => setActiveModal(null)}
          movie={newMovie}
          onUpdate={(updates: Partial<MovieProps>) =>
            setNewMovie((prev) => ({ ...prev, ...updates }))
          }
          addMovie={handleMovieAdd}
        />
      )}
    </div>
  );
}
