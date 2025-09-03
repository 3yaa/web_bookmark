import express from "express";
import { refreshToken } from "../controllers/refreshTokenController.js";

const refreshRouter = express.Router();

refreshRouter.get("/", refreshToken);

export { refreshRouter };
