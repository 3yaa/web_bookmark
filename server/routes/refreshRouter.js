import express from "express";
import { refreshToken } from "../controllers/refreshTokenController.js";
import { validateRefreshTokenCookie } from "../middleware/validateAuth.js";

const refreshRouter = express.Router();

refreshRouter.get("/", validateRefreshTokenCookie, refreshToken);

export { refreshRouter };
