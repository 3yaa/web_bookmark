import dotenv from "dotenv";
import { checkDuplicate } from "../../utils/checkDuplicate.js";

dotenv.config();

export async function useTmdbSearchAPI(req, res) {
  try {
    const { title, year } = req.query;
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${
      process.env.TMDB_API_KEY
    }&query=${encodeURIComponent(title)}&first_air_date_year=${year}`;
    // make call
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `TMDB API error: ${response.statusText}`,
        error: `TMDB API failure`,
      });
    }
    // check if valid
    const data = await response.json();
    const show = data.results[0] || {};
    // data clean up
    const processedShow = {
      tmdbId: show.id,
      title: show.name,
      released_date: show.first_air_date,
      poster_url: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : null,
      backdrop_url: show.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
        : null,
    };
    // check duplicate
    const isDuplicate = await checkDuplicate(
      "shows",
      "tmdb_id",
      processedShow.tmdbId
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        title: processedShow.title,
        message: `Show "${processedShow.title}" already in your library`,
        error: "Duplicate found",
      });
    }
    //
    res.status(200).json({
      success: true,
      data: processedShow,
    });
  } catch (error) {
    console.error("TMDB fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch series from TMDB",
      error: error.message,
    });
  }
}
