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
} from "../middleware/validateBookId.js";

const booksRouter = express.Router();

booksRouter.get("/", getBooks);
booksRouter.get("/:id", validateBookId, getBook);
booksRouter.post("/", validateBookCreate, createBook);
booksRouter.patch("/:id", validateBookId, validateBookPatch, patchBook);
booksRouter.delete("/:id", validateBookId, deleteBook);

export { booksRouter };

/*

{
    "success": true,
    "message": "Book deleted successfully",
    "data": {
        "id": 6,
        "date_created": "2025-09-02T04:09:59.794Z",
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "cover_url": null,
        "cover_editions": null,
        "cur_cover_index": null,
        "date_published": null,
        "series_title": null,
        "place_in_series": null,
        "prequel": "prequel",
        "sequel": "sequel",
        "status": "completed",
        "score": 8,
        "date_completed": null,
        "note": "Amazing fantasy adventure book",
        "key": "234234sa"
    }
}
*/
