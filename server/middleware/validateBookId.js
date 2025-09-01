export const validateBookId = (req, res, next) => {
  const bookId = req.params.id;

  if (!bookId || isNaN(bookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Book ID format",
    });
  }

  next();
};

//
export const validateBookPatch = (req, res, next) => {
  const updates = req.body;
  const allowedFields = ["score, status, notes"];

  // check if exists
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No update field provided",
    });
  }

  // check if allowed
  const invalidFields = Objects.keys(updates).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid update field provided",
    });
  }
  // for note
  if (updates.score && (updates.score < 0 || updates.score > 11)) {
    return res.status(400).json({
      success: false,
      message: "Invalid score field provided (0-11)",
    });
  }
  // for status
  if (
    updates.status &&
    (updates.status !== "Want to Read" ||
      updates.status !== "Completed" ||
      updates.status !== "Dropped")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status field provided ('Want to Read' | 'Completed' | 'Dropped')",
    });
  }
  // for notes
  if (updates.note && updates.note.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Ivalid note field provide (<500 char)",
    });
  }

  next();
};

//
export const validateBookCreate = (req, res, next) => {
  const title = req.body.title;
  const key = req.body.key;
  const status = req.body.status;

  if (!title) {
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
  }
  next();
};
