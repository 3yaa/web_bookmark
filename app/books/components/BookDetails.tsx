import Image from "next/image";
import { Books } from "@/types/media";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { getStatusBorder } from "@/utils/randomUtils";
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200 max-h-[calc(100vh-2rem)]">
        <div
          className={`p-4 border-t-6 rounded-2xl ${getStatusBorder(
            book.status
          )}`}
        >
          <div className="flex gap-5">
            {/* LEFT SIDE OF THE MODAL */}
            {book.picture ? (
              <Image
                src={book.picture}
                alt={book.name}
                className="w-56 h-81 object-cover rounded-md border border-zinc-600/30"
              />
            ) : (
              <div className="w-56 h-81 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
            )}
            {/* RIGHT SIDE OF THE MODAL */}
            <div className="flex flex-col justify-center flex-1 gap-1">
              <span className="text-center font-bold text-zinc-100 text-3xl mt-3 overflow-y-auto max-h-10.5 mx-auto">
                {book.name || "-"}
              </span>
              <div className="flex justify-center gap-2 w-full">
                <span className="text-center font-bold text-zinc-200 text-1xl overflow-y-auto max-h-6">
                  {book.author || "-"}
                </span>
                <div className="font-bold text-zinc-200 text-1xl">•</div>
                <span className="text-center font-bold text-zinc-200 text-1xl">
                  {book.dateReleased || "-"}
                </span>
              </div>
              <div className="flex justify-center mt-2 gap-1 w-full">
                <Dropdown
                  value={book.status}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  customStyle="text-zinc-200 font-semibold"
                />

                <Dropdown
                  value={book.score?.toString() || "-"}
                  onChange={(value) => {
                    onUpdate(book.id, { score: Number(value) });
                  }}
                  options={scoreOptions}
                  customStyle="text-zinc-200 font-semibold"
                />
              </div>
              <div className="bg-zinc-800/50 rounded-lg mt-3 p-3 pr-1 pb-1 max-h-40 overflow-hidden">
                <AutoTextarea
                  value={book.note}
                  onChange={(e) => {
                    onUpdate(book.id, { note: e.target.value });
                  }}
                  className="text-gray-300 text-md whitespace-pre-line"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
