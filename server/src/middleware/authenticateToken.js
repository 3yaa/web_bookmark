import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  // check if bearer
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid token format. Expected: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token missing",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(403).json({
          success: false,
          message: "Invalid token",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Token verification failed",
        });
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  });
};
