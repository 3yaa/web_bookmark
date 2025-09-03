import express from "express";
import { registerUser } from "../controllers/registerController.js";
import { validateRegister, isEmailDup } from "../middleware/validateAuth.js";

const registerRouter = express.Router();

registerRouter.post("/", validateRegister, isEmailDup, registerUser);

export { registerRouter };
