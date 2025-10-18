import express from "express";
import {
  getRandomBooks,
  getBooks,
  getBook,
  patchBook,
  createBook,
  deleteBook,
} from "../../controllers/books/bookControllers.js";
import {
  validateBookId,
  validateBookData,
  validateBookPatch,
  validateBookCreate,
} from "../../middleware/books/validateBooks.js";

const booksRouter = express.Router();

booksRouter.get("/random", getRandomBooks);
booksRouter.get("/", getBooks);
booksRouter.get("/:id", validateBookId, getBook);
booksRouter.post("/", validateBookCreate, validateBookData, createBook);
booksRouter.patch(
  "/:id",
  validateBookId,
  validateBookData,
  validateBookPatch,
  patchBook
);
booksRouter.delete("/:id", validateBookId, deleteBook);

export { booksRouter };
