import { GoogleBooks } from "@/types/books";

interface BackUpSearchForBooksProps {
	query: string;
	limit: number;
}

// interfaces to match google books api call

interface GoogleBooksImageLinks {
	thumbnail?: string;
	smallThumbnail?: string;
}

interface GoogleBooksApi {
	title?: string;
	authors?: string[];
	publishedDate?: string;
	imageLinks?: GoogleBooksImageLinks;
}

interface GoogleBooksApiItem {
	key: string;
	volumeInfo: GoogleBooksApi;
}

export async function backUpSearchForBooks(
	{query, limit}: BackUpSearchForBooksProps
): Promise<GoogleBooks[]> {
	try {
		const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API}`

		
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error; status: ${response.status}`);
		}
		const data = await response.json();

		// check if items exists in response
		if (!data.items || !Array.isArray(data.items)) {
			return [];
		}

		// data clean up
		const cleanData: GoogleBooks[] = data.items.map((item: GoogleBooksApiItem) => {
			const volumeInfo = item.volumeInfo || {};
			return {
				key: item.key,
				title: volumeInfo.title,
				author_name: volumeInfo.authors,
				first_publish_year: volumeInfo.publishedDate 
					? parseInt(volumeInfo.publishedDate.split('-')[0]) : undefined,
				coverUrl: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || ""
			}
		})
		return cleanData;
	} catch (e) {
		console.error("Google Books fetch failed: ", e);
		return[];
	}
}