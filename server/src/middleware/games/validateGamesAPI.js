export const validateGameAPI = (req, res, next) => {
  const { title, limit } = req.query;
  //
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title parameter is required",
    });
  }
  //
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
  //
  req.query.title = title.trim();
  req.query.limit = parseInt(limit);
  
  next();
};

export const validateIgdbId = (req, res, next) => {
  const igdbId = req.query.igdbId;
  //
  if (!igdbId) {
    return res.status(400).json({
      success: false,
      message: "igdbId parameter is required",
    });
  }
  //
  const idNum = parseInt(igdbId);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({
      success: false,
      message: "igdbId must be a positive integer",
    });
  }
  //
  req.query.igdbId = idNum;
  next();
};
