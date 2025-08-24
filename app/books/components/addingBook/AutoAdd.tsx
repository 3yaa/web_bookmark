"use client";
import { useState, useRef, useEffect } from "react";
import { Book } from "lucide-react";
import { BookProps } from "@/types/books";
import { searchForBooks } from "../../bookSearch/openLib";
import { getSeriesInfo } from "../../bookSearch/wikiData";
import {
  mapOlDataToBook,
  mapWikiDataToBook,
} from "@/app/books/utils/bookMapping";

interface AddBookProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooks: BookProps[];
  onAddBook: (book: BookProps) => void;
}

export function AddBook({
  isOpen,
  onClose,
  existingBooks,
  onAddBook,
}: AddBookProps) {
  const titleToSearch = useRef<HTMLInputElement>(null);
  const [failedReason, setFailedReason] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const newBook = useRef<Partial<BookProps>>({});

  useEffect(() => {
    newBook.current = {}; // might cause bug since user can close modal as api call
    setFailedReason("");
    setIsSearching(false);
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDuplicate = (title: string) => {
    if (!existingBooks) return false;
    return existingBooks.some((book: BookProps) => book.title === title);
  };

  const handleTitleSearch = async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    const response = await searchForBooks({
      query: titleSearching,
      limit: 1,
    });
    const olData = response?.[0];
    if (!olData) {
      setFailedReason("Could Not Find Book.");
      return null;
    }
    if (isDuplicate(olData.title)) {
      setFailedReason("Already Have Book.");
      return null;
    }
    // attach info from open lib
    newBook.current = mapOlDataToBook(olData);
    return olData.key.split("/").pop();
  };

  const handleSeriesSearch = async (olKey: string) => {
    const seriesData = await getSeriesInfo(olKey);
    if (seriesData) {
      newBook.current = {
        ...newBook.current,
        ...mapWikiDataToBook(seriesData),
      };
    }
  };

  const addNewBook = () => {
    onAddBook({
      ...newBook.current,
      id: Date.now(),
      status: "Want to Read",
    } as BookProps);
    onClose();
  };

  const handleBookSearch = async () => {
    try {
      newBook.current = {};
      setIsSearching(true);
      // make call to open lib
      const olKey = await handleTitleSearch();
      if (!olKey) return;
      // make call to wikidata
      await handleSeriesSearch(olKey);
      //add to db and close modal
      addNewBook();
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPres = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBookSearch();
    }
  };

  const eraseErrMsg = () => {
    if (failedReason) setFailedReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      {/* maybe not allow user to close modal as new book coming? */}
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
        <h2 className="text-xl font-semibold mb-6 text-zinc-100 flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-400" />
          Add New Book
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            ref={titleToSearch}
            placeholder="Search for books..."
            onKeyDown={handleKeyPres}
            onInput={eraseErrMsg}
            disabled={isSearching}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
          />

          <button
            onClick={handleBookSearch}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:shadow-none text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
        {failedReason && !isSearching && (
          <div className="mt-4 text-zinc-400 text-sm">{failedReason}</div>
        )}
      </div>
    </div>
  );
}
