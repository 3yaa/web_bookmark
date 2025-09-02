import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
  isEmailDup,
} from "../middleware/validateAuth.js";

const authRouter = express.Router();

authRouter.post("/auth", validateLogin, loginUser);
authRouter.post("/register", validateRegister, isEmailDup, registerUser);

export { authRouter };
