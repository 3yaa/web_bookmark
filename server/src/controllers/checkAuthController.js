import { pool } from "../config/db.js";

export const checkAuth = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const result = await pool.query(
      `SELECT id, username, email, refresh_token_expires 
       FROM users 
       WHERE refresh_token_hash = $1 AND refresh_token_expires > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error checking auth: ", error);
    res.status(500).json({
      success: false,
      message: "Error checking auth",
      error: error.message,
    });
  }
};
