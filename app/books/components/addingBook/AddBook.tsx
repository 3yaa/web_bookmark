"use client";
import { useState, useRef, useEffect } from "react";
import { Book } from "lucide-react";
import { BookProps, OpenLibData } from "@/types/books";
import { searchForBooks } from "../../bookSearch/openLib";
import { getSeriesInfo } from "../../bookSearch/wikiData";
import {
  cleanName,
  mapOlDataToBook,
  mapWikiDataToBook,
} from "@/app/books/utils/bookMapping";
import { BookDetails } from "../BookDetails";
import { ShowMultBooks } from "./ShowMultBooks";

interface AddBookProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooks: BookProps[];
  onAddBook: (book: BookProps) => void;
}

const bookSeriesCache = new Map<string, Partial<BookProps>>();

export function AddBook({
  isOpen,
  onClose,
  existingBooks,
  onAddBook,
}: AddBookProps) {
  const titleToSearch = useRef<HTMLInputElement>(null);
  const [failedReason, setFailedReason] = useState("");
  const [isDupTitle, setisDupTitle] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "multOptions" | null
  >(null);
  const [newBook, setNewBook] = useState<Partial<BookProps>>({});
  const [allNewBooks, setAllNewBooks] = useState<OpenLibData[]>([]);

  useEffect(() => {
    setNewBook({});
    setAllNewBooks([]);
    setFailedReason("");
    setActiveModal(null);
    setisDupTitle(false);
    setIsSearching(false);
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDuplicate = (title: string) => {
    if (!existingBooks) return null;
    const duplicate = existingBooks.find(
      (book: BookProps) => book.title === title
    );
    return duplicate ? duplicate.title : null;
  };

  const handleTitleSearch = async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    const response = await searchForBooks({
      query: titleSearching,
      limit: 5,
    });
    const olData = response?.[0];
    if (!olData) {
      setFailedReason("Could Not Find Book.");
      return null;
    }
    //save books
    setAllNewBooks(response); //all
    setNewBook(mapOlDataToBook(response?.[0])); //main
    return {
      title: olData.title,
      olKey: olData.key.split("/").pop(),
    };
  };

  const handleBookSearch = async () => {
    try {
      setNewBook({});
      setIsSearching(true);
      // make call to open lib
      const response = await handleTitleSearch();
      if (!response) return;
      //check for duplicate
      const duplicate = isDuplicate(response.title);
      if (duplicate) {
        setFailedReason(`Already Have Book: ${duplicate}`);
        setisDupTitle(true);
        return;
      }
      // do series search for main book
      if (response.olKey) await handleSeriesSearch(response.olKey);
      //open detail modal
      setActiveModal("bookDetails");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSeriesSearch = async (olKey: string) => {
    // check for cache
    if (bookSeriesCache.has(olKey)) {
      setNewBook(bookSeriesCache.get(olKey) || {});
      return;
    }
    // make call
    const seriesData = await getSeriesInfo(olKey);
    if (seriesData) {
      const mappedData = mapWikiDataToBook(seriesData);
      setNewBook((prev) => {
        const updated = {
          ...prev,
          title: cleanName(prev.title, mappedData.seriesTitle),
          ...mappedData,
        };
        bookSeriesCache.set(olKey, updated);
        return updated;
      });
      return mappedData;
    }
    return null;
  };

  const handleKeyPres = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBookSearch();
    }
  };

  const eraseErrMsg = () => {
    if (failedReason) setFailedReason("");
  };

  //BookDetails func

  const handleBookAdd = async () => {
    // double check not adding duplicate
    if (newBook.title && isDupTitle) {
      if (isDuplicate(newBook.title)) {
        return;
      }
    }

    const finalBook = {
      ...newBook,
      id: Date.now(),
      status: "Want to Read",
    };
    onAddBook(finalBook as BookProps);
    onClose();
  };

  const handleBookDetailsClose = () => {
    setActiveModal(null);
    onClose();
  };

  // USES null TO DETECT SHOW MORE BOOK OPTION
  const handleNewBookUpdates = (
    _bookId: number,
    updates: Partial<BookProps> | null
  ) => {
    if (!updates) {
      setActiveModal("multOptions");
    }
    setNewBook((prev) => ({ ...prev, ...updates }));
  };

  //MultSearch func

  const handlePickFromMultBooks = async (book: OpenLibData) => {
    setNewBook(mapOlDataToBook(book));
    const key = book.key.split("/").pop();
    if (key) await handleSeriesSearch(key);
    setActiveModal("bookDetails");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      {/* maybe not allow user to close modal as new book coming? */}
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
        <h2 className="text-xl font-semibold mb-6 text-zinc-100 flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-400" />
          Search for New Book
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            ref={titleToSearch}
            placeholder="Search for book..."
            onKeyDown={handleKeyPres}
            onInput={eraseErrMsg}
            disabled={isSearching}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
          />

          <button
            onClick={handleBookSearch}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:shadow-none text-white font-medium transition-all duration-200 shadow-md shadow-zinc-900"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
        <div className="flex justify-between">
          {failedReason && !isSearching && (
            <div className="mt-4 text-zinc-400 text-sm">{failedReason}</div>
          )}
          {isDupTitle && !isSearching && (
            <button
              className="mt-4 text-zinc-400 text-sm hover:cursor-pointer border border-zinc-300 rounded-md p-0.5"
              onClick={() => setActiveModal("multOptions")}
            >
              See Books Found!
            </button>
          )}
        </div>
      </div>
      {activeModal === "bookDetails" && (
        <BookDetails
          isOpen={activeModal === "bookDetails"}
          book={newBook as BookProps}
          onClose={handleBookDetailsClose}
          onUpdate={handleNewBookUpdates}
          addBook={handleBookAdd}
        />
      )}
      {activeModal === "multOptions" && (
        <ShowMultBooks
          isOpen={activeModal === "multOptions"}
          onClose={() => setActiveModal("bookDetails")}
          books={allNewBooks}
          onClickedBook={handlePickFromMultBooks}
        />
      )}
    </div>
  );
}
