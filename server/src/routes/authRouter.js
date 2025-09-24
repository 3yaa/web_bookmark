import express from "express";
import { loginUser } from "../controllers/loginController.js";
import { logoutUser } from "../controllers/logoutController.js";
import { checkAuth } from "../controllers/checkAuthController.js";
import { refreshToken } from "../controllers/refreshTokenController.js";
import { registerUser } from "../controllers/registerController.js";
import { validateLogin } from "../middleware/validateAuth.js";
import { validateRefreshTokenCookie } from "../middleware/validateAuth.js";
import { validateRegister, isEmailDup } from "../middleware/validateAuth.js";

const authRouter = express.Router();
// login
authRouter.post("/login", validateLogin, loginUser);
authRouter.get("/logout", logoutUser);
// check auth
authRouter.get("/check", validateRefreshTokenCookie, checkAuth);
authRouter.get("/refresh", validateRefreshTokenCookie, refreshToken);
// register
authRouter.post("/register", validateRegister, isEmailDup, registerUser);

export { authRouter };
