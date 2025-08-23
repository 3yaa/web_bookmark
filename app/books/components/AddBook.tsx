"use client";
import Image from "next/image";
import { useState } from "react";
import { Book } from "lucide-react";
import { Books } from "@/types/media";
import { OpenLibPayload } from "@/types/book";
import { searchForBooks } from "./searchForBooks";

interface AddBookProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Books) => void;
}

export function AddBook({ isOpen, onClose, onAddBook }: AddBookProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [titleSearching, setTitleSearching] = useState("");
  const [booksFromOpenLib, setBooksFromOpenLib] = useState<OpenLibPayload[]>(
    []
  );

  if (!isOpen) return null;

  const getCoverUrl = (
    coverId: number,
    size: "S" | "M" | "L" = "L"
  ): string => {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  };

  const handleTitleSearch = async () => {
    try {
      if (!titleSearching) return null;
      setIsSearching(true);
      // make call
      const response = await searchForBooks({
        query: titleSearching,
      });
      setBooksFromOpenLib(response);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPres = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
        <h2 className="text-xl font-semibold mb-6 text-zinc-100 flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-400" />
          Add New Book
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search for books..."
            value={titleSearching}
            onKeyDown={handleKeyPres}
            onChange={(e) => setTitleSearching(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200"
          />

          <button
            onClick={handleTitleSearch}
            disabled={isSearching || !titleSearching.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:shadow-none text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
        {booksFromOpenLib.length > 0 && (
          <>
            <div className="flex-1 overflow-auto max-h-96 space-y-3 border-t border-zinc-800 pt-4">
              {booksFromOpenLib.map((book, i) => (
                <div
                  key={i}
                  onClick={() => console.log("Selected book:", book)}
                  className="flex gap-3 p-2 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  {/* COVER */}
                  <div className="w-12 h-16 bg-zinc-700 rounded flex-shrink-0 overflow-hidden">
                    {book.cover_i ? (
                      <Image
                        src={getCoverUrl(book.cover_i)}
                        alt={book.title}
                        width={50}
                        height={68}
                        className="object-cover rounded-md border border-zinc-600/30"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Book className="w-4 h-4 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-100 truncate">
                      {book.title}
                    </h3>
                    <p className="flex gap-2 items-center text-sm text-zinc-400 truncate">
                      {Array.isArray(book.author_name)
                        ? book.author_name.join(", ")
                        : book.author_name}
                      {book.first_publish_year && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Published: {book.first_publish_year}
                        </p>
                      )}
                    </p>

                    {book.subject && book.subject.length > 0 && (
                      <p className="text-xs text-zinc-500 truncate">
                        Genres: {book.subject.slice(0, 3).join(", ")}
                        {book.subject.length > 3 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div key="cancel" className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
