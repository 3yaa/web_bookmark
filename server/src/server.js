import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
//
import { corsOptions } from "./config/cors.js";
//
import { registerRouter } from "./routes/registerRouter.js";
import { refreshRouter } from "./routes/refreshRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { logoutRouter } from "./routes/logoutRouter.js";
import { verifyJWT } from "./middleware/validateJWT.js";
//
import { booksRouter } from "./routes/booksRoute.js";
import { externalBooksAPIRouter } from "./routes/externalBooksAPIRouter.js";
const app = express();
const PORT = process.env.PORT || 3000;

// cors
app.use(cors(corsOptions));

// built in: body parser middleware
app.use(express.json());
// built in: cookies middleware
app.use(cookieParser());

// auth router
app.use("/register", registerRouter);
app.use("/auth", authRouter);
app.use("/refresh", refreshRouter);
app.use("/logout", logoutRouter);

// auth
app.use(verifyJWT);

// books api routers
app.use("/books-api", externalBooksAPIRouter);
app.use("/books", booksRouter);

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});

// render health check endpoint
// app.get("/healthz", (_, res) => {
// res.status(200).json({ status: "OK", message: "Server is running" });
// });
