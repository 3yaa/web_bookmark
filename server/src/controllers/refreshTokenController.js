import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../../src/config/db.js";

dotenv.config();

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // get user by hashed refresh token
    const result = await pool.query(
      "SELECT id, username, email, refresh_token_expires FROM users WHERE refresh_token_hash = $1",
      [hashedToken]
    );

    // forbidden
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const foundUser = result.rows[0];

    const dateNow = new Date();
    // IF REFRESH TOKEN HAS EXPIRED
    if (new Date(foundUser.refresh_token_expires) < dateNow) {
      await pool.query(
        "UPDATE users SET refresh_token_hash = NULL, refresh_token_expires = NULL WHERE id = $1",
        [foundUser.id]
      );
      return res.status(403).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    // gen new access token
    const accessToken = jwt.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Error Refresh token: ", error);
    res.status(500).json({
      success: false,
      message: "Error refresh token",
      error: error.message,
    });
  }
};
