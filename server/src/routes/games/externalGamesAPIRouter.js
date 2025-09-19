import express from "express";
import { useRawgAPI } from "../../controllers/games/rawgAPI.js";
import { useRawgDlcAPI } from "../../controllers/games/rawgDlcAPI.js";
import {
  validateGameAPI,
  validateRawgIdAPI,
} from "../../middleware/games/validateGamesAPI.js";
const externalGamesAPIRouter = express.Router();

externalGamesAPIRouter.get("/rawg", validateGameAPI, useRawgAPI);
externalGamesAPIRouter.get("/rawg-dlc", validateRawgIdAPI, useRawgDlcAPI);

export { externalGamesAPIRouter };
