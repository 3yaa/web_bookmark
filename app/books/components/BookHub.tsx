"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Plus } from "lucide-react";
import { MediaStatus } from "@/types/media";
import { BookProps, SortConfig } from "@/types/book";
// hooks
import { useSortBooks } from "@/app/books/hooks/useSortBooks";
import { useBookData } from "@/app/books/hooks/useBookData";
// components
import { AddBook } from "./addingBook/AddBook";
import { BookDetails } from "./BookDetailsHub";
import { BookMobileListing } from "./listingViews/BookMobileListing";
import { BookDesktopListing } from "./listingViews/BookDesktopListing";
import { debounce } from "@/utils/debounce";

export default function BookList() {
  const { books, addBook, updateBook, deleteBook, isProcessingBook } =
    useBookData();
  // filter/sort config
  const [statusFilter, setStatusFilter] = useState<MediaStatus | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // delegation
  const [selectedBook, setSelectedBook] = useState<BookProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "addBook" | null
  >(null);
  // set deboucne
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300)
  ).current;
  // SEARCH
  const searchedBooks = useMemo(() => {
    if (!debouncedQuery) return books;

    return books.filter((book) =>
      book.title.toLowerCase().trim().includes(debouncedQuery)
    );
  }, [books, debouncedQuery]);
  // FILTER
  const [isFilterPending, startTransition] = useTransition();
  const filteredBooks = useMemo(() => {
    if (!statusFilter) return searchedBooks;
    //
    return searchedBooks.filter((book) => book.status === statusFilter);
  }, [searchedBooks, statusFilter]);
  //
  const sortedBooks = useSortBooks(filteredBooks, sortConfig);

  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (targetTitle) {
        // !NEEDS TO MAKE THIS CALL WITH THE ENTIRE DB
        const targetBook = books.find(
          (book) => book.title.toLowerCase() === targetTitle.toLowerCase()
        );

        if (targetBook) {
          setSelectedBook(targetBook);
        } else {
          // need to call external API
          setTitleToUse(targetTitle);
          setActiveModal("addBook");
        }
        return;
      }
    },
    [books]
  );

  const handleBookUpdates = useCallback(
    async (
      bookId: number,
      updates?: Partial<BookProps>,
      shouldDelete?: boolean
    ) => {
      if (updates) {
        if (selectedBook?.id === bookId) {
          setSelectedBook({ ...selectedBook, ...updates });
        }
        updateBook(bookId, updates);
      } else if (shouldDelete) {
        await deleteBook(bookId);
      }
    },
    [deleteBook, selectedBook, updateBook]
  );

  const handleSortConfig = (sortType: SortConfig["type"]) => {
    setSortConfig((prev) => {
      if (!prev || prev.type !== sortType) {
        return { type: sortType, order: "desc" };
      } else if (prev.order === "desc") {
        return { type: sortType, order: "asc" };
      } else {
        return null;
      }
    });
  };

  const handleStatusFilterConfig = (status: MediaStatus) => {
    startTransition(() => {
      if (statusFilter === status) {
        setStatusFilter(null);
      } else {
        setStatusFilter(status);
      }
    });
  };

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    // wait a frame before clearing state
    requestAnimationFrame(() => {
      setTitleToUse("");
      setSelectedBook(null);
    });
  }, []);

  const handleBookClicked = useCallback((book: BookProps) => {
    setActiveModal("bookDetails");
    setSelectedBook(book);
  }, []);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value.toLowerCase().trim());
  };

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      const isDesktop = window.matchMedia("(min-width: 900px)").matches;
      if (!isDesktop) return;
      // if no modal is open and not typing in an input/textarea
      if (
        e.key === "Enter" &&
        !activeModal &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        setActiveModal("addBook");
      }
    };
    //
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return (
    <div className="min-h-screen">
      <div className="lg:block hidden">
        <BookDesktopListing
          books={sortedBooks}
          isProcessingBook={isProcessingBook}
          sortConfig={sortConfig}
          onSortConfig={handleSortConfig}
          onBookClicked={handleBookClicked}
          onSearchChange={handleSearchQueryChange}
          searchQuery={searchQuery}
        />
      </div>
      <div className="block lg:hidden">
        <BookMobileListing
          books={sortedBooks}
          isProcessingBook={isProcessingBook || isFilterPending}
          sortConfig={sortConfig}
          curStatusFilter={statusFilter}
          onBookClicked={handleBookClicked}
          onSortConfig={handleSortConfig}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      {/* ADD BUTTON */}
      <div className="fixed lg:bottom-10 lg:right-12 bottom-0 right-4 z-10">
        <button
          onClick={() => setActiveModal("addBook")}
          className="bg-emerald-700 hover:bg-emerald-600 p-4.5 rounded-full shadow-lg shadow-emerald-700/20 hover:shadow-emerald-500/30 transition-all duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
        </button>
        <AddBook
          isOpen={activeModal === "addBook"}
          onClose={handleModalClose}
          existingBooks={books}
          onAddBook={addBook}
          titleFromAbove={titleToUse}
        />
      </div>
      {/* BOOK DETAILS */}
      {selectedBook && (
        <BookDetails
          isOpen={activeModal === "bookDetails"}
          book={selectedBook}
          onClose={handleModalClose}
          onUpdate={handleBookUpdates}
          showSequelPrequel={showSequelPrequel}
        />
      )}
    </div>
  );
}
