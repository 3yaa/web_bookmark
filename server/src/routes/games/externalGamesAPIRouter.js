import express from "express";
import { useIgdbAPI } from "../../controllers/games/igdbAPI.js";
import { validateGameAPI } from "../../middleware/games/validateGamesAPI.js";
const externalGamesAPIRouter = express.Router();

externalGamesAPIRouter.get("/igdb", validateGameAPI, useIgdbAPI);

export { externalGamesAPIRouter };
