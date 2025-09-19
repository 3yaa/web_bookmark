"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Book } from "lucide-react";
//
import {
  BookProps,
  OpenLibraryProps,
  AllBooksProps,
  GoogleBooksProps,
  WikidataProps,
} from "@/types/book";
//
import {
  cleanName,
  mapGoogleDataToBook,
  mapOpenLibDataToBook,
  mapWikidataToBook,
  resetBookValues,
} from "@/app/books/utils/bookMapping";
//
import { BookDetails } from "../BookDetails";
import { ShowMultBooks } from "./ShowMultBooks";
import { ManualAddBook } from "./ManualAddBook";
//
import { useBookSearch } from "@/app/books/hooks/useBookSearch";

interface AddBookProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooks: BookProps[];
  onAddBook: (book: BookProps) => void;
  titleFromAbove?: string;
}

const BOOKLIMIT = 5;
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
  //
  const [isAddManual, setIsAddManual] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "multOptions" | "manualAdd" | null
  >(null);
  //
  const titleToSearch = useRef<HTMLInputElement>(null);
  const [isDupTitle, setIsDupTitle] = useState(false);
  //
  const [newBook, setNewBook] = useState<Partial<BookProps>>({});
  const [allNewBooks, setAllNewBooks] = useState<AllBooksProps>({
    OpenLibBooks: [],
    GoogleBooksProps: [],
  });
  const [allSeries, setAllSeries] = useState<WikidataProps[]>([]);
  const [curSeries, setCurSeries] = useState<number>(0);
  //
  const {
    searchForBooks,
    searchForSeriesInfo,
    searchForBackupBooks,
    isBookSearching,
  } = useBookSearch();

  const reset = useCallback(() => {
    setFailedReason("");
    setIsDupTitle(false);
    setIsAddManual(false);
    //
    setActiveModal(null);
    setNewBook({});
    setAllNewBooks({
      OpenLibBooks: [],
      GoogleBooksProps: [],
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

    const response = await searchForBooks(titleSearching, BOOKLIMIT);
    const olData = response?.[0];
    if (!olData) return null;
    //save books
    setAllNewBooks({
      OpenLibBooks: response,
      GoogleBooksProps: [],
    }); //all
    // console.log(response?.[0].title, ": ", response?.[0].key);
    setNewBook(mapOpenLibDataToBook(response?.[0])); //main
    return {
      title: olData.title,
      olKey: olData.key,
    };
  }, [searchForBooks]);

  const handleSeriesSearch = useCallback(
    async (olKey: string) => {
      // check for cache
      if (bookSeriesCache.has(olKey)) {
        setNewBook(bookSeriesCache.get(olKey) || {});
        return;
      }
      // make call
      const seriesData = await searchForSeriesInfo(olKey);
      if (!seriesData || seriesData.length === 0) return null;
      //
      setAllSeries(seriesData);
      const mappedData = mapWikidataToBook(seriesData[0]);
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
    },
    [searchForSeriesInfo]
  );

  const handleBookSearch = useCallback(async () => {
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
  }, [isDuplicate, handleTitleSearch, handleSeriesSearch]);

  const handleBackUpBookSearch = useCallback(async () => {
    const titleSearching = titleToSearch.current?.value.trim();
    if (!titleSearching) return null;

    const booksInfo = await searchForBackupBooks(titleSearching, BOOKLIMIT);
    if (!booksInfo || booksInfo.length === 0) return null;
    setAllNewBooks((prev) => ({
      ...prev,
      GoogleBooksProps: booksInfo,
    }));
  }, [searchForBackupBooks]);

  const handlePickFromMultBooks = useCallback(
    async (book: OpenLibraryProps | GoogleBooksProps) => {
      // ol
      if ("key" in book) {
        //check if clicked book is duplicate
        const key = book.key;
        if (!key) return;
        const duplicate = isDuplicate(key);
        if (duplicate) {
          setFailedReason(`Already Have Book: ${duplicate}`);
          setIsDupTitle(true);
          return;
        }
        //
        setNewBook(mapOpenLibDataToBook(book));
        if (key) await handleSeriesSearch(key);
      }
      // google -- NOT CALLING WIKI FOR GOOGLE
      else if ("id" in book) {
        //check if clicked book is duplicate
        const key = book.id;
        if (!key) return;
        const duplicate = isDuplicate(key);
        if (duplicate) {
          setFailedReason(`Already Have Book: ${duplicate}`);
          setIsDupTitle(true);
          return;
        }
        //
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
        if (!allNewBooks.GoogleBooksProps.length) {
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
      return;
    }

    let defaultStatus = newBook.status;
    if (!defaultStatus) {
      defaultStatus = "Want to Read";
    }
    const finalBook = {
      ...newBook,
      status: defaultStatus,
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
      setCurSeries(newSeries);
      const mappedData = mapWikidataToBook(allSeries[newSeries]);
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
    if (failedReason) {
      setFailedReason("");
      setIsAddManual(false);
      setIsDupTitle(false);
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

  // for when to search book without modal
  useEffect(() => {
    if (titleFromAbove) {
      if (titleToSearch.current) {
        titleToSearch.current.value = titleFromAbove;
      }
      handleBookSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFromAbove]);

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
              disabled={isBookSearching}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-zinc-500/50 focus:ring-1 focus:ring-zinc-700/20 outline-none transition-all duration-200"
            />
          </div>
          <div className="flex justify-between mx-2">
            {failedReason && !isBookSearching && (
              <div className="mt-3 text-zinc-400 text-sm">{failedReason}</div>
            )}
            {isAddManual && !isBookSearching && (
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
          isLoading={{
            isTrue: isBookSearching,
            style: "h-8 w-8 border-emerald-400",
            text: "Searching...",
          }}
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
          isLoading={isBookSearching}
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
