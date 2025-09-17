export const validateShowsAPI = (req, res, next) => {
  const { title, year } = req.query;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title parameter is required",
    });
  }

  req.query.title = title.trim();
  req.query.limit = parseInt(year);

  next();
};

export const validateTMDBIdAPI = (req, res, next) => {
  const tmdbId = req.query.tmdbId;

  if (!tmdbId) {
    return res.status(400).json({
      success: false,
      message: "tmdb id required",
    });
  }

  next();
};
