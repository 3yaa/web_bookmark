import { pool } from "../../config/db.js";

export const getBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query("SELECT * FROM books WHERE user_id=$1", [
      userId,
    ]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching books: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message,
    });
  }
};

export const getBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM books WHERE id=$1 AND user_id=$2`,
      [bookId, userId]
    );

    // if no book were found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching book: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching book",
      error: error.message,
    });
  }
};

export const patchBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    // breaks all the keys into key=$i
    const setClause = Object.keys(updates)
      .map((key, index) => {
        const columnName = key;
        return `${columnName}=$${index + 1}`;
      })
      .join(", ");
    // gets all the values of the keys
    const values = Object.values(updates);
    values.push(bookId);
    values.push(userId);

    const query = `
	 	UPDATE books
		SET ${setClause} WHERE id=$${values.length - 1} AND user_id=$${
      values.length
    } RETURNING * 
	  `;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating book: ", error);
    res.status(500).json({
      success: false,
      message: "Error updating book",
      error: error.message,
    });
  }
};

// NEED TO VALIDATE NON-NULLABLE DATA
export const createBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      author,
      cover_url,
      cover_editions,
      cur_cover_index,
      date_published,
      series_title,
      place_in_series,
      prequel,
      sequel,
      status,
      score,
      dateCompleted,
      note,
      key,
    } = req.body;

    const query = `
    INSERT INTO books (
      title,
      author,  
      cover_url,
      cover_editions,
      cur_cover_index,
      date_published,
      series_title,
      place_in_series,
      prequel,
      sequel,
      status,
      score,
      date_completed,
      note,
      date_created,
      key,
      user_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, $15, $16
    ) RETURNING *
	`;
    const values = [
      title,
      author,
      cover_url,
      cover_editions,
      cur_cover_index,
      date_published,
      series_title,
      place_in_series,
      prequel,
      sequel,
      status,
      score,
      dateCompleted,
      note,
      key,
      userId,
    ];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Book Created Successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating book: ", error);
    res.status(500).json({
      success: false,
      message: "Error creating book",
      error: error.message,
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    // delete book
    const result = await pool.query(
      "DELETE FROM books WHERE id=$1 AND user_id=$2 RETURNING *",
      [bookId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting book: ", error);

    // Handle foreign key constraints
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book because it is referenced by other records",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};
