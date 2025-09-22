import dotenv from "dotenv";

dotenv.config();

export async function useTmdbAPI(req, res) {
  try {
    const imdbId = req.query.imdbId;
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id`;
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
    const movies = data.movie_results || [];
    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in TMDB",
        error: "No movie results",
      });
    }
    // data clean up
    const movie = movies[0];
    const processedMovie = {
      poster_url: movie.poster_path
        ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
        : null,
      backdrop_url: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
    };
    //
    res.status(200).json({
      success: true,
      data: processedMovie,
    });
  } catch (error) {
    console.error("TMDB fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch movie cover from TMDB",
      error: error.message,
    });
  }
}
