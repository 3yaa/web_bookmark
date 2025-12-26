"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookProps } from "@/types/book";
import { BookDetails } from "../components/BookDetailsHub";

export default function BookDetailsPage() {
  const router = useRouter();
  const [book, setBook] = useState<BookProps | null>(null);
  const [coverUrls, setCoverUrls] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    const bookData = sessionStorage.getItem("currentBook");
    if (bookData) {
      const parsedBook = JSON.parse(bookData);
      setBook(parsedBook);

      const coverUrlsData = sessionStorage.getItem("currentBookCovers");
      if (coverUrlsData) setCoverUrls(JSON.parse(coverUrlsData));

      const coverIndexData = sessionStorage.getItem("currentBookCoverIndex");
      if (coverIndexData) setCoverIndex(parseInt(coverIndexData));
    } else {
      router.push("/books");
    }
  }, [router]);

  const handleUpdate = (
    bookId: number,
    updates?: Partial<BookProps>,
    shouldDelete?: boolean
  ) => {
    if (!book) return;

    if (shouldDelete) {
      // Emit delete event and go back
      window.dispatchEvent(
        new CustomEvent("bookDelete", { detail: { bookId } })
      );
      router.back();
      return;
    }

    if (updates) {
      const updatedBook = { ...book, ...updates };
      setBook(updatedBook);
      sessionStorage.setItem("currentBook", JSON.stringify(updatedBook));

      // Emit update event to parent
      window.dispatchEvent(
        new CustomEvent("bookUpdate", {
          detail: { bookId, updates },
        })
      );
    }
  };

  const handleSeriesNav = (targetTitle: string) => {
    window.dispatchEvent(
      new CustomEvent("bookSeriesNav", {
        detail: { title: targetTitle },
      })
    );
  };

  const updateCoverIndex = (newIndex: number) => {
    setCoverIndex(newIndex);
    sessionStorage.setItem("currentBookCoverIndex", newIndex.toString());
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <BookDetails
      isOpen={true}
      book={book}
      onClose={() => router.back()}
      onUpdate={handleUpdate}
      showSequelPrequel={handleSeriesNav}
      coverUrls={coverUrls.length > 0 ? coverUrls : undefined}
      coverIndex={coverUrls.length > 0 ? coverIndex : undefined}
      updateCoverIndex={updateCoverIndex}
    />
  );
}
