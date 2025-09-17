import dotenv from "dotenv";

dotenv.config();

export async function useTMDBSearchAPI(req, res) {
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
    const shows = data.results || [];
    // data clean up
    const processedShows = shows.map((item) => ({
      id: item.id,
      title: item.name,
      released_date: item.first_air_date,
      poster_url: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      backdrop_url: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : null,
    }));
    //
    res.status(200).json({
      success: true,
      data: processedShows,
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
