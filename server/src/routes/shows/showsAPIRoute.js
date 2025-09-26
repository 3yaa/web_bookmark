import express from "express";
import { useTmdbSearchAPI } from "../../controllers/shows/searchTmdbAPI.js";
import { useTmdbTvAPI } from "../../controllers/shows/tvTmdbAPI.js";
import {
  validateShowsAPI,
  validateTMDBIdAPI,
} from "../../middleware/shows/validateShowsAPI.js";

const showsAPIRouter = express.Router();

showsAPIRouter.get("/tmdb", validateShowsAPI, useTmdbSearchAPI);
showsAPIRouter.get("/tmdb-tv", validateTMDBIdAPI, useTmdbTvAPI);

export { showsAPIRouter };
