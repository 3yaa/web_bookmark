import { pool } from "../config/db.js";

export const validateRegister = (req, res, next) => {
  const { user, email, pwd } = req.body;
  if (!user || !pwd || !email) {
    return res.status(400).json({
      success: false,
      message: "email, user, and password are required",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, pwd } = req.body;
  if (!pwd || !email) {
    return res.status(400).json({
      success: false,
      message: "email and password are required",
    });
  }

  next();
};

// check email format

export const isEmailDup = async (req, res, next) => {
  try {
    const email = req.body.email;

    const result = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    next();
  } catch (error) {
    console.error("Database error: ", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
