import dotenv from "dotenv";

dotenv.config();

export async function useOMDbAPI(req, res) {
  try {
    const { title, year } = req.query;
    const url = `http://www.omdbapi.com/?apikey=${
      process.env.OMDB_API_KEY
    }&t=${encodeURIComponent(title)}&y=${year}`;
    // make call
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `OMDb API error: ${response.statusText}`,
        error: `OMDb API failure`,
      });
    }
    // check if valid
    const movie = await response.json();
    if (movie.Response === "False") {
      return res.status(404).json({
        success: false,
        message: movie.Error || "Movie not found",
        error: "OMDb API error",
      });
    }
    // data clean up
    const processedMovie = {
      imdbId: movie.imdbID,
      title: movie.Title,
      director: movie.Director,
      released_date: movie.Year,
      lead_actors: movie.Actors,
      awards: movie.Awards,
      imdbRating: movie.imdbRating,
      imdbVotes: movie.imdbVotes,
      genre: movie.Genre,
    };
    //
    res.status(200).json({
      success: true,
      data: processedMovie,
    });
  } catch (error) {
    console.error("OMDb fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch movie from OMDb",
      error: error.message,
    });
  }
}
