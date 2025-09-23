"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { BookProps, SortConfig } from "@/types/book";
// hooks
import { useSortBooks } from "@/app/books/hooks/useSortBooks";
import { useBookData } from "@/app/books/hooks/useBookData";
// components
import { AddBook } from "./addingBook/AddBook";
import { BookDetails } from "./BookDetails";
// utils and ui components
import { formatDateShort, getStatusBorderColor } from "@/utils/formattingUtils";
import { Loading } from "@/app/components/ui/Loading";
import { NavMenu } from "./NavMenu";

export default function BookList() {
  //
  const { books, addBook, updateBook, deleteBook, isProcessingBook } =
    useBookData();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const sortedBooks = useSortBooks(books, sortConfig);
  //
  const [selectedBook, setSelectedBook] = useState<BookProps | null>(null);
  const [titleToUse, setTitleToUse] = useState<string>("");
  const [activeModal, setActiveModal] = useState<
    "bookDetails" | "addBook" | null
  >(null);

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

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setTitleToUse("");
    setSelectedBook(null);
  }, []);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
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
      <div className="w-full md:w-[70%] lg:w-[60%] mx-auto">
        {/* HEADING */}
        <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
          <span className="font-semibold text-zinc-300 text-sm">#</span>
          <span className="font-semibold text-zinc-300 text-sm">Cover</span>
          {/* TITLE */}
          <div
            className="flex justify-start items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("title")}
          >
            <span className="font-semibold text-zinc-300 text-sm">Title</span>
            {sortConfig?.type === "title" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* SCORE */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("score")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "score" ? "ml-4" : ""
              }`}
            >
              Score
            </span>
            {sortConfig?.type === "score" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* DATE COMPLETED */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("dateCompleted")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "dateCompleted" ? "ml-4" : ""
              }`}
            >
              Completed
            </span>
            {sortConfig?.type === "dateCompleted" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* AUTHOR */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("author")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "author" ? "ml-4" : ""
              }`}
            >
              Author
            </span>
            {sortConfig?.type === "author" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          {/* DATE PUBLISHED */}
          <div
            className="flex justify-center items-center gap-1 hover:cursor-pointer"
            onClick={() => handleSortConfig("datePublished")}
          >
            <span
              className={`text-center font-semibold text-zinc-300 text-sm ${
                sortConfig?.type === "datePublished" ? "ml-4" : ""
              }`}
            >
              Published
            </span>
            {sortConfig?.type === "datePublished" &&
              (sortConfig?.order === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              ))}
          </div>
          <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
            Notes
          </span>
        </div>
        {/* LOADER */}
        <div className="relative bg-black/20 backdrop-blur-lg">
          {isProcessingBook && (
            <Loading customStyle={"mt-72 h-12 w-12 border-gray-400"} text="" />
          )}
        </div>
        {/* NO BOOKS */}
        {!isProcessingBook && sortedBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 italic text-lg">
              No books yet — add one above!
            </p>
          </div>
        )}
        {/* LISTING */}
        {!isProcessingBook &&
          sortedBooks.map((book, index) => (
            <div
              key={book.id}
              className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_0.9fr_6rem_8rem_10rem_8rem_1fr] px-3 py-0.5 items-center bg-zinc-950/40 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-900 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
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
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    priority
                    className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-zinc-400 text-[70%] group-hover:text-emerald-400 flex gap-1">
                  {book.seriesTitle ? (
                    <>
                      <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden flex-shrink">
                        {book.seriesTitle}
                      </span>
                      <span>᭡</span>
                      <span>{book.placeInSeries}</span>
                    </>
                  ) : (
                    ""
                  )}
                </span>
                <span className="font-semibold text-zinc-100 text-[95%] group-hover:text-emerald-400 transition-colors duration-200 truncate max-w-53">
                  {book.title || "-"}
                </span>
              </div>
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
                {book.datePublished || "-"}
              </span>
              <span className="text-zinc-400 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center">
                {book.note || "No notes"}
              </span>
            </div>
          ))}
      </div>
      <NavMenu />
      {/* ADD BUTTON */}
      <div className="fixed bottom-10 right-12 z-10">
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
