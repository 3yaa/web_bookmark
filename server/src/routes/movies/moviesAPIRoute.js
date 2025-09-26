import express from "express";
import { useOmdbAPI } from "../../controllers/movies/omdbAPI.js";
import { useTmdbAPI } from "../../controllers/movies/tmdbAPI.js";
import { useWikidataAPI } from "../../controllers/movies/wikidataAPI.js";
import {
  validateMoviesAPI,
  validateImdbIdAPI,
} from "../../middleware/movies/validateMoviesAPI.js";

const moviesAPIRouter = express.Router();

moviesAPIRouter.get("/omdb", validateMoviesAPI, useOmdbAPI);
moviesAPIRouter.get("/tmdb", validateImdbIdAPI, useTmdbAPI);
moviesAPIRouter.get("/wikidata", validateImdbIdAPI, useWikidataAPI);

export { moviesAPIRouter };
