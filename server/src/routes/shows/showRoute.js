import express from "express";
import {
  getShows,
  getShow,
  patchShow,
  createShow,
  deleteShow,
} from "../../controllers/shows/showControllers.js";
import {
  validateShowId,
  validateShowData,
  validateShowPatch,
  validateShowCreate,
} from "../../middleware/shows/validateShows.js";

const showsRouter = express.Router();

showsRouter.get("/", getShows);
showsRouter.get("/:id", validateShowId, getShow);
showsRouter.post("/", validateShowCreate, validateShowData, createShow);
showsRouter.patch(
  "/:id",
  validateShowId,
  validateShowData,
  validateShowPatch,
  patchShow
);
showsRouter.delete("/:id", validateShowId, deleteShow);

export { showsRouter };
