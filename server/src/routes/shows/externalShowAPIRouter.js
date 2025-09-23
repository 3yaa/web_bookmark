import express from "express";
import { useTmdbSearchAPI } from "../../controllers/shows/searchTmdbAPI.js";
import { useTmdbTvAPI } from "../../controllers/shows/tvTmdbAPI.js";
import {
  validateShowsAPI,
  validateTMDBIdAPI,
} from "../../middleware/shows/validateShowsAPI.js";

const externalShowsAPIRouter = express.Router();

externalShowsAPIRouter.get("/tmdb", validateShowsAPI, useTmdbSearchAPI);
externalShowsAPIRouter.get("/tmdb-tv", validateTMDBIdAPI, useTmdbTvAPI);

export { externalShowsAPIRouter };
