"use client";
import { useEffect, useState } from "react";
import { Books } from "@/types/media";
import { AddBook } from "./AddBook";

export function BookList() {
  const [books, setBooks] = useState<Books[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

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
          console.warn("hola");
          localStorage.setItem("books", JSON.stringify([]));
          setBooks([]);
        }
      } catch (e) {
        console.log("error loading books:", e);
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

  return (
    <>
      <div className="w-full md:w-[70%] lg:w-[75%] mx-auto">
        <h1 className="text-center bg-blue-500">My Books</h1>
        <div className="grid grid-cols-[2rem_6rem_20rem_6rem_8rem_10rem_1fr] bg-gray-600 px-4 py-1">
          <span className="font-medium text-gray-200">#</span>
          <span className="font-medium text-gray-200">Cover</span>
          <span className="font-medium text-gray-200">Title</span>
          <span className="text-center font-medium text-gray-200">Score</span>
          <span className="text-center font-medium text-gray-200">
            Completed
          </span>
          <span className="text-center font-medium text-gray-200">Author</span>
          <span className="text-center font-medium text-gray-200">Notes</span>
        </div>

        {/* Rows */}
        <div>
          {books.map((book, index) => (
            <div
              key={book.id}
              className="grid grid-cols-[2rem_6rem_20rem_6rem_8rem_10rem_1fr] px-4 py-1"
            >
              <span className="font-medium">{index + 1}</span>
              <span className="font-medium">Picture</span>
              <span className="font-medium">{book.name}</span>
              <span className="text-center font-medium">{book.rating}</span>
              <span className="text-center font-medium">
                {book.yearCompleted}
              </span>
              <span className="text-center font-medium">{book.maker}</span>
              <span className="text-center font-medium text-sm whitespace-normal line-clamp-2">
                rin fucking ass brain; literally thinks without using any brain
                what so ever; everything else pretty good
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            className="text-center bg-green-600 rounded-sm w-25"
            onClick={() => setModalOpen(true)}
          >
            Add Book
          </button>
          <AddBook
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onAddBook={addToBook}
          />
        </div>
      </div>
    </>
  );
}
