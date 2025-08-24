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