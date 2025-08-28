import {BookProps, OpenLibData, GoogleBooks , WikiData} from '@/types/books'

export function getCoverUrl(coverOLID?: string, size: "S" | "M" | "L" = "L"): string {
  return `https://covers.openlibrary.org/b/olid/${coverOLID}-${size}.jpg`;
}

export function mapOlDataToBook(dataOL: OpenLibData): Partial<BookProps> {
  return {
    title: dataOL.title,
    originalTitle: dataOL.title,
    author: dataOL.author_name?.[0],
    coverEditions: dataOL.edition_key,
    curCoverIndex: 1,
    datePublished: dataOL.first_publish_year,
  };
}

export function mapGoogleDataToBook(dataOL: GoogleBooks): Partial<BookProps> {
  return {
    title: cleanTitle(dataOL.title),
    author: dataOL.author_name?.[0],
    datePublished: dataOL.first_publish_year,
    coverUrl: dataOL.coverUrl,
  };
}

export function mapWikiDataToBook(dataWiki: WikiData): Partial<BookProps> {
  const sTitle = dataWiki.seriesTitle
  return {
    // title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: sTitle,
    placeInSeries: dataWiki.placeInSeries,
    prequel: cleanName(dataWiki.prequel, sTitle),
    sequel: cleanName(dataWiki.sequel, sTitle),
  };
}

function cleanTitle(title:string) {
  return title
    //removes brackets
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\{.*?\}/g, '')
    .replace(/.g/, '')
    //
    // Remove common separators at start and end
    .replace(/^[\s\-\–\—:;,\.\|#!]*/, '')
    .replace(/[\s\-\–\—:;,\.\|#!]*$/, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}


export function cleanName(title: string | undefined, seriesTitle: string | undefined) {
  if (!title || !seriesTitle) {
    return title;
  }
  //in the case series and title are the same
  if (title.trim() === seriesTitle.trim()) {
    return title;
  }
  //
  return title
    .replace(`${seriesTitle}`, '')
    // Remove common separators at start
    .replace(/^[\s\-\–\—:;,\.\|#]*/, '') 
    // Remove book/volume indicators
    .replace(/^(Book|Vol|Volume|Part|Episode|Chapter|No|Number)[\s\d\.\-:#]*/, '') 
    // Remove leading numbers with separators
    .replace(/^\d+[\s\-\.\):]*/, '')
    // Remove connecting words like "and the", "and", "&", "the"
    .replace(/^(and the|and|&)\s+/i, '')
    .trim();
}