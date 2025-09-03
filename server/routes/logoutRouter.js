import express from "express";
import { logoutUser } from "../controllers/logoutController.js";

const logoutRouter = express.Router();

logoutRouter.get("/", logoutUser);

export { logoutRouter };
