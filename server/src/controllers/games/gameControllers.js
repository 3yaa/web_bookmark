import { pool } from "../../config/db.js";

const convertGameToCamelCase = (game) => ({
  id: game.id,
  dateCreated: game.date_created,
  title: game.title,
  studio: game.studio,
  posterUrl: game.poster_url,
  backdropUrl: game.backdrop_url,
  dateReleased: game.date_released,
  mainTitle: game.main_title,
  dlcIndex: game.dlc_index,
  dlcs: game.dlcs,
  status: game.status,
  score: game.score,
  dateCompleted: game.date_completed,
  note: game.note,
  igdbId: game.igdb_id,
  userId: game.user_id,
});

export const getRandomGames = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT * FROM games
      WHERE user_id=$1 AND status='Playing'
      ORDER BY RANDOM()
      LIMIT 10
      `,
      [userId]
    );

    const convertedGames = result.rows.map(convertGameToCamelCase);

    res.json({
      success: true,
      data: convertedGames,
    });
  } catch (error) {
    console.error("Error fetching random games: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching random games",
      error: error.message,
    });
  }
};

export const getGames = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
			SELECT * FROM games 
			WHERE user_id=$1 
			ORDER BY 
				CASE status
					WHEN 'Playing' THEN 1
					WHEN 'Completed' THEN 2
					WHEN 'Dropped' THEN 3
					ELSE 4
				END,
				date_created DESC
		`,
      [userId]
    );

    const convertedGames = result.rows.map(convertGameToCamelCase);

    res.json({
      success: true,
      count: convertedGames.length,
      data: convertedGames,
    });
  } catch (error) {
    console.error("Error fetching games: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching games",
      error: error.message,
    });
  }
};

export const getGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM games WHERE id=$1 AND user_id=$2`,
      [gameId, userId]
    );

    // if no game were found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const convertedGame = convertGameToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      data: convertedGame,
    });
  } catch (error) {
    console.error("Error fetching game: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game",
      error: error.message,
    });
  }
};

const camelToSnakeMapping = {
  dateCompleted: "date_completed",
};

export const patchGame = async (req, res) => {
  try {
    const gameId = req.params.id;
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
    values.push(gameId);
    values.push(userId);

    const query = `
		UPDATE games
		SET ${setClause} WHERE id=$${values.length - 1} AND user_id=$${
      values.length
    } RETURNING * 
		`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const convertedGame = convertGameToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Game updated successfully",
      data: convertedGame,
    });
  } catch (error) {
    console.error("Error updating game: ", error);
    res.status(500).json({
      success: false,
      message: "Error updating game",
      error: error.message,
    });
  }
};

export const createGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      studio,
      posterUrl,
      backdropUrl,
      dateReleased,
      mainTitle,
      dlcIndex,
      dlcs,
      status,
      score,
      dateCompleted,
      note,
      igdbId,
    } = req.body;

    const query = `
		INSERT INTO games (
  		title,
  		studio,
  		poster_url,
  		backdrop_url,
  		date_released,
  		main_title,
  		dlc_index,
  		dlcs,
  		status,
  		score,
  		date_completed,
  		note,
  		igdb_id,
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
      mainTitle,
      dlcIndex,
      dlcs ? JSON.stringify(dlcs) : null,
      status,
      score,
      dateCompleted,
      note,
      igdbId,
      userId,
    ];
    const result = await pool.query(query, values);

    const convertedGame = convertGameToCamelCase(result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Game Created Successfully",
      data: convertedGame,
    });
  } catch (error) {
    console.error("Error creating game: ", error);
    res.status(500).json({
      success: false,
      message: "Error creating game",
      error: error.message,
    });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;

    // delete game
    const result = await pool.query(
      "DELETE FROM games WHERE id=$1 AND user_id=$2 RETURNING *",
      [gameId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const convertedGame = convertGameToCamelCase(result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Game deleted successfully",
      data: convertedGame,
    });
  } catch (error) {
    console.error("Error deleting game: ", error);

    // Handle foreign key constraints
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete game because it is referenced by other records",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting game",
      error: error.message,
    });
  }
};
