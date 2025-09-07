import bcrypt from "bcrypt";
import { pool } from "../../src/config/db.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    //store the user
    const query = `
		INSERT INTO users (
			username,
			email,
			password_hash,
			created_at
		) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
		`;

    const values = [username, email, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `New user ${username} created`,
      username: result.rows[0],
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
