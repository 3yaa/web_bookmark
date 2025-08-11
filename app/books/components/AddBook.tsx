"use client";
import { useState } from "react";
import { Books } from "@/types/media";

export function AddBook({
  isOpen,
  onClose,
  onAddBook,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Books) => void;
}) {
  const [newBook, setNewBook] = useState<Omit<Books, "id">>({
    name: "",
    maker: "",
    picture: "",
    yearCompleted: "",
    myStatus: "Want to Read",
    rating: "",
  });

  if (!isOpen) return null;

  const handleAddBook = () => {
    const bookToAdd: Books = {
      ...newBook,
      id: Date.now(),
    };
    //add new book to local storage for now
    onAddBook(bookToAdd);
    ResetBook();
    onClose();
  };

  const ResetBook = () => {
    setNewBook({
      name: "",
      maker: "",
      picture: "",
      yearCompleted: "",
      myStatus: "Want to Read",
      rating: "",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 shadow-lg min-w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Add New Book</h2>
          <input
            type="text"
            placeholder="Book Name"
            value={newBook.name}
            onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.maker}
            onChange={(e) => setNewBook({ ...newBook, maker: e.target.value })}
          />
          <input
            type="number"
            min="1"
            max="11"
            placeholder="Score"
            value={newBook.rating}
            onChange={(e) =>
              setNewBook({
                ...newBook,
                rating: parseInt(e.target.value),
              })
            }
          />
          <select
            value={newBook.myStatus}
            onChange={(e) =>
              setNewBook({
                ...newBook,
                myStatus: (e.target.value as "Completed") || "Want to Read",
              })
            }
          >
            <option value="Want to Read">Want to Read</option>
            <option value="Completed">Completed</option>
          </select>
          <button onClick={handleAddBook}>Add button</button>
        </div>
      </div>
    </>
  );
}
