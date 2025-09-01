"use client";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BookProps } from "@/types/books";
import { AddBook } from "./addingBook/AddBook";
import { BookDetails } from "./BookDetails";
import { formatDateShort, getStatusBorderColor } from "@/utils/formattingUtils";
import { getCoverUrl } from "@/app/books/utils/bookMapping";

export default function BookList() {
  const [books, setBooks] = useState<BookProps[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "addBook" | null
  >(null);

  // temp: loads books from localstorage
  useEffect(() => {
    const loadBooks = () => {
      try {
        const storedBooks = localStorage.getItem("books");
        if (!storedBooks) {
          localStorage.setItem("books", JSON.stringify([]));
          setBooks([]);
          return;
        }
        const parsedBooks = JSON.parse(storedBooks);

        if (Array.isArray(parsedBooks)) {
          setBooks(parsedBooks);
        } else {
          console.warn("invalid book format--reset");
          localStorage.setItem("books", JSON.stringify([]));
          setBooks([]);
        }
      } catch (e) {
        console.warn("error loading books--reset:", e);
        localStorage.setItem("books", JSON.stringify([]));
        setBooks([]);
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  // if book is missing sequel or prequel tries to link from user lib
  const linkBook = useCallback(
    (book: BookProps) => {
      if (book.seriesTitle) {
        books.forEach((bk) => {
          // when book isn't linked
          if (bk.sequel === book.title && !book.prequel) {
            // set book prequel to bk
            book.prequel = bk.title;
          } else if (bk.prequel === book.title && !book.sequel) {
            // set book sequel to bk
            book.sequel = bk.title;
          }
          // when bk isn't linked
          if (book.prequel === bk.title && !bk.sequel) {
            // sets bk sequel to book
            bk.sequel = book.title;
          } else if (book.sequel === bk.title && !bk.prequel) {
            // sets bk prequel to book
            bk.prequel = book.title;
          }
        });
      }
      return book;
    },
    [books]
  );

  const addToBook = useCallback(
    (book: BookProps) => {
      //add book
      const linkedBook = linkBook(book);
      setBooks((prevBooks) => {
        const updatedBooks = [...prevBooks, linkedBook];
        return updatedBooks;
      });
    },
    [linkBook]
  );

  // USES null ON UPDATE TO DETECT ITS A DELETE
  const handleBookUpdates = useCallback(
    (
      bookId: number,
      updates: Partial<BookProps> | null,
      newBook?: { bookTitle: string | null }
    ) => {
      // book title search and sequel/prequel linking
      if (newBook?.bookTitle) {
        const targetBook = books.find(
          (book) => book.title === newBook.bookTitle
        );

        if (targetBook) {
          setSelectedBook(targetBook);
        } else {
          // need to call library
          setTitleToUse(newBook.bookTitle);
          setActiveModal("addBook");
        }
        return;
      }

      // book updates or deletion
      setBooks((prevBooks) => {
        if (!updates) {
          // Delete book
          return prevBooks.filter((book) => book.id !== bookId);
        } else {
          // Update book
          const updatedBooks = prevBooks.map((book) =>
            book.id === bookId ? { ...book, ...updates } : book
          );

          // Update selectedBook if it's the one being modified
          if (selectedBook?.id === bookId) {
            setSelectedBook({ ...selectedBook, ...updates });
          }

          return updatedBooks;
        }
      });
    },
    [books, selectedBook]
  );

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setTitleToUse("");
    setSelectedBook(null);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="w-full md:w-[70%] lg:w-[62%] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-zinc-100 tracking-tight">
          My Books
        </h1>

        {/* HEADING */}
        <div className="grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/50 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-zinc-700/30">
          <span className="font-semibold text-zinc-300 text-sm">#</span>
          <span className="font-semibold text-zinc-300 text-sm">Cover</span>
          <span className="font-semibold text-zinc-300 text-sm">Title</span>
          <span className="text-center font-semibold text-zinc-300 text-sm">
            Score
          </span>
          <span className="text-center font-semibold text-zinc-300 text-sm">
            Completed
          </span>
          <span className="text-center font-semibold text-zinc-300 text-sm">
            Author
          </span>
          <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
            Published
          </span>
          <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
            Notes
          </span>
        </div>

        {/* LISTING */}
        <div className="divide-y divide-zinc-700/30">
          {books.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400 italic text-lg">
                No books yet — add one above!
              </p>
            </div>
          )}
          {books.map((book, index) => (
            <div
              key={book.id}
              className={`group grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-950/40 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
                book.status
              )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
                index === 0 ? "pt-1.5 rounded-bl-none" : "rounded-l-none"
              } hover:cursor-pointer`}
              onClick={() => {
                setActiveModal("bookDetails");
                setSelectedBook(book);
              }}
            >
              <span className="font-medium text-zinc-300 text-sm">
                {index + 1}
              </span>
              <div className="w-12.5 h-18">
                {book.curCoverIndex !== undefined &&
                book.curCoverIndex !== null ? (
                  <Image
                    src={getCoverUrl(book.coverEditions?.[book.curCoverIndex])}
                    alt={book.title || "Untitled"}
                    width={50}
                    height={75}
                    className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title || "Untitled"}
                    width={50}
                    height={75}
                    className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                )}
              </div>
              <span className="font-semibold text-zinc-100 text-sm group-hover:text-emerald-400 transition-colors duration-200 truncate">
                {book.title || "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm">
                {book.score || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate">
                {book.status === "Completed"
                  ? formatDateShort(book.dateCompleted ?? 0) || "?"
                  : "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm truncate">
                {book.author || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate pl-0.5">
                {book.datePublished || "-"}
              </span>
              <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center">
                {book.note || "No notes"}
              </span>
            </div>
          ))}
        </div>
      </div>
      {selectedBook && (
        <BookDetails
          isOpen={activeModal === "bookDetails"}
          book={selectedBook}
          onClose={handleModalClose}
          onUpdate={handleBookUpdates}
        />
      )}
      {/* add button */}
      <div className="fixed bottom-10 right-12 z-10">
        <button
          onClick={() => setActiveModal("addBook")}
          className="bg-emerald-600 hover:bg-emerald-500 p-4.5 rounded-full shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
        </button>
        <AddBook
          isOpen={activeModal === "addBook"}
          onClose={handleModalClose}
          existingBooks={books}
          onAddBook={addToBook}
          titleFromAbove={titleToUse}
        />
      </div>
    </div>
  );
}
