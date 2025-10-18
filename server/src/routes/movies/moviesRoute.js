import express from "express";
import {
  getRandomMovies,
  getMovies,
  getMovie,
  patchMovie,
  createMovie,
  deleteMovie,
} from "../../controllers/movies/movieController.js";
import {
  validateMovieId,
  validateMovieData,
  validateMoviePatch,
  validateMovieCreate,
} from "../../middleware/movies/validateMovies.js";

const moviesRouter = express.Router();

moviesRouter.get("/random", getRandomMovies);
moviesRouter.get("/", getMovies);
moviesRouter.get("/:id", validateMovieId, getMovie);
moviesRouter.post("/", validateMovieCreate, validateMovieData, createMovie);
moviesRouter.patch(
  "/:id",
  validateMovieId,
  validateMovieData,
  validateMoviePatch,
  patchMovie
);
moviesRouter.delete("/:id", validateMovieId, deleteMovie);

export { moviesRouter };
