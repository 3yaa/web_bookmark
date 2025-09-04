import express from "express";
import {
  getBooks,
  getBook,
  patchBook,
  createBook,
  deleteBook,
} from "../controllers/bookControllers.js";
import {
  validateBookId,
  validateBookPatch,
  validateBookCreate,
} from "../middleware/validateBooks.js";

const booksRouter = express.Router();

booksRouter.get("/", getBooks);
booksRouter.get("/:id", validateBookId, getBook);
booksRouter.post("/", validateBookCreate, createBook);
booksRouter.patch("/:id", validateBookId, validateBookPatch, patchBook);
booksRouter.delete("/:id", validateBookId, deleteBook);

export { booksRouter };
