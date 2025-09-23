"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
//
import { BookProps } from "@/types/book";
import { formatDate, getStatusBorderGradient } from "@/utils/formattingUtils";
import {
  bookStatusOptions,
  scoreOptions,
} from "../../../utils/dropDownDetails";
//
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { Loading } from "@/app/components/ui/Loading";
import {
  Trash2,
  Plus,
  X,
  ChevronsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
interface BookDetailsProps {
  book: BookProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    bookId: number,
    updates?: Partial<BookProps>,
    takeAction?: boolean
  ) => void;
  addBook?: () => void;
  showSequelPrequel?: (sequelTitle: string) => void;
  showBookInSeries?: (seriesDir: "left" | "right") => void;
  //
  coverUrls?: string[];
  coverIndex?: number;
  updateCoverIndex?: (newIndex: number) => void;
}

export function BookDetails({
  isOpen,
  onClose,
  book,
  onUpdate,
  addBook,
  isLoading,
  showBookInSeries, //when wiki gives more then 1 option
  showSequelPrequel,
  coverUrls,
  coverIndex,
  updateCoverIndex,
}: BookDetailsProps) {
  const [localNote, setLocalNote] = useState(book.note || "");

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<BookProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    } else if (book.dateCompleted) {
      statusLoad.dateCompleted = null;
    }
    onUpdate(book.id, statusLoad);
  };

  const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
    if (!updateCoverIndex) return;
    //detects which side of the div was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const elementWidth = rect.width;
    const isRightSide = clickX > elementWidth / 2;

    //
    if (coverIndex !== undefined && coverUrls !== undefined) {
      let newCoverIndex = coverIndex;
      if (isRightSide) {
        newCoverIndex = (coverIndex + 1) % coverUrls.length;
      } else {
        newCoverIndex =
          coverIndex === 0 ? coverUrls.length - 1 : coverIndex - 1;
      }
      updateCoverIndex(newCoverIndex);
    }
  };

  const openSeriesBook = (seriesDir: string) => {
    if (!showSequelPrequel) return;
    const targetTitle = seriesDir === "sequel" ? book.sequel : book.prequel;
    if (targetTitle) {
      showSequelPrequel(targetTitle);
    }
  };

  const saveNote = () => {
    if (localNote !== book.note) {
      onUpdate(book.id, { note: localNote });
    }
    console.log(book.coverUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      saveNote();
      e.currentTarget.blur(); // Optional: remove focus
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNote(e.target.value);
  };

  const handleDelete = () => {
    onClose();
    const shouldDelete = true;
    onUpdate(book.id, undefined, shouldDelete);
  };

  const handleModalClose = () => {
    if (addBook) return;
    onClose();
  };

  const handleAddBook = () => {
    if (!addBook) return;
    addBook();
    onClose();
  };

  const handleMoreBook = () => {
    const showMoreBooks = true;
    onUpdate(book.id, undefined, showMoreBooks);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    //
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={handleModalClose} />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          book.status
        )} py-2 px-2 lg:min-w-[43.5%] lg:max-w-[43.5%]`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          {isLoading?.isTrue && (
            <Loading customStyle={isLoading.style} text={isLoading.text} />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl`}>
            {/* ACTION BUTTONS */}
            {addBook ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                {showBookInSeries && (
                  <div className="flex gap-1 bg-zinc-800/50 rounded-lg">
                    {/* LEFT BUTTON */}
                    <button
                      className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                    hover:cursor-pointer transition-all group"
                      onClick={() => showBookInSeries("left")}
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </button>
                    {/* RIGHT BUTTON */}
                    <button
                      className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                    hover:cursor-pointer transition-all group"
                      onClick={() => showBookInSeries("right")}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </button>
                  </div>
                )}
                {/* ADD */}
                <button
                  className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
                  onClick={handleAddBook}
                  title={"Add Book"}
                >
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
                </button>
                {/* MORE VIEW */}
                <button
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer
                    transition-all group"
                  onClick={handleMoreBook}
                  title={"See More Options"}
                >
                  <ChevronsUp className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>
                {/* CLOSE BUTTON */}
                <button
                  className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
                  onClick={onClose}
                  title={"Close"}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group z-10"
                onClick={handleDelete}
                title={"Delete Book"}
              >
                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}
            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div
                className={`flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg ${
                  coverUrls ? "hover:cursor-pointer" : ""
                }`}
                onClick={
                  coverUrls && coverUrls?.length > 1
                    ? handleCoverChange
                    : undefined
                }
                title={coverUrls ? `${coverIndex}/${coverUrls?.length}` : ""}
              >
                {coverIndex !== undefined &&
                coverUrls !== undefined &&
                coverUrls[coverIndex] ? (
                  <Image
                    src={coverUrls[coverIndex]}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    className="min-w-62 min-h-93 object-cover"
                  />
                ) : book.coverUrl && book.coverUrl.trim() !== "" ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    className="min-w-62 min-h-93 object-cover"
                  />
                ) : (
                  <div className="min-w-62 min-h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                )}
                <div
                  className="absolute inset-0 left-8.5 top-7 max-w-62 max-h-93"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.2) 100%)",
                  }}
                />
              </div>
              {/* RIGHT SIDE -- DETAILS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62">
                <div className="flex flex-col justify-center flex-1">
                  {/* SERIES TITLE */}
                  {book.seriesTitle && (
                    <span className="font-semibold text-zinc-100/80 text-xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-0">
                      {book.seriesTitle}
                    </span>
                  )}
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
                      {book.title || "Untitled"}
                    </div>
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r ${getStatusBorderGradient(
                        book.status
                      )} to-zinc-800 rounded-full`}
                    ></div>
                  </div>
                  {/* AUTHOR AND DATES */}
                  <div className="flex justify-start items-center gap-2 w-full mb-3">
                    <span className="font-medium text-zinc-200/80 text-lg overflow-y-auto max-h-6 leading-6">
                      {book.author || "Unknown Author"}
                    </span>
                    {/* ◎ ◈ ୭ ✿ ✧ */}
                    <div className="font-medium text-zinc-200/80 text-lg leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200/80 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {book.datePublished || "Unknown"}
                    </span>
                    {book.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200/80 text-lg leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200/80 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDate(book.dateCompleted)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* STATUS AND SCORE */}
                  <div className="flex justify-start gap-4 mb-2.5 max-w-[94%]">
                    <div className="flex-[0.77] lg:min-w-[165px]">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={book.status}
                        onChange={handleStatusChange}
                        options={bookStatusOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          book.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.24}
                      />
                    </div>
                    <div className="flex-[0.865] lg:min-w-[195px]">
                      <label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
                        Score
                      </label>
                      <Dropdown
                        value={book.score?.toString() || "-"}
                        onChange={(value) => {
                          onUpdate(book.id, { score: Number(value) });
                        }}
                        options={scoreOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          book.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.4}
                      />
                    </div>
                  </div>
                  {/* NOTES */}
                  <div className="space-y-1 mb-2">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Notes
                    </label>
                    <div className="bg-zinc-800/50 rounded-lg pl-3 pt-3 pr-1 pb-1.5 max-h-21.5 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200">
                      <AutoTextarea
                        value={localNote}
                        onChange={handleNoteChange}
                        onKeyDown={handleKeyDown}
                        onBlur={saveNote}
                        placeholder="Add your thoughts about this book..."
                        className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                {/* PREQUEL AND SEQUEL */}
                <div className="grid grid-cols-[1fr_3rem_1fr] w-full pr-1.5 select-none">
                  <div className="truncate text-left">
                    {book.prequel && (
                      <div
                        className={`text-sm text-zinc-400/80 ${
                          !addBook ? "hover:underline hover:cursor-pointer" : ""
                        }`}
                      >
                        <label className="text-xs font-medium text-zinc-400 block">
                          <span className="inline-flex items-center gap-1">
                            <span>←</span>
                            <span>Prequel</span>
                          </span>
                        </label>
                        <span
                          onClick={() => {
                            if (!addBook) openSeriesBook("prequel");
                          }}
                        >
                          {book.prequel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-end">
                    {book.placeInSeries && (
                      <label className="text-xs font-medium text-zinc-400/85 block">
                        {book.placeInSeries}
                      </label>
                    )}
                  </div>
                  <div className="truncate text-right">
                    {book.sequel && (
                      <div
                        className={`text-sm text-zinc-400/80 ${
                          !addBook ? "hover:underline hover:cursor-pointer" : ""
                        }`}
                      >
                        <label className="text-xs font-medium text-zinc-400 block">
                          <span className="inline-flex items-center gap-1">
                            <span>Sequel</span>
                            <span>→</span>
                          </span>
                        </label>
                        <span
                          onClick={() => {
                            if (!addBook) openSeriesBook("sequel");
                          }}
                        >
                          {book.sequel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
