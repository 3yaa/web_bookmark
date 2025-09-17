import express from "express";
import { useTMDBSearchAPI } from "../controllers/series/searchTMDB.js";
import { useTMDBTvAPI } from "../controllers/series/tvTMDB.js";
import {
  validateShowsAPI,
  validateTMDBIdAPI,
} from "../middleware/validateShowsAPI.js";

const externalShowsAPIRouter = express.Router();

externalShowsAPIRouter.get("/tmdb", validateShowsAPI, useTMDBSearchAPI);
externalShowsAPIRouter.get("/tmdb-tv", validateTMDBIdAPI, useTMDBTvAPI);

export { externalShowsAPIRouter };
