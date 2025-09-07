import { BookProps } from "@/types/books";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

export function useBookData() {
  const { authToken } = useAuth();
  const [books, setBooks] = useState<BookProps[]>([]);
  const [bookDataLoading, setBookDataLoading] = useState(false);

  // move this to server
  // const linkBook = useCallback(
  //   (book: BookProps) => {
  //     if (book.seriesTitle) {
  //       books.forEach((bk) => {
  //         // when book isn't linked
  //         if (bk.sequel === book.title && !book.prequel) {
  //           // set book prequel to bk
  //           book.prequel = bk.title;
  //         } else if (bk.prequel === book.title && !book.sequel) {
  //           // set book sequel to bk
  //           book.sequel = bk.title;
  //         }
  //         // when bk isn't linked
  //         if (book.prequel === bk.title && !bk.sequel) {
  //           // sets bk sequel to book
  //           bk.sequel = book.title;
  //         } else if (book.sequel === bk.title && !bk.prequel) {
  //           // sets bk prequel to book
  //           bk.prequel = book.title;
  //         }
  //       });
  //     }
  //     return book;
  //   },
  //   [books]
  // );

  // GET
  const getBooks = useCallback(async () => {
    try {
      setBookDataLoading(true);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const booksDB = resJson.data || [];
      setBooks(booksDB);
    } catch (e) {
      console.error("Error loading books", e);
      setBooks([]);
    } finally {
      setBookDataLoading(false);
    }
  }, [authToken]);

  // PUT
  const addBook = useCallback(
    async (book: BookProps) => {
      // req data
      if (!book.title || !book.status || !book.key) {
        return;
      }
      //
      try {
        setBookDataLoading(true);
        //
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(book),
        });
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const newBook = resJson.data;
        setBooks((prev) => [...prev, newBook]);
      } catch (e) {
        console.error("Error adding book", e);
      } finally {
        setBookDataLoading(false);
      }
    },
    [authToken]
  );

  // PATCH
  const updateBook = useCallback(
    async (bookId: number, updates: Partial<BookProps>) => {
      // only updates these
      const allowedFields = ["score", "status", "notes"];
      const invalidFields = Object.keys(updates).filter(
        (field) => !allowedFields.includes(field)
      );
      if (invalidFields.length > 0) return;
      //
      try {
        setBookDataLoading(true);
        //
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books/${bookId}`;
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updates),
        });
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const updatedBook = resJson.data;
        setBooks((prevBooks) => {
          return prevBooks.map((book) =>
            book.id === bookId ? updatedBook : book
          );
        });
      } catch (e) {
        console.error("Error updating book", e);
      } finally {
        setBookDataLoading(false);
      }
    },
    [authToken]
  );

  // DELETE
  const deleteBook = useCallback(
    async (bookId: number) => {
      try {
        setBookDataLoading(true);
        //
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books/${bookId}`;
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const deletedBook = resJson.data;
        setBooks((prevBooks) => {
          return prevBooks.filter((book) => book.id !== deletedBook.id);
        });
      } catch (e) {
        console.error("Error deleting book", e);
      } finally {
        setBookDataLoading(false);
      }
    },
    [authToken]
  );

  //
  useEffect(() => {
    getBooks();
  }, [getBooks]);

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
    bookDataLoading,
  };
}
