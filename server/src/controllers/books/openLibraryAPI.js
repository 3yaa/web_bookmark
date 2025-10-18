import dotenv from "dotenv";
import { checkDuplicate } from "../../utils/checkDuplicate.js";

dotenv.config();

export async function useOpenLibraryAPI(req, res) {
  try {
    const { query, title, limit } = req.query;
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&title=${encodeURIComponent(
      title
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
      cover_urls: book.edition_key.map((key) => {
        return `https://covers.openlibrary.org/b/olid/${key}-L.jpg`;
      }),
    }));
    // check for duplicate
    for (const book of processedBooks) {
      const isDuplicate = await checkDuplicate("books", "key", book.key);
      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          title: book.title,
          message: `Book "${book.title}" already in your library`,
          error: "Duplicate found",
        });
      }
    }
    //
    res.status(200).json({
      success: true,
      count: processedBooks.length,
      data: processedBooks,
    });
  } catch (error) {
    console.error("OpenLibrary fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book from Open Library",
      error: error.message,
    });
  }
}
