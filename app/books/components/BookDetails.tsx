import Image from "next/image";
import { Books, MediaStatus } from "@/types/media";

interface BookDetailsProps {
  book: Books;
  isOpen: boolean;
  onClose: () => void;
}

export function BookDetails({ isOpen, onClose, book }: BookDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-5">
            {book.picture ? (
              <Image
                src={book.picture}
                alt={book.name}
                className="w-24 h-34 object-cover rounded-md border border-zinc-600/30"
              />
            ) : (
              <div className="w-24 h-34 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"></div>
            )}
            <div className="flex flex-col flex-1">
              <span className="mt-2 font-bold text-zinc-100 text-3xl group-hover:text-emerald-400 transition-colors duration-200">
                {book.name || "-"}
              </span>
              <div className="flex justify-start gap-5  w-full">
                <span className="mt-2 text-center font-bold text-zinc-300 text-2xl">
                  {book.status || "-"}
                </span>
                <span className="mt-2 text-center font-bold text-zinc-300 text-2xl">
                  {book.score || "-"}/10
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800/50 p-4">
          <span className="text-gray-400 text-1xl font-semibold overflow-hidden">
            {book.note}
          </span>
        </div>
      </div>
    </div>
  );
}
