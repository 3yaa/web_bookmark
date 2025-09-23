import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    const match = await bcrypt.compare(password, foundUser.password_hash);

    if (match) {
      const accessToken = jwt.sign(
        {
          id: foundUser.id,
          email: foundUser.email,
          username: foundUser.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = crypto.randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // save the refreshtoken to the user in db
      const values = [hashedToken, expiresAt, email];
      await pool.query(
        `UPDATE users 
        SET refresh_token_hash = $1, refresh_token_expires = $2
        WHERE email = $3`,
        values
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }); //should be 30 days
      res.status(200).json({
        success: true,
        message: `User ${foundUser.username} is logged in`,
        accessToken: accessToken,
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
    console.error("Error logging in: ", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};
