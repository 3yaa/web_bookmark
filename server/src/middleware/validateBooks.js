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

//
export const validateBookPatch = (req, res, next) => {
  const updates = req.body;
  const allowedFields = [
    "score",
    "status",
    "note",
    "dateCompleted",
    "curCoverIndex",
  ];

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
  // for score
  if (updates.score !== undefined) {
    const score = parseInt(updates.score);
    if (isNaN(score) || score < 0 || score > 11) {
      return res.status(400).json({
        success: false,
        message: "Invalid score field provided (0-11, integer)",
      });
    }
    updates.score = score;
  }
  // for status
  if (
    updates.status &&
    updates.status !== "Want to Read" &&
    updates.status !== "Completed" &&
    updates.status !== "Dropped"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status field provided ('Want to Read' | 'Completed' | 'Dropped')",
    });
  }
  // for notes
  if (updates.note !== undefined) {
    // Allow null/empty to clear notes
    if (updates.note !== null && typeof updates.note !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid note field provided (must be string or null)",
      });
    }
    if (updates.note && updates.note.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Invalid note field provided (>1000 characters)",
      });
    }
  }

  const convertedUpdates = { ...updates };

  // for dateCompleted
  if (updates.dateCompleted !== undefined) {
    // Allow null to clear the date
    if (updates.dateCompleted !== null) {
      const date = new Date(updates.dateCompleted);
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
    convertedUpdates.date_completed = updates.dateCompleted;
    delete convertedUpdates.dateCompleted;
  }

  // for curCoverIndex
  if (updates.curCoverIndex !== undefined) {
    const index = parseInt(updates.curCoverIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid curCoverIndex field provided (must be non-negative integer)",
      });
    }
    convertedUpdates.cur_cover_index = index;
    delete convertedUpdates.curCoverIndex;
  }

  next();
};

//
export const validateBookCreate = (req, res, next) => {
  const { title, key, status } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "No title to create book",
    });
  }

  if (!key) {
    return res.status(400).json({
      success: false,
      message: "No key (ol|google) to create book",
    });
  }

  if (!status) {
    req.body.status = "Want to Read";
  } else {
    const validStatuses = ["Want to Read", "Completed", "Dropped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status provided ('Want to Read' | 'Completed' | 'Dropped')",
      });
    }
  }

  next();
};
