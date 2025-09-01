import { OpenLibData } from "@/types/books";

interface SearchForBooksProps {
  query: string;
  limit: number;
}

export async function searchForBooks({
  query,
  limit,
}: SearchForBooksProps): Promise<OpenLibData[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&lang=en&fields=key,title,author_name,first_publish_year,subject,edition_key,cover_edition_key&limit=${limit}`;

    const headers = new Headers({
      "User-Agent": `Media Manager/0.3 (${process.env.NEXT_PUBLIC_PAGE_CONTACT})`,
    });

    const options = {
      method: "GET",
      headers: headers,
    };

	  // make call
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error; status: ${response.status}`);
    }
    const data = await response.json();
    const books = data.docs || [];

    return books.map((book:OpenLibData) =>({
      ...book,
      key: book.key.split("/").pop()
    }))
  } catch (e) {
    console.error("Open Library fetch failed: ", e);
    return [];
  }
}