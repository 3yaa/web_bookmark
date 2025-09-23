import dotenv from "dotenv";
import crypto from "crypto";
import { pool } from "../../src/config/db.js";

dotenv.config();

export const logoutUser = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Get user by hashed refresh token
    const result = await pool.query(
      "SELECT id, username, email, refresh_token_expires FROM users WHERE refresh_token_hash = $1",
      [hashedToken]
    );

    // delete refresh token from db
    if (result.rows.length > 0) {
      const foundUser = result.rows[0];
      await pool.query(
        "UPDATE users SET refresh_token_hash = NULL, refresh_token_expires = NULL WHERE id = $1",
        [foundUser.id]
      );
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error("Error log out: ", error);
    res.status(500).json({
      success: false,
      message: "Error log out",
      error: error.message,
    });
  }
};
