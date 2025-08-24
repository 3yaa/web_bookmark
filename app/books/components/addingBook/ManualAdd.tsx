"use client";
import { useState } from "react";
import { Book } from "lucide-react";
import { BookProps } from "@/types/books";

interface AddBookProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: BookProps) => void;
}

export function AddBook({ isOpen, onClose, onAddBook }: AddBookProps) {
  const [newBook, setNewBook] = useState<Omit<BookProps, "id">>({
    title: "",
    author: "",
    // coverUrl: "",
    dateCompleted: 0,
    datePublished: 0,
    status: "Want to Read",
    score: 0,
    note: "",
  });

  if (!isOpen) return null;

  const handleAddBook = () => {
    onAddBook({ ...newBook, id: Date.now(), dateCompleted: Date.now() });
    setNewBook({
      title: "",
      author: "",
      // coverUrl: "",
      dateCompleted: 0,
      datePublished: 0,
      status: "Want to Read",
      score: 0,
      note: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 relative">
        <h2 className="text-xl font-semibold mb-6 text-zinc-100 flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-400" />
          Add New Book
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Book Name"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              max="11"
              placeholder="Score (1-10)"
              value={newBook.score}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 11) {
                  setNewBook({ ...newBook, score: parseInt(e.target.value) });
                }
              }}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Year"
              value={newBook.datePublished}
              onChange={(e) =>
                setNewBook({
                  ...newBook,
                  datePublished: parseInt(e.target.value),
                })
              }
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
            />
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={newBook.note}
            onChange={(e) => setNewBook({ ...newBook, note: e.target.value })}
            rows={3}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 resize-none"
          />
          <select
            value={newBook.status}
            onChange={(e) =>
              setNewBook({
                ...newBook,
                status: e.target.value as "Completed" | "Want to Read",
              })
            }
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
          >
            <option value="Want to Read">Want to Read</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBook}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
            >
              Add Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
