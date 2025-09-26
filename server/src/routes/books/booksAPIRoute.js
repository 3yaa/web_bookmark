import express from "express";
import { useOpenLibraryAPI } from "../../controllers/books/openLibraryAPI.js";
import { useGoogleBooksAPI } from "../../controllers/books/googleBooksAPI.js";
import { useWikidataAPI } from "../../controllers/books/wikidataAPI.js";
import {
  validateBooksAPI,
  validateSeriesAPI,
} from "../../middleware/books/validateBooksAPI.js";

const booksAPIRouter = express.Router();

booksAPIRouter.get(
  "/open-library",

  useOpenLibraryAPI
);
booksAPIRouter.get("/google-books", validateBooksAPI, useGoogleBooksAPI);
booksAPIRouter.get("/wikidata", validateSeriesAPI, useWikidataAPI);

export { booksAPIRouter };
