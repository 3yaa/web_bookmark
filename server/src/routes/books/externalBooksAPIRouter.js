import express from "express";
import { useOpenLibraryAPI } from "../../controllers/books/openLib.js";
import { useGoogleBooksAPI } from "../../controllers/books/googleBooks.js";
import { useWikidataAPI } from "../../controllers/books/wikidata.js";
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
