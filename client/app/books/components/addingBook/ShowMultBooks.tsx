import { AllBooks, OpenLibData, GoogleBooks } from "@/types/books";
import { X, DiamondPlus } from "lucide-react";
import Image from "next/image";
import { getCoverUrl } from "../../utils/bookMapping";
import { Loading } from "@/app/components/ui/Loading";

interface MultSearchProps {
  isOpen: boolean;
  onClose: (action: "manualAdd" | null) => void;
  prompt: string;
  books: AllBooks;
  onClickedBook: (book: OpenLibData | GoogleBooks) => void;
  isLoading?: boolean;
}

export function ShowMultBooks({
  isOpen,
  onClose,
  books,
  prompt,
  onClickedBook,
  isLoading,
}: MultSearchProps) {
  if (!isOpen) return null;

  // Combine and alternate books from both sources
  const combinedBooks: Array<{
    book: OpenLibData | GoogleBooks;
    source: "OpenLib" | "GoogleB";
  }> = [];
  const totalLength = books.OpenLibBooks.length + books.GoogleBooks.length;
  let openLibI = 0;
  let googleI = 0;

  for (let i = 0; i < totalLength; i++) {
    if (i % 2 === 0) {
      if (openLibI < books.OpenLibBooks.length) {
        combinedBooks.push({
          book: books.OpenLibBooks[openLibI],
          source: "OpenLib",
        });
        openLibI++;
      } else if (googleI < books.GoogleBooks.length) {
        combinedBooks.push({
          book: books.GoogleBooks[googleI],
          source: "GoogleB",
        });
        googleI++;
      }
    } else {
      if (googleI < books.GoogleBooks.length) {
        combinedBooks.push({
          book: books.GoogleBooks[googleI],
          source: "GoogleB",
        });
        googleI++;
      } else if (openLibI < books.OpenLibBooks.length) {
        combinedBooks.push({
          book: books.OpenLibBooks[openLibI],
          source: "OpenLib",
        });
        openLibI++;
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Modal content */}
      <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        {isLoading && (
          <Loading
            borderColor={"border-emerald-400"}
            text="Searching Book..."
          />
        )}
        {/* ACTION BUTTON */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* ADD */}
          <button
            className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
            onClick={() => {
              onClose("manualAdd");
            }}
            title={"Manually Add"}
          >
            <DiamondPlus className="w-5 h-5 text-gray-400 group-hover:text-green-500  transition-colors" />
          </button>
          {/* CLOSE -- go back to detail page*/}
          <button
            className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
            onClick={() => {
              onClose(null);
            }}
            title={"Close"}
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
          </button>
        </div>

        {/* TITLE */}
        {prompt ? (
          <h2 className="text-xl font-semibold text-white mb-4">
            Search Results:
            <span className="text-gray-200 text-lg"> {prompt}</span>
          </h2>
        ) : (
          <h2 className="text-xl font-semibold text-white mb-4">
            Search Results
          </h2>
        )}

        <div className="overflow-y-auto space-y-2.5">
          {combinedBooks.length === 0 ? (
            <p className="text-gray-400">No books found.</p>
          ) : (
            combinedBooks.map((item, index) => (
              <button
                key={`${item.source}-${index}`}
                className="relative w-full text-left p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-600/40 transition flex gap-5"
                onClick={() => onClickedBook(item.book)}
              >
                {/* SOURCE */}
                <div className="absolute right-2 bottom-1.5 text-xs text-gray-500">
                  {item.source}
                </div>
                {/* COVER */}
                <div className="w-12.5 h-18">
                  {item.source === "OpenLib" &&
                  (item.book as OpenLibData).edition_key !== undefined ? (
                    <Image
                      src={getCoverUrl(
                        (item.book as OpenLibData).edition_key?.at(0)
                      )}
                      alt={item.book.title || "Untitled"}
                      width={50}
                      height={75}
                      className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                    />
                  ) : item.source === "GoogleB" &&
                    (item.book as GoogleBooks).cover_url ? (
                    <Image
                      src={(item.book as GoogleBooks).cover_url!}
                      alt={item.book.title || "Untitled"}
                      width={50}
                      height={75}
                      className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                  )}
                </div>
                {/* DETAILS */}
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-zinc-100 truncate max-w-132">
                    {item.book.title}
                  </span>
                  {item.book.author_name &&
                    item.book.author_name.length > 0 && (
                      <span className="text-sm text-gray-400 truncate max-w-135">
                        {item.book.author_name.join(", ")}
                      </span>
                    )}
                  {item.book.first_publish_year && (
                    <span className="text-xs text-gray-500 truncate max-w-135">
                      First published: {item.book.first_publish_year}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
