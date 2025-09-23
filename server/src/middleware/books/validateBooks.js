const MAX_SCORE = 11;
const MAX_NOTE_LENGTH = 1000;
const MAX_COVER_EDITIONS = 15;
const VALID_STATUSES = ["Want to Read", "Completed", "Dropped"];

export const validateBookId = (req, res, next) => {
  const bookId = req.params.id;

  if (!bookId || isNaN(bookId) || parseInt(bookId) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid Book ID format",
    });
  }

  req.params.id = parseInt(bookId);
  next();
};

export const validateBookData = (req, res, next) => {
  const { score, note, dateCompleted, curCoverIndex } = req.body;
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
  // for curCoverIndex
  if (curCoverIndex !== undefined) {
    const index = parseInt(curCoverIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid curCoverIndex field provided (must be non-negative integer)",
      });
    }
    req.body.curCoverIndex = index;
  }

  next();
};

//
export const validateBookPatch = (req, res, next) => {
  const updates = req.body;
  const allowedFields = ["score", "status", "note", "dateCompleted"];
  // for status
  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status field provided ('Want to Read' | 'Completed' | 'Dropped')",
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

export const validateBookCreate = (req, res, next) => {
  const { title, coverEditions, datePublished, status, key } = req.body;
  // REQUIRED FIELDS
  // title
  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "No title to create book",
    });
  }
  // key
  if (!key) {
    return res.status(400).json({
      success: false,
      message: "No key (ol|google) to create book",
    });
  }
  // status
  if (!status) {
    req.body.status = "Want to Read";
  } else {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status provided ('Want to Read' | 'Completed' | 'Dropped')",
      });
    }
  }
  // NON REQUIRED
  // date published
  if (
    datePublished &&
    (typeof datePublished !== "number" ||
      !Number.isInteger(datePublished) ||
      datePublished < 1000 ||
      datePublished > 9999)
  ) {
    return res.status(400).json({
      success: false,
      message: "Date published must be a 4-digit year (e.g., 2001)",
    });
  }

  next();
};
