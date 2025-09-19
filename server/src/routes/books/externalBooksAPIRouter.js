import express from "express";
import { useOpenLibraryAPI } from "../../controllers/books/openLibraryAPI.js";
import { useGoogleBooksAPI } from "../../controllers/books/googleBooksAPI.js";
import { useWikidataAPI } from "../../controllers/books/wikidataAPI.js";
import {
  validateBooksAPI,
  validateSeriesAPI,
} from "../../middleware/books/validateBooksAPI.js";

const externalBooksAPIRouter = express.Router();

externalBooksAPIRouter.get(
  "/open-library",
  validateBooksAPI,
  useOpenLibraryAPI
);
externalBooksAPIRouter.get(
  "/google-books",
  validateBooksAPI,
  useGoogleBooksAPI
);
externalBooksAPIRouter.get(
  "/books-wikidata",
  validateSeriesAPI,
  useWikidataAPI
);

export { externalBooksAPIRouter };
