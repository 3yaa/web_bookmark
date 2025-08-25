import { OpenLibData } from "@/types/books";

interface MultSearchProps {
  isOpen: boolean;
  onClose: () => void;
  books: OpenLibData[]; // ✅ must be array
  onClickedBook: (book: OpenLibData) => void;
}

export function ShowMultBooks({
  isOpen,
  onClose,
  books,
  onClickedBook,
}: MultSearchProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Overlay (click to close) */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Search Results
        </h2>

        <div className="overflow-y-auto space-y-3 pr-2">
          {books.length === 0 ? (
            <p className="text-gray-400">No books found.</p>
          ) : (
            books.map((book) => (
              <button
                key={book.key}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/60 hover:bg-amber-600/20 transition flex flex-col gap-1"
                onClick={() => onClickedBook(book)}
              >
                <span className="text-lg font-medium text-zinc-100">
                  {book.title}
                </span>
                {book.author_name && book.author_name.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {book.author_name.join(", ")}
                  </span>
                )}
                {book.first_publish_year && (
                  <span className="text-xs text-gray-500">
                    First published: {book.first_publish_year}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// {booksFromOpenLib.length > 0 && (
//   <>
//     <div className="flex-1 overflow-auto max-h-96 space-y-3 border-t border-zinc-800 pt-4">
//       {booksFromOpenLib.map((book, i) => (
//         <div
//           key={i}
//           onClick={() => console.log("Selected book:", book)}
//           className="flex gap-3 p-2 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
//         >
//           {/* COVER */}
//           <div className="w-12 h-16 bg-zinc-700 rounded flex-shrink-0 overflow-hidden">
//             {book.cover_edition_key ? (
//               <Image
//                 src={getCoverUrl(book.cover_edition_key)}
//                 alt={book.title}
//                 width={50}
//                 height={68}
//                 className="object-cover rounded-md border border-zinc-600/30"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <Book className="w-4 h-4 text-zinc-500" />
//               </div>
//             )}
//           </div>

//           {/* DETAILS */}
//           <div className="flex-1 min-w-0">
//             <h3 className="font-medium text-zinc-100 truncate">
//               {book.title}
//             </h3>
//             <p className="flex gap-2 items-center text-sm text-zinc-400 truncate">
//               {Array.isArray(book.author_name)
//                 ? book.author_name.join(", ")
//                 : book.author_name}
//               {book.first_publish_year && (
//                 <span className="text-xs text-zinc-500 mt-0.5">
//                   Published: {book.first_publish_year}
//                 </span>
//               )}
//             </p>

//             {book.subject && book.subject.length > 0 && (
//               <p className="text-xs text-zinc-500 truncate">
//                 Genres: {book.subject.slice(0, 3).join(", ")}
//                 {book.subject.length > 3 ? "..." : ""}
//               </p>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//     <div key="cancel" className="flex gap-3 pt-2">
//       <button
//         onClick={onClose}
//         className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 transition-all duration-200"
//       >
//         Cancel
//       </button>
//     </div>
//   </>
// )}
