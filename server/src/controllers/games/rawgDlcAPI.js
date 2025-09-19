import dotenv from "dotenv";

dotenv.config();

export async function useRawgDlcAPI(req, res) {
  try {
    const rawgId = req.body.rawgId;
    const url = `https://api.rawg.io/api/games/${rawgId}/additions?key=${process.env.RAWG_API_KEY}`;
    // call
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        message: `RAWG-DLC API error: ${(await response).statusText}`,
        error: "RAWG-DLC API failure",
      });
    }
    // data clean
    const data = await response.json();
    const dlcs = data.results || [];
    const processedDlcs = dlcs.map((dlc) => {
      return {
        id: dlc.id,
        title: dlc.name,
        released: dlc.released,
        background_image: dlc.background_image,
        short_screenshots: dlc.short_screenshots,
        genre: dlc.genre,
      };
    });
    //
    res.status(200).json({
      success: true,
      count: processedDlcs.length,
      data: processedDlcs,
    });
  } catch (error) {
    console.error("RAWG-DLC fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dlc from RAWG-DLC",
      error: error.message,
    });
  }
}
