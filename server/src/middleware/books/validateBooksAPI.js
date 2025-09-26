export const validateBooksAPI = (req, res, next) => {
  const { query, title, limit } = req.query;

  if (!title || !query) {
    return res.status(400).json({
      success: false,
      message: "title/query parameter is required",
    });
  }

  if (!limit) {
    return res.status(400).json({
      success: false,
      message: "limit parameter is required",
    });
  }

  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum <= 0) {
    return res.status(400).json({
      success: false,
      message: "limit must be a positive integer",
    });
  }

  if (limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: "limit cannot exceed 100",
    });
  }

  req.query.query = query.trim();
  req.query.title = title.trim();
  req.query.limit = parseInt(limit);

  next();
};

export const validateSeriesAPI = (req, res, next) => {
  const openLibraryID = req.query.openLibraryID;

  if (!openLibraryID) {
    return res.status(400).json({
      success: false,
      message: "open library id required",
    });
  }

  next();
};
