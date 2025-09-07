export const validateBooksAPI = (req, res, next) => {
  const { query, limit } = req.query;
  if (!query || !limit) {
    return res.status(400).json({
      success: false,
      message: "query and limit required",
    });
  }

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
