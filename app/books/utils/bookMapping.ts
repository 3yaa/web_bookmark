import {
  BookProps,
  OpenLibraryProps,
  GoogleBooksProps,
  WikidataProps,
} from "@/types/book";
import { cleanName } from "@/utils/cleanName";

export function resetBookValues(book: Partial<BookProps>): Partial<BookProps> {
  return {
    id: book.id,
    key: book.key,
    title: "",
    score: undefined,
    dateCompleted: undefined,
    note: undefined,
    author: undefined,
    coverUrl: undefined,
    datePublished: undefined,
    seriesTitle: undefined,
    placeInSeries: undefined,
    prequel: undefined,
    sequel: undefined,
    status: "Want to Read",
    lastUpdated: undefined,
  };
}

export function mapOpenLibDataToBook(
  dataOL: OpenLibraryProps,
): Partial<BookProps> {
  return {
    key: dataOL.key,
    title: dataOL.title,
    author: dataOL.author_name?.[0],
    datePublished: dataOL.first_publish_year,
  };
}

export function mapGoogleDataToBook(
  dataGoogle: GoogleBooksProps,
): Partial<BookProps> {
  return {
    key: dataGoogle.id,
    title: cleanTitle(dataGoogle.title),
    author: dataGoogle.author_name?.[0],
    datePublished: dataGoogle.first_publish_year,
    coverUrl: dataGoogle.cover_url,
  };
}

export function mapWikidataToBook(dataWiki: WikidataProps): Partial<BookProps> {
  const sTitle = dataWiki.series_title;
  return {
    // title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: sTitle,
    placeInSeries: dataWiki.place_in_series,
    prequel: cleanName(dataWiki.prequel, sTitle),
    sequel: cleanName(dataWiki.sequel, sTitle),
  };
}

function cleanTitle(title: string) {
  return (
    title
      //removes brackets
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\{.*?\}/g, "")
      .replace(/.g/, "")
      //
      // Remove common separators at start and end
      .replace(/^[\s\-\–\—:;,\.\|#!]*/, "")
      .replace(/[\s\-\–\—:;,\.\|#!]*$/, "")
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}
