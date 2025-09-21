import dotenv from "dotenv";

dotenv.config();

export async function useRawgAPI(req, res) {
  try {
    const { title, limit } = req.query;
    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(
      title
    )}&key=${process.env.RAWG_API_KEY}&page_size=${limit}`;
    // call
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        message: `RAWG API error: ${(await response).statusText}`,
        error: "RAWG API failure",
      });
    }
    // data clean
    const data = await response.json();
    const games = data.results || [];
    const processedGames = games.map((game) => {
      return {
        rawgId: game.id,
        title: game.name,
        // released: game.released,
        // background_image: game.background_image,
        // short_screenshots: game.short_screenshots,
      };
    });
    //
    res.status(200).json({
      success: true,
      count: processedGames.length,
      data: processedGames,
    });
  } catch (error) {
    console.error("RAWG fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game from RAWG",
      error: error.message,
    });
  }
}
