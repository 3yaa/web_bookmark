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
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

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
  //
  const isButtonsVisible = useScrollVisibility(30);

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
      <div
        className={`fixed lg:bottom-8 lg:right-10 bottom-1 right-1 z-10
        lg:translate-y-0 transition-transform duration-300 ease-in-out
        ${isButtonsVisible ? "translate-y-0" : "translate-y-24"}`}
      >
        <button
          onClick={() => setActiveModal("addBook")}
          className="flex items-center justify-center w-14 h-14 lg:w-14 lg:h-14 rounded-full 
          bg-linear-to-br from-zinc-transparent to-zinc-800/60 
          hover:bg-linear-to-br hover:from-zinc-800/60 hover:to-transparent
          backdrop-blur-xl shadow-md shadow-zinc-800/60
          hover:scale-105 active:scale-95 
          transition-all duration-200 relative z-10 hover:cursor-pointer focus:outline-none"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
        </button>
      </div>
      <AddBook
        isOpen={activeModal === "addBook"}
        onClose={handleModalClose}
        existingBooks={books}
        onAddBook={addBook}
        titleFromAbove={titleToUse}
      />
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
