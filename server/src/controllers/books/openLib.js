import dotenv from "dotenv";

dotenv.config();

export async function useOpenLibraryAPI(req, res) {
  try {
    const { query, limit } = req.query;
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&lang=en&fields=key,title,author_name,first_publish_year,subject,edition_key,cover_edition_key&limit=${limit}`;
    const headers = new Headers({
      "User-Agent": `Media Manager/0.3 (${process.env.PAGE_CONTACT})`,
    });
    const options = {
      method: "GET",
      headers: headers,
    };
    // make call
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Open Library API error: ${response.statusText}`,
        error: `Open Library API failure`,
      });
    }
    // data clean up
    const data = await response.json();
    const books = data.docs || [];
    const processedBooks = books.map((book) => ({
      key: book.key.split("/").pop(),
      title: book.title,
      author_name: book.author_name,
      first_publish_year: book.first_publish_year,
      edition_key: book.edition_key,
    }));
    //
    res.status(200).json({
      success: true,
      count: processedBooks.length,
      data: processedBooks,
    });
  } catch (error) {
    console.error("Open Library fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book from Open Library",
      error: error.message,
    });
  }
}
