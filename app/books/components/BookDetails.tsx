import Image from "next/image";
import { Books } from "@/types/media";
import { CustomSelect } from "@/app/components/ui/Select";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { formatDate } from "@/utils/formatDate";
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
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[calc(100vh-2rem)]">
        <div className="p-4 pl-10">
          <div className="flex gap-5">
            {book.picture ? (
              <Image
                src={book.picture}
                alt={book.name}
                className="w-34 h-50 object-cover rounded-md border border-zinc-600/30"
              />
            ) : (
              <div className="w-34 h-50 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
            )}
            <div className="flex flex-col flex-1 mt-2">
              <span className="mt-2 font-bold text-zinc-100 text-3xl overflow-y-auto max-h-19 mx-auto">
                {book.name || "-"}
              </span>
              <div className="flex justify-center gap-2 w-full">
                <span className="mt-2 font-bold text-zinc-100 text-1xl overflow-y-auto max-h-5">
                  {book.author || "-"}
                </span>
                <div className="mt-2 font-bold text-zinc-100 text-1xl">•</div>
                <span className="mt-2 font-bold text-zinc-100 text-1xl">
                  {book.dateReleased || "-"}
                </span>
              </div>
              <div className="flex justify-center gap-5 w-full mt-2">
                <CustomSelect
                  value={book.status}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  placeholder="Select status"
                />

                <CustomSelect
                  value={book.score?.toString() || "-"}
                  onChange={(value) => {
                    onUpdate(book.id, { score: Number(value) });
                  }}
                  options={scoreOptions}
                  placeholder="Score"
                />
              </div>
              <div className="mx-auto mt-2">
                <span className="font-bold text-zinc-100 text-1xl">
                  {book.status === "Completed" &&
                    `Completed on: ${formatDate(book.dateCompleted)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 pb-1 max-h-100 overflow-hidden">
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
  );
}
