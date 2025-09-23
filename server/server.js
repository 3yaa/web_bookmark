import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
//
import { corsOptions } from "./src/config/cors.js";
//
import { authRouter } from "./src/routes/authRouter.js";
import { authenticateToken } from "./src/middleware/authenticateToken.js";
//
import { externalBooksAPIRouter } from "./src/routes/books/externalBooksAPIRouter.js";
import { externalMoviesAPIRouter } from "./src/routes/movies/externalMoviesAPIRoute.js";
import { externalShowsAPIRouter } from "./src/routes/shows/externalShowAPIRouter.js";
import { externalGamesAPIRouter } from "./src/routes/games/externalGamesAPIRouter.js";
//
import { booksRouter } from "./src/routes/books/booksRoute.js";
import { moviesRouter } from "./src/routes/movies/moviesRoute.js";
import { showsRouter } from "./src/routes/shows/showRoute.js";
import { gamesRouter } from "./src/routes/games/gamesRoute.js";
const app = express();
const PORT = process.env.PORT || 3000;

// cors
app.use(cors(corsOptions));

// built in: body parser middleware
app.use(express.json());
// built in: cookies middleware
app.use(cookieParser());

// auth router
app.use("/auth", authRouter);

// auth
app.use(authenticateToken);

// books api routers
app.use("/shows-api", externalShowsAPIRouter);
app.use("/movies-api", externalMoviesAPIRouter);
app.use("/books-api", externalBooksAPIRouter);
app.use("/games-api", externalGamesAPIRouter);
app.use("/movies", moviesRouter);
app.use("/shows", showsRouter);
app.use("/books", booksRouter);
app.use("/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});

// render health check endpoint
// app.get("/healthz", (_, res) => {
// res.status(200).json({ status: "OK", message: "Server is running" });
// });
