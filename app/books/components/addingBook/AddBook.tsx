"use client";
import { useState, useRef, useEffect } from "react";
import { Book } from "lucide-react";
import { BookProps, OpenLibData, AllBooks, GoogleBooks } from "@/types/books";
import { searchForBooks } from "../../api/openLib";
import { getSeriesInfo } from "../../api/wikiData";
import {
  cleanName,
  mapGoogleDataToBook,
  mapOlDataToBook,
  mapWikiDataToBook,
  resetBookValues,
} from "@/app/books/utils/bookMapping";
import { BookDetails } from "../BookDetails";
import { ShowMultBooks } from "./ShowMultBooks";
import { ManualAddBook } from "./ManualAddBook";
import { backUpSearchForBooks } from "../../api/googleBooks";

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
  //failure reasons && their fixes -- for user
  const [failedReason, setFailedReason] = useState("");
  const [isDupTitle, setIsDupTitle] = useState(false);
  const [isAddManual, setIsAddManual] = useState(false);
  //
  const titleToSearch = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "multOptions" | "manualAdd" | null
  >(null);
  const [newBook, setNewBook] = useState<Partial<BookProps>>({});
  const [allNewBooks, setAllNewBooks] = useState<AllBooks>({
    OpenLibBooks: [],
    GoogleBooks: [],
  });

  //reset on both because sometimes when opening some ui artificate
  useEffect(() => {
    reset();
  }, [isOpen]);

  useEffect(() => {
    if (activeModal === null) {
      reset();
    }
  }, [activeModal]);

  const reset = () => {
    setFailedReason("");
    setIsDupTitle(false);
    setIsAddManual(false);
    //
    setIsSearching(false);
    setActiveModal(null);
    setNewBook({});
    setAllNewBooks({
      OpenLibBooks: [],
      GoogleBooks: [],
    });
    if (titleToSearch.current) {
      titleToSearch.current.value = "";
      titleToSearch.current.focus();
    }
  };

  if (!isOpen) return null;

  const isDuplicate = (title: string) => {
    if (!existingBooks) return null;
    const duplicate = existingBooks.find(
      (book: BookProps) => book.originalTitle === title
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
      setIsAddManual(true);
      return null;
    }

    //save books
    setAllNewBooks({
      OpenLibBooks: response,
      GoogleBooks: [],
    }); //all
    setNewBook(mapOlDataToBook(response?.[0])); //main
    return {
      title: olData.title,
      olKey: olData.key.split("/").pop(),
    };
  };

  const handleBookSearch = async () => {
    try {
      setIsSearching(true);
      // make call to open lib
      const response = await handleTitleSearch();
      if (!response) return;
      //check for duplicate
      const duplicate = isDuplicate(response.title);
      if (duplicate) {
        setFailedReason(`Already Have Book: ${duplicate}`);
        setIsDupTitle(true);
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
    };
    onAddBook(finalBook as BookProps);
    onClose();
  };

  //BookDetails func

  const handleBookDetailsClose = () => {
    setActiveModal(null);
    onClose();
  };

  const handleBackUpBookSearch = async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    const response = await backUpSearchForBooks({
      query: titleSearching,
      limit: 5,
    });

    setAllNewBooks((prev) => {
      return {
        ...prev,
        GoogleBooks: response,
      };
    });
  };

  // USES null TO DETECT SHOW MORE BOOK OPTION
  const handleNewBookUpdates = async (
    _bookId: number,
    updates: Partial<BookProps> | null
  ) => {
    if (!updates) {
      if (!allNewBooks.GoogleBooks.length) {
        try {
          setIsSearching(true);
          await handleBackUpBookSearch();
        } finally {
          setIsSearching(false);
        }
      }
      setNewBook(resetBookValues(newBook));
      setActiveModal("multOptions");
      return;
    }
    setNewBook((prev) => ({ ...prev, ...updates }));
  };

  //MultSearch func

  const handlePickFromMultBooks = async (book: OpenLibData | GoogleBooks) => {
    //check if clicked book is duplicate
    const duplicate = isDuplicate(book.title);
    if (duplicate) {
      setFailedReason(`Already Have Book: ${duplicate}`);
      setIsDupTitle(true);
      return;
    }
    // ol
    if ("key" in book) {
      setNewBook(mapOlDataToBook(book));
      const key = book.key.split("/").pop();
      if (key) await handleSeriesSearch(key);
    }
    // google -- NOT CALLING WIKI FOR GOOGLE
    else {
      setNewBook(mapGoogleDataToBook(book));
    }
    setActiveModal("bookDetails");
  };

  const handleMultOptionClose = (action: "manualAdd" | null) => {
    if (action === "manualAdd") {
      setActiveModal("manualAdd");
      return;
    }
    //just close the modal
    setActiveModal("bookDetails");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      {/* maybe not allow user to close modal as new book coming? */}
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
        <h2 className="text-xl font-semibold mb-4 text-zinc-100 flex justify-center items-center gap-2">
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
        </div>
        <div className="flex justify-between">
          {failedReason && !isSearching && (
            <div className="mt-4 text-zinc-400 text-sm">{failedReason}</div>
          )}
          {isAddManual && !isSearching && (
            <button
              className="mt-4 text-zinc-400 text-sm hover:cursor-pointer underline"
              onClick={() => setActiveModal("manualAdd")}
            >
              Manual Add
            </button>
          )}
        </div>
      </div>
      {activeModal === "bookDetails" && !isSearching && (
        <BookDetails
          isOpen={activeModal === "bookDetails"}
          book={newBook as BookProps}
          onClose={handleBookDetailsClose}
          onUpdate={handleNewBookUpdates}
          addBook={handleBookAdd}
        />
      )}
      {activeModal === "multOptions" && !isSearching && (
        <ShowMultBooks
          isOpen={activeModal === "multOptions"}
          onClose={handleMultOptionClose}
          books={allNewBooks}
          prompt={titleToSearch.current?.value || ""}
          onClickedBook={handlePickFromMultBooks}
        />
      )}
      {activeModal === "manualAdd" && !isSearching && (
        <ManualAddBook
          isOpen={activeModal === "manualAdd"}
          onClose={() => setActiveModal(null)}
          book={newBook}
          onUpdate={(updates: Partial<BookProps>) =>
            setNewBook((prev) => ({ ...prev, ...updates }))
          }
          addBook={handleBookAdd}
        />
      )}
    </div>
  );
}
