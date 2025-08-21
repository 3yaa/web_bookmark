import Image from "next/image";
import { Books } from "@/types/media";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { formatDate, getStatusBorder } from "@/utils/randomUtils";
interface BookDetailsProps {
  book: Books;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (bookId: number, changes: Partial<Books>) => void;
}

export function BookDetails({
  isOpen,
  book,
  onClose,
  onUpdate,
}: BookDetailsProps) {
  if (!isOpen || !book) return null;

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<Books> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = Date.now();
    }
    onUpdate(book.id, statusLoad);
  };

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      {/*  */}
      <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-zinc-800/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-3xl mx-6 animate-in zoom-in-95 duration-300 max-h-[calc(100vh-3rem)]">
        <div
          className={`px-7 py-6 border-t-6 rounded-2xl ${getStatusBorder(
            book.status
          )}`}
        >
          <div className="flex gap-8 ">
            {/* LEFT SIDE -- PIC */}
            <div className="flex-shrink-0">
              {book.picture ? (
                <Image
                  src={book.picture}
                  alt={book.name}
                  className="w-62 h-90 object-cover rounded-xl border border-zinc-600/30"
                />
              ) : (
                <div className="w-62 h-90 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl border border-zinc-600/30"></div>
              )}
            </div>
            {/* RIGHT SIDE -- DETIALS */}
            <div className="flex flex-col justify-center flex-1 min-h-60 space-y-2">
              {/* TITLE */}
              <span className="font-bold text-zinc-100 text-3xl overflow-y-auto max-h-10.5 mb-0">
                {book.name || "Untitled"}
              </span>
              {/* AUTHOR AND DATE */}
              <div className="flex justify-start items-center gap-2 w-full mb-3">
                <span className="font-medium text-zinc-200 text-lg overflow-y-auto max-h-6 leading-6">
                  {book.author || "Unknown Author"}
                </span>
                {/* ◎ ◈ ୭ ✿ ✧ */}
                <div className="font-medium text-zinc-200 text-lg leading-6">
                  ✧
                </div>
                <span className="font-medium text-zinc-200 text-md overflow-y-auto max-h-6 leading-6">
                  {book.dateReleased || "Unknown"}
                </span>
                {book.status === "Completed" && (
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-zinc-200 text-lg leading-6">
                      ✧
                    </div>
                    <span className="font-medium text-zinc-200 text-md overflow-y-auto max-h-6 leading-6">
                      {formatDate(book.dateCompleted)}
                    </span>
                  </div>
                )}
              </div>
              {/* STATUS AND SCORE */}
              <div className="flex gap-4">
                <div className="flex-[0.82]">
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
                    dropDuration={0.22}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">
                    Rating
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
              <div className="space-y-1 mt-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Notes
                </label>
                <div className="bg-zinc-800/50 rounded-lg p-3 pr-1 pb-1 max-h-40 overflow-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
