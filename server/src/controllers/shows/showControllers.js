import { pool } from "../../config/db.js";

const convertShowToCamelCase = (show) => ({
  id: show.id,
  dateCreated: show.date_created,
  title: show.title,
  studio: show.studio,
  posterUrl: show.poster_url,
  backdropUrl: show.backdrop_url,
  dateReleased: show.date_released,
  seasons: show.seasons,
  curSeasonIndex: show.cur_season_index,
  curEpisode: show.cur_episode,
  status: show.status,
  score: show.score,
  dateCompleted: show.date_completed,
  note: show.note,
  tmdbId: show.tmdb_id,
  userId: show.user_id,
});

export const getRandomShows = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT * FROM shows
      WHERE user_id=$1 AND status='Want to Watch'
      ORDER BY RANDOM()
      LIMIT 10
      `,
      [userId]
    );

    const convertedShows = result.rows.map(convertShowToCamelCase);

    res.json({
      success: true,
      data: convertedShows,
    });
  } catch (error) {
    console.error("Error fetching random shows: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching random shows",
      error: error.message,
    });
  }
};

export const getShows = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
			SELECT * FROM shows 
			WHERE user_id=$1 
			ORDER BY 
				CASE status
					WHEN 'Watching' THEN 1
					WHEN 'Want to Watch' THEN 2
          WHEN 'Completed' THEN 3
					WHEN 'Dropped' THEN 4
					ELSE 4
				END,
				date_created DESC
		`,
      [userId]
    );

    const convertedShows = result.rows.map(convertShowToCamelCase);

    res.json({
      success: true,
      count: convertedShows.length,
      data: convertedShows,
    });
  } catch (error) {
    console.error("Error fetching shows: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shows",
      error: error.message,
    });
  }
};

export const getShow = async (req, res) => {
  try {
    const showId = req.params.id;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM shows WHERE id=$1 AND user_id=$2`,
      [showId, userId]
    );

    // if no show were found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const convertedShow = convertShowToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      data: convertedShow,
    });
  } catch (error) {
    console.error("Error fetching show: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching show",
      error: error.message,
    });
  }
};

const camelToSnakeMapping = {
  curSeasonIndex: "cur_season_index",
  curEpisode: "cur_episode",
  dateCompleted: "date_completed",
};

export const patchShow = async (req, res) => {
  try {
    const showId = req.params.id;
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
    values.push(showId);
    values.push(userId);

    const query = `
		UPDATE shows
		SET ${setClause} WHERE id=$${values.length - 1} AND user_id=$${
      values.length
    } RETURNING * 
		`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const convertedShow = convertShowToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Show updated successfully",
      data: convertedShow,
    });
  } catch (error) {
    console.error("Error updating show: ", error);
    res.status(500).json({
      success: false,
      message: "Error updating show",
      error: error.message,
    });
  }
};

export const createShow = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      studio,
      posterUrl,
      backdropUrl,
      dateReleased,
      seasons,
      curSeasonIndex,
      curEpisode,
      status,
      score,
      dateCompleted,
      note,
      tmdbId,
    } = req.body;

    const query = `
		INSERT INTO shows (
			title,
			studio,
			poster_url,
			backdrop_url,
			date_released,
			seasons,
			cur_season_index,
			cur_episode,
			status,
			score,
			date_completed,
			note,
			tmdb_id,
			user_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		) RETURNING *
	`;
    const values = [
      title,
      studio,
      posterUrl,
      backdropUrl,
      dateReleased,
      seasons ? JSON.stringify(seasons) : null,
      curSeasonIndex,
      curEpisode,
      status,
      score,
      dateCompleted,
      note,
      tmdbId,
      userId,
    ];
    const result = await pool.query(query, values);

    const convertedShow = convertShowToCamelCase(result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Show Created Successfully",
      data: convertedShow,
    });
  } catch (error) {
    console.error("Error creating show: ", error);
    res.status(500).json({
      success: false,
      message: "Error creating show",
      error: error.message,
    });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const showId = req.params.id;
    const userId = req.user.id;

    // delete show
    const result = await pool.query(
      "DELETE FROM shows WHERE id=$1 AND user_id=$2 RETURNING *",
      [showId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const convertedShow = convertShowToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Show deleted successfully",
      data: convertedShow,
    });
  } catch (error) {
    console.error("Error deleting show: ", error);

    // Handle foreign key constraints
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete show because it is referenced by other records",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting show",
      error: error.message,
    });
  }
};
