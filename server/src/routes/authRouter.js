import express from "express";
import { loginUser } from "../controllers/authController.js";
import { validateLogin } from "../middleware/validateAuth.js";

const authRouter = express.Router();

authRouter.post("/", validateLogin, loginUser);

export { authRouter };
