// app/books/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookProps } from "@/types/book";
import { BookDesktopDetails } from "../components/detailsViews/BookDesktopDetails";
import { BookMobileDetails } from "../components/detailsViews/BookMobileDetails";
import { BookAction } from "../components/BookDetailsHub";

export default function BookDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [book, setBook] = useState<BookProps | null>(null);
  const [localNote, setLocalNote] = useState("");
  const [coverUrls, setCoverUrls] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  // Get book data from sessionStorage (passed from listing page)
  useEffect(() => {
    const bookData = sessionStorage.getItem("currentBook");
    if (bookData) {
      const parsedBook = JSON.parse(bookData);
      setBook(parsedBook);
      setLocalNote(parsedBook.note || "");

      // Handle cover URLs if passed
      const coverUrlsData = sessionStorage.getItem("currentBookCovers");
      if (coverUrlsData) {
        setCoverUrls(JSON.parse(coverUrlsData));
      }

      const coverIndexData = sessionStorage.getItem("currentBookCoverIndex");
      if (coverIndexData) {
        setCoverIndex(parseInt(coverIndexData));
      }
    } else {
      // If no data, go back to listing
      router.push("/books");
    }
  }, [router]);

  const handleAction = (action: BookAction) => {
    if (!book) return;

    switch (action.type) {
      case "closeModal":
        router.back();
        break;

      case "deleteBook":
        // Emit event for parent to handle
        window.dispatchEvent(
          new CustomEvent("bookDelete", { detail: { bookId: book.id } })
        );
        router.back();
        break;

      case "changeStatus":
        const newStatus = action.payload;
        const statusUpdate: Partial<BookProps> = {
          status: newStatus,
        };
        if (newStatus === "Completed") {
          statusUpdate.dateCompleted = new Date();
        } else if (book.dateCompleted) {
          statusUpdate.dateCompleted = null;
        }
        updateBook(statusUpdate);
        break;

      case "changeScore":
        updateBook({ score: action.payload });
        break;

      case "changeNote":
        setLocalNote(action.payload);
        break;

      case "saveNote":
        if (localNote !== book.note) {
          updateBook({ note: localNote });
        }
        break;

      case "changeCover":
        if (coverUrls.length > 1) {
          let newIndex = coverIndex;
          if (action.payload === "next") {
            newIndex = (coverIndex + 1) % coverUrls.length;
          } else {
            newIndex = coverIndex === 0 ? coverUrls.length - 1 : coverIndex - 1;
          }
          setCoverIndex(newIndex);
          sessionStorage.setItem("currentBookCoverIndex", newIndex.toString());
        }
        break;

      case "seriesNav":
        const targetTitle =
          action.payload === "sequel" ? book.sequel : book.prequel;
        if (targetTitle) {
          // Emit event to parent to handle series navigation
          window.dispatchEvent(
            new CustomEvent("bookSeriesNav", {
              detail: { title: targetTitle },
            })
          );
        }
        break;

      case "moreBooks":
        // Emit event for showing more books
        window.dispatchEvent(
          new CustomEvent("bookShowMore", { detail: { bookId: book.id } })
        );
        break;
    }
  };

  const updateBook = (updates: Partial<BookProps>) => {
    if (!book) return;

    const updatedBook = { ...book, ...updates };
    setBook(updatedBook);

    // Update sessionStorage
    sessionStorage.setItem("currentBook", JSON.stringify(updatedBook));

    // Emit event for parent to update its state
    window.dispatchEvent(
      new CustomEvent("bookUpdate", {
        detail: { bookId: book.id, updates },
      })
    );
  };

  const handleClose = () => {
    router.back();
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:block hidden">
        <BookDesktopDetails
          book={book}
          onClose={handleClose}
          localNote={localNote}
          addingBook={false}
          onAddBook={() => {}}
          onAction={handleAction}
          coverUrls={coverUrls.length > 0 ? coverUrls : undefined}
          coverIndex={coverUrls.length > 0 ? coverIndex : undefined}
        />
      </div>
      <div className="block lg:hidden">
        <BookMobileDetails
          book={book}
          onClose={handleClose}
          localNote={localNote}
          addingBook={false}
          onAddBook={() => {}}
          onAction={handleAction}
          coverUrls={coverUrls.length > 0 ? coverUrls : undefined}
          coverIndex={coverUrls.length > 0 ? coverIndex : undefined}
        />
      </div>
    </>
  );
}
