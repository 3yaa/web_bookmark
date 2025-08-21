"use client";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Books } from "@/types/media";
import { AddBook } from "./AddBook";
import { BookDetails } from "./BookDetails";
import { formatDateShort, getStatusBorder } from "@/utils/randomUtils";

export default function BookList() {
  const [books, setBooks] = useState<Books[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
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

  const addToBook = (book: Books) => {
    setBooks((prevBooks) => {
      const updatedBooks = [...prevBooks, book];
      localStorage.setItem("books", JSON.stringify(updatedBooks));
      return updatedBooks;
    });
  };

  const handleBookUpdates = (bookId: number, updates: Partial<Books>) => {
    setBooks((prevBooks) => {
      const updatedBook = prevBooks.map((book) =>
        book.id === bookId ? { ...book, ...updates } : book
      );
      localStorage.setItem("books", JSON.stringify(updatedBook));
      return updatedBook;
    });
  };

  const selectedBook = selectedBookId
    ? books.find((book) => book.id === selectedBookId)
    : undefined;

  const handleModalClose = () => {
    setActiveModal(null);
    setSelectedBookId(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="w-full md:w-[70%] lg:w-[75%] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-zinc-100 tracking-tight">
          My Books
        </h1>

        {/* HEADING */}
        <div className="grid md:grid-cols-[2rem_6rem_1fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/50 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-zinc-700/30">
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
              className={`grid md:grid-cols-[2rem_6rem_1fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5  items-center bg-zinc-950/40 scale-100 hover:scale-101 hover:bg-zinc-900 transition-all duration-200 rounded-md shadow-sm rounded-l-none border-l-4 ${getStatusBorder(
                book.status
              )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
                index === 0 && "pt-1.5"
              }`}
              onClick={() => {
                setActiveModal("bookDetails");
                setSelectedBookId(book.id);
              }}
            >
              <span className="font-medium text-zinc-300 text-sm">
                {index + 1}
              </span>
              <div>
                {book.picture ? (
                  <Image
                    src={book.picture}
                    alt={book.name}
                    className="w-12.5 h-17.5 object-cover rounded-md border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-12.5 h-17.5 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30"></div>
                )}
              </div>
              <span className="font-semibold text-zinc-100 text-sm group-hover:text-emerald-400 transition-colors duration-200 truncate">
                {book.name || "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm">
                {book.score || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate">
                {book.status === "Completed"
                  ? formatDateShort(book.dateCompleted) || "?"
                  : "-"}
              </span>
              <span className="text-center font-semibold text-zinc-300 text-sm truncate">
                {book.author || "-"}
              </span>
              <span className="text-center font-medium text-zinc-300 text-sm truncate pl-0.5">
                {book.dateReleased || "-"}
              </span>
              <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5">
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
          onAddBook={addToBook}
        />
      </div>
    </div>
  );
}
