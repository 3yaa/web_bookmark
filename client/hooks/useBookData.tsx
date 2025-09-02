import { BookProps } from "@/types/books";
import { useEffect, useState, useCallback } from "react";

export function useBookData() {
  const [books, setBooks] = useState<BookProps[]>([]);

  // GET
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

  // PUT
  const addBook = useCallback(
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

  // PARSE
  const updateBook = useCallback(
    (bookId: number, updates: Partial<BookProps>) => {
      setBooks((prevBooks) => {
        return prevBooks.map((book) =>
          book.id === bookId ? { ...book, ...updates } : book
        );
      });
    },
    []
  );

  // DELETE
  const deleteBook = useCallback(
    (bookId: number) => {
      setBooks((prevBooks) => {
        return prevBooks.filter((book) => book.id !== bookId);
      });
    },
    [setBooks]
  );

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
  };
}
