import dotenv from "dotenv";

dotenv.config();

export async function useGoogleBooksAPI(req, res) {
  try {
    const { query, limit } = req.query;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=${limit}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    // make call
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Google Books API error: ${response.statusText}`,
        error: `Google Books API failure`,
      });
    }
    // data clean up
    const data = await response.json();
    const books = data.items || [];
    const processedBooks = books.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      return {
        id: item.id,
        title: volumeInfo.title,
        author_name: volumeInfo.authors,
        first_publish_year: volumeInfo.publishedDate
          ? parseInt(volumeInfo.publishedDate.split("-")[0])
          : undefined,
        cover_url:
          volumeInfo.imageLinks?.thumbnail ||
          volumeInfo.imageLinks?.smallThumbnail ||
          "",
      };
    });
    //
    res.status(200).json({
      success: true,
      count: processedBooks.length,
      data: processedBooks,
    });
  } catch (error) {
    console.error("GoogleBooks fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book from Google Books",
      error: error.message,
    });
  }
}
