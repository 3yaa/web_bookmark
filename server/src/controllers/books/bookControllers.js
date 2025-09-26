import { pool } from "../../config/db.js";

const convertBookToCamelCase = (book) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  coverUrl: book.cover_url,
  datePublished: book.date_published,
  seriesTitle: book.series_title,
  placeInSeries: book.place_in_series,
  prequel: book.prequel,
  sequel: book.sequel,
  status: book.status,
  score: book.score,
  dateCompleted: book.date_completed,
  note: book.note,
  dateCreated: book.date_created,
  key: book.key,
  userId: book.user_id,
});

export const getRandomBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT * FROM books
      WHERE user_id=$1 AND status='Want to Read'
      ORDER BY RANDOM()
      LIMIT 10
      `,
      [userId]
    );

    const convertedBooks = result.rows.map(convertBookToCamelCase);

    res.json({
      success: true,
      data: convertedBooks,
    });
  } catch (error) {
    console.error("Error fetching random books: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching random books",
      error: error.message,
    });
  }
};

export const getBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT * FROM books 
      WHERE user_id=$1 
      ORDER BY 
        CASE status
          WHEN 'Want to Read' THEN 1
          WHEN 'Completed' THEN 2
          WHEN 'Dropped' THEN 3
          ELSE 4
        END,
        date_created DESC
    `,
      [userId]
    );

    const convertedBooks = result.rows.map(convertBookToCamelCase);

    res.json({
      success: true,
      count: convertedBooks.length,
      data: convertedBooks,
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

    const convertedBook = convertBookToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      data: convertedBook,
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

const camelToSnakeMapping = {
  dateCompleted: "date_completed",
};

export const patchBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    // breaks all the keys into key=$i
    const setClause = Object.keys(updates)
      .map((key, index) => {
        const columnName = camelToSnakeMapping[key] || key;
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

    const convertedBook = convertBookToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: convertedBook,
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
      coverUrl,
      datePublished,
      seriesTitle,
      placeInSeries,
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
      date_published,
      series_title,
      place_in_series,
      prequel,
      sequel,
      status,
      score,
      date_completed,
      note,
      key,
      user_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *
	`;
    const values = [
      title,
      author,
      coverUrl,
      datePublished,
      seriesTitle,
      placeInSeries,
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

    const convertedBook = convertBookToCamelCase(result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Book Created Successfully",
      data: convertedBook,
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

    const convertedBook = convertBookToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: convertedBook,
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
