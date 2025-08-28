"use client";
import { Book, X } from "lucide-react";
import { BookProps } from "@/types/books";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { getStatusBorderGradient } from "@/utils/formattingUtils";
import Image from "next/image";

interface ManualAddBook {
  isOpen: boolean;
  onClose: () => void;
  addBook: () => void;
  book: Partial<BookProps>;
  onUpdate: (updates: Partial<BookProps>) => void;
}

const statusOptions = [
  { value: "Completed", label: "Completed", className: "text-green-600" },
  {
    value: "Want to Read",
    label: "Want to Read",
    className: "text-blue-500",
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
  return "Not Rated";
};

const scoreOptions = Array.from({ length: 11 }, (_, i) => {
  const scoreValue = 11 - i;
  return {
    value: scoreValue.toString(),
    label: `${scoreValue} - ${getScoreLabel(scoreValue)}`,
    className: "text-zinc-200",
  };
});

export function ManualAddBook({
  isOpen,
  onClose,
  book,
  onUpdate,
  addBook,
}: ManualAddBook) {
  if (!isOpen) return null;

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<BookProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = Date.now();
    }
    onUpdate(statusLoad);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          "Completed"
        )} py-2 px-2`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 lg:min-w-3xl lg:max-w-3xl w-full max-h-[calc(100vh-3rem)]">
          <div className="px-8.5 py-7 border-0 rounded-2xl">
            {/* CLOSE BUTTON */}
            <button
              className="absolute right-3 top-3 py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
              hover:cursor-pointer transition-all group"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
            </button>

            <div className="flex gap-8">
              <div className="flex-shrink-0">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title || "Untitled"}
                    width={248}
                    height={372}
                    className="w-62 h-93 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-62 h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg border border-zinc-600/30"></div>
                )}
              </div>
              {/* RIGHT SIDE -- DETIALS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62">
                {/* TITLE */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400 block">
                    Title*
                  </label>
                  <input
                    type="text"
                    placeholder="Enter book title"
                    value={book.title || ""}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400 block">
                    Cover Image Url
                  </label>
                  <input
                    type="text"
                    placeholder="Enter cover url"
                    value={book.coverUrl || ""}
                    onChange={(e) => onUpdate({ coverUrl: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
                {/* AUTHOR */}
                <div className="flex gap-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Author
                    </label>
                    <input
                      type="text"
                      placeholder="Enter author name"
                      value={book.author || ""}
                      onChange={(e) => onUpdate({ author: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                    />
                  </div>
                  {/* PUBLICATION YEAR */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      placeholder="Enter publication year"
                      value={book.datePublished || ""}
                      onChange={(e) =>
                        onUpdate({
                          datePublished: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                {/* STATUS AND SCORE */}
                <div className="flex justify-start gap-4">
                  <div className="lg:min-w-[165px] flex-1">
                    <label className="text-sm font-medium text-zinc-400 mb-1 block">
                      Status
                    </label>
                    <Dropdown
                      value={book.status || "Want to Read"}
                      onChange={handleStatusChange}
                      options={statusOptions}
                      customStyle="text-zinc-200 font-semibold"
                      dropStyle={
                        book.status === "Completed"
                          ? ["to-emerald-500/10", "text-emerald-500"]
                          : ["to-blue-500/10", "text-blue-500"]
                      }
                      dropDuration={0.22}
                    />
                  </div>
                  <div className="flex-1 lg:min-w-[195px]">
                    <label className="text-sm font-medium text-zinc-400 mb-1 block">
                      Rating
                    </label>
                    <Dropdown
                      value={book.score?.toString() || "-"}
                      onChange={(value) => {
                        onUpdate({ score: Number(value) });
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400 block">
                    Notes
                  </label>
                  <div className="bg-zinc-800/50 rounded-lg pl-3 pt-2 pr-1 pb-1 max-h-25 overflow-auto">
                    <AutoTextarea
                      value={book.note || ""}
                      onChange={(e) => {
                        onUpdate({ note: e.target.value });
                      }}
                      placeholder="Add your thoughts about this book..."
                      className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {/* <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addBook}
                  className="flex-1 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
                >
                  Add Book
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
