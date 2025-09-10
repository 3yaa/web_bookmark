import express from "express";
import { useOMDbAPI } from "../controllers/movies/omdb.js";
import { useTMDBAPI } from "../controllers/movies/tmdb.js";
import { useWikidataAPI } from "../controllers/movies/wikidata.js";
import {
  validateMoviesAPI,
  validateImdbIdAPI,
} from "../middleware/validateMoviesAPI.js";

const externalMoviesAPIRouter = express.Router();

externalMoviesAPIRouter.get("/omdb", validateMoviesAPI, useOMDbAPI);
externalMoviesAPIRouter.get("/tmdb", validateImdbIdAPI, useTMDBAPI);
externalMoviesAPIRouter.get(
  "/movies-wikidata",
  validateImdbIdAPI,
  useWikidataAPI
);

export { externalMoviesAPIRouter };
