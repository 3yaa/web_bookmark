import express from "express";
import { useTmdbSearchAPI } from "../../controllers/series/searchTmdb.js";
import { useTmdbTvAPI } from "../../controllers/series/tvTmdb.js";
import {
  validateShowsAPI,
  validateTMDBIdAPI,
} from "../../middleware/shows/validateShowsAPI.js";

const externalShowsAPIRouter = express.Router();

externalShowsAPIRouter.get("/tmdb", validateShowsAPI, useTmdbSearchAPI);
externalShowsAPIRouter.get("/tmdb-tv", validateTMDBIdAPI, useTmdbTvAPI);

export { externalShowsAPIRouter };
