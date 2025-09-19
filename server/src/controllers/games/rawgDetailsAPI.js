import dotenv from "dotenv";

dotenv.config();

export async function useRawgDetailsAPI(req, res) {
  try {
    const rawgId = req.query.rawgId;
    const url = `https://api.rawg.io/api/games/${rawgId}?key=${process.env.RAWG_API_KEY}`;
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
    const game = data || {};
    const processedGames = {
      released: game.released,
      background_image: game.background_image,
      background_image_additional: game.background_image_additional,
      developers: game.developers
        ? game.developers.map((developer) => {
            return {
              name: developer.name,
              image_background: developer.image_background,
            };
          })
        : [],
    };
    //
    res.status(200).json({
      success: true,
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
