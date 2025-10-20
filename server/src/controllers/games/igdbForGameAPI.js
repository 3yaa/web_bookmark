import { makeIgdbRequestWithRety } from "./igdbInternal/igdbAPI.js";
import { checkDuplicate } from "../../utils/checkDuplicate.js";

export async function useIgdbForGameAPI(req, res) {
  try {
    const { title, limit } = req.query;
    const query = `
      search "${title}";
      fields 
        id, name,
        cover.image_id,
        expansions.id, expansions.name,
        first_release_date,
        involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
        screenshots.image_id;
      limit ${limit};
    `;
    // call
    const response = await makeIgdbRequestWithRety(query);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `IGDB API error: ${response.statusText}`,
        error: "IGDB API failure",
      });
    }
    // data clean
    const data = await response.json();
    const games = data || [];
    const processedGames = games.map((game) => {
      return {
        igdbId: game.id,
        title: game.name,
        released_year: new Date(game.first_release_date * 1000).getFullYear(),
        cover_url: game.cover
          ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
          : null,
        developer: (game.involved_companies || [])
          .filter((company) => company.developer)
          .map((company) => ({ name: company.company.name })),
        expansions: game.expansions,
        screenshot_urls: (game.screenshots || []).map((ss) => ({
          ss_url: `https://images.igdb.com/igdb/image/upload/t_1080p/${ss.image_id}.jpg`,
        })),
      };
    });
    // check for duplicate
    for (const game of processedGames) {
      const isDuplicate = await checkDuplicate("games", "igdb_id", game.igdbId);
      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          title: game.title,
          message: `Game "${game.title}" already in your library`,
          error: "Duplicate found",
        });
      }
    }
    //
    res.status(200).json({
      success: true,
      count: processedGames.length,
      data: processedGames,
    });
  } catch (error) {
    console.error("IGDB fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game from IGDB",
      error: error.message,
    });
  }
}
