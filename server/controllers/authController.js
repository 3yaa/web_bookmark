import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

export const loginUser = async (req, res) => {
  try {
    const { email, pwd } = req.body;

    // Get ALL needed fields from database
    const result = await pool.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const foundUser = result.rows[0];

    // compare password with hash from db
    const match = await bcrypt.compare(pwd, foundUser.password_hash);

    if (match) {
      res.status(200).json({
        success: true,
        message: `User ${foundUser.username} is logged in`,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { user, email, pwd } = req.body;
    const hashedPassword = await bcrypt.hash(pwd, 10);
    //store the user
    const query = `
    INSERT INTO users (
      username,
      email,
      password_hash,
      created_at
    ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;

    const values = [user, email, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `New user ${user} created`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user: ", error);

    // Unique violation
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};
