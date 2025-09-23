import { BookProps } from "@/types/book";
import { useEffect, useState, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useBookData() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [books, setBooks] = useState<BookProps[]>([]);
  const [bookDataLoading, setBookDataLoading] = useState(true);

  const isProcessingBook = bookDataLoading || isAuthLoading;

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

  // READ
  const getBooks = useCallback(async () => {
    try {
      setBookDataLoading(true);
      //
      const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books`;
      const response = await authFetch(url);
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
  }, [authFetch]);

  // CREATE
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
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(book),
        };
        const response = await authFetch(url, options);
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
    [authFetch]
  );

  // UPDATE
  const updateBook = useCallback(
    async (bookId: number, updates: Partial<BookProps>) => {
      try {
        // only updates these
        const allowedFields = ["score", "status", "note", "dateCompleted"];
        const invalidFields = Object.keys(updates).filter(
          (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
          console.warn("Invalid fields attempted:", invalidFields);
          return;
        }
        // update local immediately
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === bookId ? { ...book, ...updates } : book
          )
        );
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books/${bookId}`;
        const options = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error updating book", e);
      }
    },
    [authFetch]
  );

  // DELETE
  const deleteBook = useCallback(
    async (bookId: number) => {
      try {
        setBookDataLoading(true);
        // update locally
        setBooks((prevBooks) => {
          return prevBooks.filter((book) => book.id !== bookId);
        });
        // update db
        const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/books/${bookId}`;
        const options = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error deleting book", e);
      } finally {
        setBookDataLoading(false);
      }
    },
    [authFetch]
  );

  //
  useEffect(() => {
    getBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
    isProcessingBook,
  };
}
