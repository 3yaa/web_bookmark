import { pool } from "../../config/db.js";

const convertMovieToCamelCase = (movie) => ({
  id: movie.id,
  dateCreated: movie.date_created,
  title: movie.title,
  director: movie.director,
  posterUrl: movie.poster_url,
  backdropUrl: movie.backdrop_url,
  dateReleased: movie.date_released,
  seriesTitle: movie.series_title,
  placeInSeries: movie.place_in_series,
  prequel: movie.prequel,
  sequel: movie.sequel,
  status: movie.status,
  score: movie.score,
  dateCompleted: movie.date_completed,
  note: movie.note,
  imdbId: movie.imdb_id,
  userId: movie.user_id,
});

export const getRandomMovies = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT * FROM movies
      WHERE user_id=$1 AND status='Want to Watch'
      ORDER BY RANDOM()
      LIMIT 10
      `,
      [userId]
    );

    const convertedMovies = result.rows.map(convertMovieToCamelCase);

    res.json({
      success: true,
      data: convertedMovies,
    });
  } catch (error) {
    console.error("Error fetching random movies: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching random movies",
      error: error.message,
    });
  }
};

export const getMovies = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
			SELECT * FROM movies 
			WHERE user_id=$1 
			ORDER BY
				CASE status
					WHEN 'Want to Watch' THEN 1
					WHEN 'Completed' THEN 2
					WHEN 'Dropped' THEN 3
					ELSE 4
				END,
				date_created DESC
		`,
      [userId]
    );

    const convertedMovie = result.rows.map(convertMovieToCamelCase);

    res.json({
      success: true,
      count: convertedMovie.length,
      data: convertedMovie,
    });
  } catch (error) {
    console.error("Error fetching movies: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching movies",
      error: error.message,
    });
  }
};

export const getMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM movies WHERE id=$1 AND user_id=$2`,
      [movieId, userId]
    );

    // if no movie were found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const convertedMovie = convertMovieToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      data: convertedMovie,
    });
  } catch (error) {
    console.error("Error fetching movie: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching movie",
      error: error.message,
    });
  }
};

const camelToSnakeMapping = {
  dateCompleted: "date_completed",
};

export const patchMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
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
    values.push(movieId);
    values.push(userId);

    const query = `
		UPDATE movies
		SET ${setClause} WHERE id=$${values.length - 1} AND user_id=$${
      values.length
    } RETURNING * 
		`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const convertedMovie = convertMovieToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: convertedMovie,
    });
  } catch (error) {
    console.error("Error updating movie: ", error);
    res.status(500).json({
      success: false,
      message: "Error updating movie",
      error: error.message,
    });
  }
};

// NEED TO VALIDATE NON-NULLABLE DATA
export const createMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      director,
      posterUrl,
      backdropUrl,
      dateReleased,
      seriesTitle,
      placeInSeries,
      prequel,
      sequel,
      status,
      score,
      dateCompleted,
      note,
      imdbId,
    } = req.body;

    const query = `
		INSERT INTO movies (
			date_created,
			title,
			director,  
			poster_url,
			backdrop_url,
			date_released,
			series_title,
			place_in_series,
			prequel,
			sequel,
			status,
			score,
			date_completed,
			note,
			imdb_id,
			user_id
		) VALUES (
			CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		) RETURNING *
	`;
    const values = [
      title,
      director,
      posterUrl,
      backdropUrl,
      dateReleased,
      seriesTitle,
      placeInSeries,
      prequel,
      sequel,
      status,
      score,
      dateCompleted,
      note,
      imdbId,
      userId,
    ];
    const result = await pool.query(query, values);

    const convertedMovie = convertMovieToCamelCase(result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Movie Created Successfully",
      data: convertedMovie,
    });
  } catch (error) {
    console.error("Error creating movie: ", error);
    res.status(500).json({
      success: false,
      message: "Error creating movie",
      error: error.message,
    });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user.id;

    // delete movie
    const result = await pool.query(
      "DELETE FROM movies WHERE id=$1 AND user_id=$2 RETURNING *",
      [movieId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const convertedMovie = convertMovieToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      data: convertedMovie,
    });
  } catch (error) {
    console.error("Error deleting movie: ", error);

    // Handle foreign key constraints
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete movie because it is referenced by other records",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting movie",
      error: error.message,
    });
  }
};
