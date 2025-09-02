"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Book } from "lucide-react";
import {
  BookProps,
  OpenLibData,
  AllBooks,
  GoogleBooks,
  WikiData,
} from "@/types/books";
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
  titleFromAbove?: string;
}

const bookSeriesCache = new Map<string, Partial<BookProps>>();

export function AddBook({
  isOpen,
  onClose,
  existingBooks,
  onAddBook,
  titleFromAbove,
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
  const [allSeries, setAllSeries] = useState<WikiData[]>([]);
  const [curSeries, setCurSeries] = useState<number>(0);

  const reset = useCallback(() => {
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
  }, []);

  const isDuplicate = useCallback(
    (key: string) => {
      if (!existingBooks) return null;
      const duplicate = existingBooks.find(
        (book: BookProps) => book.key === key
      );
      return duplicate ? duplicate.title : null;
    },
    [existingBooks]
  );

  const handleTitleSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    const response = await searchForBooks({
      query: titleSearching,
      limit: 5,
    });
    const olData = response?.[0];
    if (!olData) return null;

    //save books
    setAllNewBooks({
      OpenLibBooks: response,
      GoogleBooks: [],
    }); //all
    // console.log(response?.[0].title, ": ", response?.[0].key);
    setNewBook(mapOlDataToBook(response?.[0])); //main
    return {
      title: olData.title,
      olKey: olData.key,
    };
  }, []);

  const handleSeriesSearch = useCallback(async (olKey: string) => {
    // check for cache
    if (bookSeriesCache.has(olKey)) {
      setNewBook(bookSeriesCache.get(olKey) || {});
      return;
    }
    // make call
    const seriesData = await getSeriesInfo(olKey);
    if (seriesData) {
      setAllSeries(seriesData);
      const mappedData = mapWikiDataToBook(seriesData[0]);
      setNewBook((prev) => {
        const updated = {
          ...prev,
          title: cleanName(prev.title, mappedData.seriesTitle),
          ...mappedData,
        };
        bookSeriesCache.set(olKey, updated);
        return updated; //setting newBook
      });
      return mappedData;
    }
    return null;
  }, []);

  const handleBookSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      setActiveModal("bookDetails");
      // make call to open lib
      const response = await handleTitleSearch();
      if (!response?.olKey || !response.title) {
        setFailedReason("Could Not Find Book.");
        setIsAddManual(true);
        setActiveModal(null);
        return;
      }
      //check for duplicate
      const duplicate = isDuplicate(response.olKey);
      if (duplicate) {
        setFailedReason(`Already Have Book: ${duplicate}`);
        setIsDupTitle(true);
        setActiveModal(null);
        return;
      }
      // do series search for main book
      if (response.olKey) await handleSeriesSearch(response.olKey);
    } finally {
      setIsSearching(false);
    }
  }, [isDuplicate, handleTitleSearch, handleSeriesSearch]);

  const handleBackUpBookSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    try {
      setIsSearching(true);
      //
      const response = await backUpSearchForBooks({
        query: titleSearching,
        limit: 5,
      });

      setAllNewBooks((prev) => ({
        ...prev,
        GoogleBooks: response,
      }));
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePickFromMultBooks = useCallback(
    async (book: OpenLibData | GoogleBooks) => {
      //check if clicked book is duplicate
      const key = book.key;
      if (!key) return;
      const duplicate = isDuplicate(key);
      if (duplicate) {
        setFailedReason(`Already Have Book: ${duplicate}`);
        setIsDupTitle(true);
        return;
      }
      // ol
      if ("curCoverIndex" in book) {
        setNewBook(mapOlDataToBook(book));
        if (key) await handleSeriesSearch(key);
      }
      // google -- NOT CALLING WIKI FOR GOOGLE
      else {
        setNewBook(mapGoogleDataToBook(book));
      }
      setActiveModal("bookDetails");
    },
    [handleSeriesSearch, isDuplicate]
  );

  const handleBookDetailsUpdates = useCallback(
    async (
      _bookId: number,
      updates?: Partial<BookProps>,
      showMore?: boolean
    ) => {
      if (showMore) {
        setActiveModal("multOptions");
        if (!allNewBooks.GoogleBooks.length) {
          await handleBackUpBookSearch();
        }
        return;
      }
      setNewBook((prev) => ({ ...prev, ...updates }));
    },
    [allNewBooks, handleBackUpBookSearch]
  );

  const handleBookAdd = async () => {
    // double check not adding duplicate
    if (newBook.key && isDupTitle) {
      if (isDuplicate(newBook.key)) {
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

  const handleSeriesChange = useCallback(
    (option: "left" | "right") => {
      let newSeries = curSeries;
      if (option === "left") {
        newSeries = curSeries === 0 ? allSeries.length - 1 : curSeries - 1;
      } else if (option === "right") {
        newSeries = curSeries === allSeries.length - 1 ? 0 : curSeries + 1;
      }
      const mappedData = mapWikiDataToBook(allSeries[newSeries]);
      setCurSeries(newSeries);
      setNewBook((prev) => {
        const updated = {
          ...prev,
          title: cleanName(prev.title, mappedData.seriesTitle),
          ...mappedData,
        };
        return updated;
      });
    },
    [allSeries, curSeries]
  );

  const handleBookDetailsClose = () => {
    setActiveModal(null);
    if (titleFromAbove) {
      onClose();
    }
  };

  const handleMultOptionClose = useCallback((action: "manualAdd" | null) => {
    switch (action) {
      case "manualAdd":
        setNewBook((prev) => resetBookValues(prev));
        setActiveModal("manualAdd");
        return;
      default:
        setActiveModal("bookDetails");
        return;
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBookSearch();
    }
  };

  const eraseErrMsg = () => {
    if (failedReason) setFailedReason("");
  };

  //reset on both because sometimes when opening some ui artificate
  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (activeModal === null && !failedReason) {
      reset();
    }
  }, [activeModal, reset, failedReason]);

  // for when to search book without modal
  useEffect(() => {
    if (titleFromAbove) {
      if (titleToSearch.current) {
        titleToSearch.current.value = titleFromAbove;
      }
      handleBookSearch();
    }
  }, [handleBookSearch, titleFromAbove]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      {/* maybe not allow user to close modal as new book coming? */}
      <div className="fixed inset-0" onClick={onClose} />
      {!titleFromAbove ? (
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
              onKeyDown={handleKeyPress}
              onInput={eraseErrMsg}
              disabled={isSearching}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
            />
          </div>
          <div className="flex justify-between mx-2">
            {failedReason && !isSearching && (
              <div className="mt-3 text-zinc-400 text-sm">{failedReason}</div>
            )}
            {isAddManual && !isSearching && (
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
      {activeModal === "bookDetails" && (
        <BookDetails
          isOpen={activeModal === "bookDetails"}
          book={newBook as BookProps}
          onClose={handleBookDetailsClose}
          onUpdate={handleBookDetailsUpdates}
          addBook={handleBookAdd}
          isLoading={isSearching}
          showBookInSeries={
            allSeries.length > 1 ? handleSeriesChange : undefined
          }
        />
      )}
      {activeModal === "multOptions" && (
        <ShowMultBooks
          isOpen={activeModal === "multOptions"}
          onClose={handleMultOptionClose}
          books={allNewBooks}
          prompt={titleToSearch.current?.value || ""}
          onClickedBook={handlePickFromMultBooks}
          isLoading={isSearching}
        />
      )}
      {activeModal === "manualAdd" && (
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
