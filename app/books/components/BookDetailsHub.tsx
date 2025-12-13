"use client";
import { BookProps } from "@/types/book";
import { useCallback, useEffect, useState } from "react";
import { BookDesktopDetails } from "./detailsViews/BookDesktopDetails";
import { BookMobileDetails } from "./detailsViews/BookMobileDetails";

export type BookAction =
  | { type: "closeModal" }
  | { type: "deleteBook" }
  | { type: "changeStatus"; payload: "Completed" | "Want to Read" | "Dropped" }
  | { type: "changeScore"; payload: number }
  | { type: "changeNote"; payload: string }
  | { type: "saveNote" }
  | { type: "seriesNav"; payload: "sequel" | "prequel" }
  | { type: "changeCover"; payload: "next" | "prev" }
  | { type: "moreBooks" };

interface BookDetailsProps {
  book: BookProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    bookId: number,
    updates?: Partial<BookProps>,
    takeAction?: boolean
  ) => void;
  addBook?: () => void;
  showSequelPrequel?: (sequelTitle: string) => void;
  showBookInSeries?: (seriesDir: "left" | "right") => void;
  //
  coverUrls?: string[];
  coverIndex?: number;
  updateCoverIndex?: (newIndex: number) => void;
}

export function BookDetails({
  isOpen,
  onClose,
  book,
  onUpdate,
  addBook,
  isLoading,
  showBookInSeries, //when wiki gives more then 1 option
  showSequelPrequel,
  coverUrls,
  coverIndex,
  updateCoverIndex,
}: BookDetailsProps) {
  const [localNote, setLocalNote] = useState(book.note || "");

  const handleAction = (action: BookAction) => {
    switch (action.type) {
      // =========modal actions=============
      case "closeModal":
        handleModalClose();
        break;
      case "deleteBook":
        handleDelete();
        break;
      // =========update actions=============
      case "changeStatus":
        handleStatusChange(action.payload);
        break;
      case "changeScore":
        onUpdate(book.id, { score: action.payload });
        break;
      case "changeNote":
        setLocalNote(action.payload);
        break;
      case "saveNote":
        handleSaveNote();
        break;
      case "changeCover":
        handleCoverChange(action.payload);
        break;
      // =========other actions=============
      case "seriesNav":
        handleSeriesOpen(action.payload);
        break;
      case "moreBooks":
        handleMoreBook();
        break;
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<BookProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    } else if (book.dateCompleted) {
      statusLoad.dateCompleted = null;
    }
    onUpdate(book.id, statusLoad);
  };

  const handleCoverChange = (dir: string) => {
    if (!updateCoverIndex || coverIndex === undefined || !coverUrls) {
      return;
    }
    //
    let newCoverIndex = coverIndex;
    if (dir === "next") {
      newCoverIndex = (coverIndex + 1) % coverUrls.length;
    } else if (dir === "prev") {
      newCoverIndex = coverIndex === 0 ? coverUrls.length - 1 : coverIndex - 1;
    }
    updateCoverIndex(newCoverIndex);
  };

  const handleSeriesOpen = (seriesDir: string) => {
    if (!showSequelPrequel) return;
    const targetTitle = seriesDir === "sequel" ? book.sequel : book.prequel;
    if (targetTitle) {
      showSequelPrequel(targetTitle);
    }
  };

  const handleSaveNote = () => {
    if (localNote !== book.note) {
      onUpdate(book.id, { note: localNote });
    }
  };

  const handleDelete = () => {
    onClose();
    const shouldDelete = true;
    onUpdate(book.id, undefined, shouldDelete);
  };

  const handleModalClose = () => {
    if (addBook) return;
    onClose();
  };

  const handleMoreBook = () => {
    const showMoreBooks = true;
    onUpdate(book.id, undefined, showMoreBooks);
  };

  const handleAddBook = useCallback(() => {
    if (!addBook) return;
    addBook();
    onClose();
  }, [addBook, onClose]);

  // need to reset local note -- since changing book (seuqel/prequel) doesn't remount
  useEffect(() => {
    setLocalNote(book.note || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  useEffect(() => {
    const handleLeave = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;
        const isInTextarea = activeElement?.tagName === "TEXTAREA";
        const isInInput = activeElement?.tagName === "INPUT";
        if (!isInTextarea && !isInInput) {
          handleAddBook();
        }
      }
    };
    //
    window.addEventListener("keydown", handleLeave);
    return () => window.removeEventListener("keydown", handleLeave);
  }, [onClose, handleAddBook]);

  if (!isOpen || !book) return null;

  return (
    <>
      <div className="lg:block hidden">
        <BookDesktopDetails
          book={book}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingBook={!!addBook}
          onAddBook={handleAddBook}
          onAction={handleAction}
          showBookInSeries={showBookInSeries}
          coverUrls={coverUrls}
          coverIndex={coverIndex}
        />
      </div>
      <div className="block lg:hidden">
        <BookMobileDetails
          book={book}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingBook={!!addBook}
          onAddBook={handleAddBook}
          onAction={handleAction}
          showBookInSeries={showBookInSeries}
          coverUrls={coverUrls}
          coverIndex={coverIndex}
        />
      </div>
    </>
  );
}
