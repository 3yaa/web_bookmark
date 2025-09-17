import express from "express";
import { useOMDbAPI } from "../controllers/movies/movieOMDb.js";
import { useTMDBAPI } from "../controllers/movies/movieTMDB.js";
import { useWikidataAPI } from "../controllers/movies/movieWikidata.js";
import {
  validateMoviesAPI,
  validateImdbIdAPI,
} from "../middleware/validateMoviesAPI.js";

const externalMoviesAPIRouter = express.Router();

externalMoviesAPIRouter.get("/omdb", validateMoviesAPI, useOMDbAPI);
externalMoviesAPIRouter.get("/tmdb", validateImdbIdAPI, useTMDBAPI);
externalMoviesAPIRouter.get("/wikidata", validateImdbIdAPI, useWikidataAPI);

export { externalMoviesAPIRouter };
