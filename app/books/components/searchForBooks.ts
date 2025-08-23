import { OpenLibPayload } from "@/types/book";

interface SearchForBooksProps {
  query: string;
  limit?: number;
}

export async function searchForBooks({
  query,
  limit = 10,
}: SearchForBooksProps): Promise<OpenLibPayload[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&lang=en&fields=title,cover_i,author_name,first_publish_year,subject&limit=${limit}`;

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
      throw new Error(`HTTP error; status: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error("Open Library fetch failed: ", error);
    return [];
  }
}
