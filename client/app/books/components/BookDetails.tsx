import Image from "next/image";
import { BookProps } from "@/types/books";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { formatDate, getStatusBorderGradient } from "@/utils/formattingUtils";
import { getCoverUrl } from "@/app/books/utils/bookMapping";
import { Loading } from "@/app/components/ui/Loading";
import {
  Trash2,
  Plus,
  X,
  ChevronsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const statusOptions = [
  {
    value: "Want to Read",
    label: "Want to Read",
    className: "text-blue-500",
  },
  { value: "Completed", label: "Completed", className: "text-green-600" },
  {
    value: "Dropped",
    label: "Dropped",
    className: "text-red-500",
  },
];

const getScoreLabel = (score: number): string => {
  if (score >= 11) return "Beyond Cinema";
  if (score >= 10) return "Masterpiece";
  if (score >= 9) return "Amazing";
  if (score >= 8) return "Great";
  if (score >= 7) return "Good";
  if (score >= 6) return "Average";
  if (score >= 5) return "Below Average";
  if (score >= 4) return "Yikes";
  if (score >= 3) return "Bad";
  if (score >= 2) return "Awful";
  if (score >= 1) return "Dog Water";
  return "Select Option";
};

const scoreOptions = Array.from({ length: 12 }, (_, i) => {
  const scoreValue = i === 0 ? 0 : 12 - i;
  return {
    value: scoreValue.toString(),
    label:
      scoreValue !== 0
        ? `${scoreValue} - ${getScoreLabel(scoreValue)}`
        : `${getScoreLabel(scoreValue)}`,
  };
});

interface BookDetailsProps {
  book: BookProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onUpdate: (
    bookId: number,
    updates?: Partial<BookProps>,
    takeAction?: boolean
  ) => void;
  addBook?: () => void;
  showSequelPrequel?: (sequelTitle: string) => void;
  showBookInSeries?: (seriesDir: "left" | "right") => void;
}

export function BookDetails({
  isOpen,
  onClose,
  book,
  onUpdate,
  addBook,
  isLoading,
  showBookInSeries,
  showSequelPrequel,
}: BookDetailsProps) {
  if (!isOpen || !book) return null;

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<BookProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = Date.now();
    }
    onUpdate(book.id, statusLoad);
  };

  const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
    //detects which side of the div was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const elementWidth = rect.width;
    const isRightSide = clickX > elementWidth / 2;

    //
    if (book.curCoverIndex !== undefined && book.coverEditions !== undefined) {
      let newCoverIndex = book.curCoverIndex;
      if (isRightSide) {
        newCoverIndex = (book.curCoverIndex + 1) % book.coverEditions.length;
      } else {
        newCoverIndex =
          book.curCoverIndex === 0
            ? book.coverEditions.length - 1
            : book.curCoverIndex - 1;
      }
      onUpdate(book.id, { curCoverIndex: newCoverIndex });
    }
  };

  const openSeriesBook = (seriesDir: string) => {
    if (!showSequelPrequel) return;
    const targetTitle = seriesDir === "sequel" ? book.sequel : book.prequel;
    if (targetTitle) {
      showSequelPrequel(targetTitle);
    }
  };

  const handleDelete = () => {
    const shouldDelete = true;
    onUpdate(book.id, undefined, shouldDelete);
    onClose();
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={handleModalClose} />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          book.status
        )} py-2 px-2`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 lg:min-w-3xl lg:max-w-3xl w-full max-h-[calc(100vh-3rem)]">
          {isLoading && (
            <Loading
              borderColor={"border-emerald-400"}
              text="Searching Book..."
            />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl`}>
            {/* ACTION BUTTONS */}
            {addBook ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
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
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group"
                onClick={handleDelete}
                title={"Delete Book"}
              >
                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}
            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div
                className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg hover:cursor-pointer"
                onClick={handleCoverChange}
                title={`${book.curCoverIndex}/${book.coverEditions?.length}`}
              >
                {book.curCoverIndex !== undefined &&
                book.coverEditions !== null ? (
                  <Image
                    src={getCoverUrl(book.coverEditions?.[book.curCoverIndex])}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    className="min-w-62 min-h-93 object-fill"
                  />
                ) : book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    className="min-w-62 min-h-93 object-fill"
                  />
                ) : (
                  <div className="min-w-62 min-h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                )}
              </div>
              {/* RIGHT SIDE -- DETAILS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62">
                <div className="flex flex-col justify-center flex-1">
                  {/* SERIES TITLE */}
                  {book.seriesTitle && (
                    <span className="font-semibold text-zinc-100 text-xl overflow-y-auto max-h-10.5 mb-0">
                      {book.seriesTitle}
                    </span>
                  )}
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100 text-3xl overflow-x-auto overflow-y-hidden max-h-10.5 mb-1.5">
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
                    <span className="font-medium text-zinc-200 text-lg overflow-y-auto max-h-6 leading-6">
                      {book.author || "Unknown Author"}
                    </span>
                    {/* ◎ ◈ ୭ ✿ ✧ */}
                    <div className="font-medium text-zinc-200 text-lg leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {book.datePublished || "Unknown"}
                    </span>
                    {book.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200 text-lg leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDate(book.dateCompleted ?? 0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* STATUS AND SCORE */}
                  <div className="flex justify-start gap-4 mb-2.5">
                    <div className="lg:min-w-[165px]">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={book.status}
                        onChange={handleStatusChange}
                        options={statusOptions}
                        customStyle="text-zinc-200 font-semibold"
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
                        customStyle="text-zinc-200 font-semibold"
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
                  <div className="space-y-1 mb-5">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Notes
                    </label>
                    <div className="bg-zinc-800/50 rounded-lg pl-3 pt-2 pr-1 pb-1 max-h-25 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200">
                      <AutoTextarea
                        value={book.note || ""}
                        onChange={(e) => {
                          onUpdate(book.id, { note: e.target.value });
                        }}
                        placeholder="Add your thoughts about this book..."
                        className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                {/* PREQUEL AND SEQUEL */}
                <div className="grid grid-cols-[1fr_3rem_1fr] w-full pr-1.5">
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
