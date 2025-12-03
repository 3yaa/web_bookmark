import { OpenLibraryProps } from "@/types/book";
import { X, DiamondPlus } from "lucide-react";
import Image from "next/image";
import { Loading } from "@/app/components/ui/Loading";

interface MultSearchProps {
  isOpen: boolean;
  onClose: (action: "manualAdd" | null) => void;
  prompt: string;
  books: OpenLibraryProps[];
  onClickedBook: (book: OpenLibraryProps) => void;
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

  console.log(books.forEach((book) => console.log(book.cover_urls?.[0])));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-x-hidden">
      {/* Modal content */}
      <div className="relative bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        {isLoading && (
          <Loading
            customStyle={"border-emerald-400 h-8 w-8"}
            text="Searching..."
          />
        )}
        {/* ACTION BUTTON */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* ADD */}
          <button
            className="hidden lg:block py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
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
          {books.length === 0 ? (
            <p className="text-gray-400">No books found.</p>
          ) : (
            books.map((book, index) => (
              <button
                key={`${book.key}-${index}`}
                className="relative w-full text-left p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-600/40 transition flex gap-5 hover:cursor-pointer"
                onClick={() => onClickedBook(book)}
              >
                {/* COVER */}
                <div className="w-12.5 h-18 flex-shrink-0">
                  {book.cover_urls && book.cover_urls[0] ? (
                    <Image
                      src={book.cover_urls[0]}
                      alt={book.title || "Untitled"}
                      width={248}
                      height={372}
                      onClick={() => {
                        if (book.cover_urls) {
                          console.log(book.cover_urls[0]);
                        }
                      }}
                      className="w-full h-full object-fill rounded-[0.25rem] border border-zinc-600/30"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-[0.25rem] border border-zinc-600/30"></div>
                  )}
                </div>
                {/* DETAILS */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-lg font-medium text-zinc-100 truncate">
                    {book.title || "Untitled"}
                  </span>
                  {book.author_name && book.author_name.length > 0 ? (
                    <span className="text-sm text-gray-400 truncate max-w-135">
                      {book.author_name.join(", ")}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 truncate max-w-135">
                      Unknown Author
                    </span>
                  )}
                  {book.first_publish_year ? (
                    <span className="text-xs text-gray-500 truncate max-w-135">
                      First published: ({book.first_publish_year})
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 truncate max-w-135">
                      First published: (Unknown)
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
