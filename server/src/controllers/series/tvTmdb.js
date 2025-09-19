import dotenv from "dotenv";

dotenv.config();

export async function useTmdbTvAPI(req, res) {
  try {
    const tmdbId = req.query.tmdbId;
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`;
    // make call
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `TMDB-TV API error: ${response.statusText}`,
        error: `TMDB-TV API failure`,
      });
    }
    // check if valid
    const show = (await response.json()) || {};
    if (Object.keys(show).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Show not found in TMDB-TV",
        error: "No show results",
      });
    }
    // data clean up
    const processedShow = {
      seasons: show.seasons
        .filter((season) => season.season_number > 0)
        .map((season) => ({
          season_number: season.season_number,
          episode_count: season.episode_count,
          // poster_url: season.poster_path
          //   ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
          //   : null,
        })),
      // created_by: show.created_by.map((created_by) => ({
      //   name: created_by.name,
      // })),
      studio: show.production_companies[0].name,
    };
    //
    res.status(200).json({
      success: true,
      data: processedShow,
    });
  } catch (error) {
    console.error("TMDB-TV fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch show from TMDB-TV",
      error: error.message,
    });
  }
}
