"use client";
import { MovieProps } from "@/types/movie";
import { useCallback, useEffect, useState } from "react";
import { MovieDesktopDetails } from "./detailsViews/MovieDesktopDetails";
import { MovieMobileDetails } from "./detailsViews/MovieMobileDetails";

export type MovieAction =
  | { type: "closeModal" }
  | { type: "deleteMovie" }
  | { type: "changeStatus"; payload: "Completed" | "Want to Watch" | "Dropped" }
  | { type: "changeScore"; payload: number }
  | { type: "changeNote"; payload: string }
  | { type: "saveNote" }
  | { type: "seriesNav"; payload: "sequel" | "prequel" }
  | { type: "needYearField" };

interface MovieDetailsProps {
  movie: MovieProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    movieId: number,
    updates?: Partial<MovieProps>,
    takeAction?: boolean
  ) => void;
  addMovie?: () => void;
  showSequelPrequel?: (sequelTitle: string) => void;
  showAnotherSeries?: (seriesDir: "left" | "right") => void;
}

export function MovieDetails({
  isOpen,
  onClose,
  movie,
  onUpdate,
  addMovie,
  isLoading,
  showSequelPrequel,
  showAnotherSeries, //when wiki gives more then 1 option
}: MovieDetailsProps) {
  const [localNote, setLocalNote] = useState(movie.note || "");

  const handleAction = (action: MovieAction) => {
    switch (action.type) {
      // =========modal actions=============
      case "closeModal":
        handleModalClose();
        break;
      case "deleteMovie":
        handleDelete();
        break;
      case "needYearField":
        handleNeedYear();
        break;
      // =========update actions=============
      case "changeStatus":
        handleStatusChange(action.payload);
        break;
      case "changeScore":
        onUpdate(movie.id, { score: Number(action.payload) });
        break;
      case "changeNote":
        setLocalNote(action.payload);
        break;
      case "saveNote":
        handleSaveNote();
        break;
      // =========other actions=============
      case "seriesNav":
        handleSeriesNav(action.payload);
        break;
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Watch";
    const statusLoad: Partial<MovieProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    } else if (movie.dateCompleted) {
      statusLoad.dateCompleted = null;
    }
    onUpdate(movie.id, statusLoad);
  };

  // switches modal to new movie in series
  const handleSeriesNav = (seriesDir: string) => {
    if (!showSequelPrequel) return;
    const targetTitle = seriesDir === "sequel" ? movie.sequel : movie.prequel;
    if (targetTitle) {
      showSequelPrequel(targetTitle);
    }
  };

  const handleSaveNote = () => {
    if (localNote !== movie.note) {
      onUpdate(movie.id, { note: localNote });
    }
  };

  const handleDelete = () => {
    onClose();
    const shouldDelete = true;
    onUpdate(movie.id, undefined, shouldDelete);
  };

  const handleModalClose = () => {
    if (addMovie) return;
    onClose();
  };

  // AddMovie.tsx -- goes back to search with year field
  const handleNeedYear = () => {
    const needYear = true;
    onUpdate(movie.id, undefined, needYear);
  };

  const handleAddMovie = useCallback(() => {
    if (!addMovie) return;
    addMovie();
    onClose();
  }, [addMovie, onClose]);

  // need to reset local note -- since changing movie (seuqel/prequel) doesn't remount
  useEffect(() => {
    setLocalNote(movie.note || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id]);

  useEffect(() => {
    const handleLeave = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;
        const isInTextarea = activeElement?.tagName === "TEXTAREA";
        const isInInput = activeElement?.tagName === "INPUT";
        if (!isInTextarea && !isInInput) {
          handleAddMovie();
        }
      }
    };
    //
    window.addEventListener("keydown", handleLeave);
    return () => window.removeEventListener("keydown", handleLeave);
  }, [onClose, handleAddMovie]);

  if (!isOpen || !movie) return null;

  return (
    <>
      <div className="lg:block hidden">
        <MovieDesktopDetails
          movie={movie}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingMovie={!!addMovie}
          onAddMovie={handleAddMovie}
          showAnotherSeries={showAnotherSeries}
          onAction={handleAction}
        />
      </div>
      <div className="block lg:hidden">
        <MovieMobileDetails
          movie={movie}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingMovie={!!addMovie}
          onAddMovie={handleAddMovie}
          showAnotherSeries={showAnotherSeries}
          onAction={handleAction}
        />
      </div>
    </>
  );
}
