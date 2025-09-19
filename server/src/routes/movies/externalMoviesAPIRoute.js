import express from "express";
import { useOmdbAPI } from "../../controllers/movies/omdb.js";
import { useTmdbAPI } from "../../controllers/movies/tmdb.js";
import { useWikidataAPI } from "../../controllers/movies/wikidata.js";
import {
  validateMoviesAPI,
  validateImdbIdAPI,
} from "../../middleware/movies/validateMoviesAPI.js";

const externalMoviesAPIRouter = express.Router();

externalMoviesAPIRouter.get("/omdb", validateMoviesAPI, useOmdbAPI);
externalMoviesAPIRouter.get("/tmdb", validateImdbIdAPI, useTmdbAPI);
externalMoviesAPIRouter.get("/wikidata", validateImdbIdAPI, useWikidataAPI);

export { externalMoviesAPIRouter };
