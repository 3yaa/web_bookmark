export const validateMoviesAPI = (req, res, next) => {
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

export const validateImdbIdAPI = (req, res, next) => {
  const imdbId = req.query.imdbId;

  if (!imdbId) {
    return res.status(400).json({
      success: false,
      message: "imdb id required",
    });
  }

  next();
};
