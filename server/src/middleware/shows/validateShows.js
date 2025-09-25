const MAX_SCORE = 11;
const MAX_NOTE_LENGTH = 1000;
const VALID_STATUSES = ["Watching", "Want to Watch", "Completed", "Dropped"];

export const validateShowId = (req, res, next) => {
  const showId = req.params.id;

  if (!showId || isNaN(showId) || parseInt(showId) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid Show ID format",
    });
  }

  req.params.id = parseInt(showId);
  next();
};

export const validateShowData = (req, res, next) => {
  const { score, note, dateCompleted } = req.body;
  // for score
  if (score !== undefined) {
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > MAX_SCORE) {
      return res.status(400).json({
        success: false,
        message: "Invalid score field provided (0-11, integer)",
      });
    }
    req.body.score = parsedScore;
  }
  // for notes
  if (note !== undefined) {
    // Allow null/empty to clear notes
    if (note !== null && typeof note !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid note field provided (must be string or null)",
      });
    }
    if (note && note.length > MAX_NOTE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Invalid note field provided (>1000 characters)",
      });
    }
  }
  // for dateCompleted
  if (dateCompleted !== undefined) {
    // Allow null to clear the date
    if (dateCompleted !== null) {
      const date = new Date(dateCompleted);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dateCompleted field provided (must be valid date or null)",
        });
      }
      // Ensure it's not a future date
      if (date > new Date()) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dateCompleted field provided (cannot be in the future)",
        });
      }
    }
  }

  next();
};

//
export const validateShowPatch = (req, res, next) => {
  const updates = req.body;
  const allowedFields = [
    "score",
    "status",
    "note",
    "dateCompleted",
    "curSeasonIndex",
    "curEpisode",
  ];
  // for status
  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status field provided ('Watching' | 'Want to Watch' | 'Completed' | 'Dropped')",
    });
  }
  // check if exists
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No update field provided",
    });
  }
  // check if allowed
  const invalidFields = Object.keys(updates).filter(
    (field) => !allowedFields.includes(field)
  );
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid update field provided",
    });
  }

  next();
};

export const validateShowCreate = (req, res, next) => {
  const { title, dateReleased, status, tmdbId } = req.body;
  // REQUIRED FIELDS
  // title
  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "No title to create show",
    });
  }
  // tmdbId
  if (!tmdbId) {
    return res.status(400).json({
      success: false,
      message: "No tmdbId to create show",
    });
  }
  // status
  if (!status) {
    req.body.status = "Want to Watch";
  } else {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status provided ('Watching' | 'Want to Watch' | 'Completed' | 'Dropped')",
      });
    }
  }
  // NON REQUIRED
  // date published
  if (dateReleased !== undefined) {
    const parsedYear = parseInt(dateReleased);
    if (
      isNaN(parsedYear) ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 1000 ||
      parsedYear > 9999
    ) {
      return res.status(400).json({
        success: false,
        message: "Date released must be a 4-digit year (e.g., 2001)",
      });
    }
    req.body.dateReleased = parsedYear;
  }

  next();
};
