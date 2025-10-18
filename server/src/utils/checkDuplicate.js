import { pool } from "../config/db.js";

// export const checkDuplicate = (tableName, idName) => {
//   return async (req, res, next) => {
//     const id = req.body[idName];
//     const title = req.body.title;

//     try {
//       const result = await pool.query(
//         `
//       SELECT * FROM ${tableName}
//       WHERE ${idName} = $1
//       LIMIT 1
//     `,
//         [id]
//       );

//       if (result.rows.length > 0) {
//         return res.status(409).json({
//           success: false,
//           message: `Book ${title} already in your library`,
//           error: "Duplicate found",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching book to check for duplicate: ", error);
//       res.status(500).json({
//         success: false,
//         message: "Error fetching book to check for duplicate",
//         error: error.message,
//       });
//     }
//     //
//     next();
//   };
// };

export const checkDuplicate = async (tableName, idName, id) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE ${idName} = $1 LIMIT 1`,
      [id]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking for duplicate: ", error);
    throw error;
  }
};
