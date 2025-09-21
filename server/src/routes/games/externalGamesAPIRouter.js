import express from "express";
import { useIgdbForGameAPI } from "../../controllers/games/igdbForGameAPI.js";
import { useIgdbForDlcAPI } from "../../controllers/games/igdbForDlcAPI.js";
import {
  validateGameAPI,
  validateIgdbId,
} from "../../middleware/games/validateGamesAPI.js";

const externalGamesAPIRouter = express.Router();

externalGamesAPIRouter.get("/igdb", validateGameAPI, useIgdbForGameAPI);
externalGamesAPIRouter.get("/igdb-dlc", validateIgdbId, useIgdbForDlcAPI);

export { externalGamesAPIRouter };
