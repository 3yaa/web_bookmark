import { BookProps, OpenLibData, GoogleBooks, WikiData } from "@/types/books";

export function getCoverUrl(
  coverOLID?: string,
  size: "S" | "M" | "L" = "L"
): string {
  return `https://covers.openlibrary.org/b/olid/${coverOLID}-${size}.jpg`;
}

export function resetBookValues(book: Partial<BookProps>): Partial<BookProps> {
  return {
    id: book.id,
    key: book.key,
    status: "Want to Read",
    title: "",
    score: undefined,
    dateCompleted: undefined,
    note: undefined,
    author: undefined,
    coverUrl: undefined,
    coverEditions: undefined,
    curCoverIndex: undefined,
    datePublished: undefined,
    seriesTitle: undefined,
    placeInSeries: undefined,
    prequel: undefined,
    sequel: undefined,
  };
}

export function mapOlDataToBook(dataOL: OpenLibData): Partial<BookProps> {
  return {
    key: dataOL.key,
    title: dataOL.title,
    status: "Want to Read",
    author: dataOL.author_name?.[0],
    coverEditions: dataOL.edition_key,
    curCoverIndex: 0,
    datePublished: dataOL.first_publish_year,
  };
}

export function mapGoogleDataToBook(
  dataGoogle: GoogleBooks
): Partial<BookProps> {
  return {
    key: dataGoogle.id,
    title: cleanTitle(dataGoogle.title),
    status: "Want to Read",
    author: dataGoogle.author_name?.[0],
    datePublished: dataGoogle.first_publish_year,
    coverUrl: dataGoogle.cover_url,
  };
}

export function mapWikiDataToBook(dataWiki: WikiData): Partial<BookProps> {
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

export function cleanName(
  title: string | undefined,
  seriesTitle: string | undefined
) {
  if (!title || !seriesTitle) {
    return title;
  }
  //in the case series and title are the same
  if (title.trim() === seriesTitle.trim()) {
    return title;
  }
  //
  return (
    title
      .replace(`${seriesTitle}`, "")
      // Remove common separators at start
      .replace(/^[\s\-\–\—:;,\.\|#]*/, "")
      // Remove book/volume indicators
      .replace(
        /^(Book|Vol|Volume|Part|Episode|Chapter|No|Number)[\s\d\.\-:#]*/,
        ""
      )
      // Remove leading numbers with separators
      .replace(/^\d+[\s\-\.\):]*/, "")
      // Remove connecting words like "and the", "and", "&", "the"
      .replace(/^(and the|and|&)\s+/i, "")
      .trim()
  );
}
