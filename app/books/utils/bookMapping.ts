import {BookProps, OpenLibData, WikiData} from '@/types/books'

export function getCoverUrl(coverOLID?: string, size: "S" | "M" | "L" = "L"): string {
  return `https://covers.openlibrary.org/b/olid/${coverOLID}-${size}.jpg`;
}

function cleanName(title: string | undefined, seriesTitle: string | undefined) {
  if (!title || !seriesTitle) {
    return title;
  }
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

function cleanGenre(genre: string[] | undefined) {
  if (!genre) return genre;
  
  return genre.filter(g => {
    // Remove if contains punctuation (commas, colons, semicolons, hyphens, etc.)
    if (/[,\-:;()[\]{}'""/\\|<>?!@#$%^&*+=~`]/.test(g)) return false;
    // Remove if more than one word
    if (g.trim().split(/\s+/).length > 1) return false;
    // Remove if contains numbers
    if (/\d/.test(g)) return false;
    // Remove common non-genre words
    const excludeWords = new Set([
      'spanish', 'modern','new', 'old', 'popular',
      'literature', 'novel', 'book', 'story', 'tales'
    ]);
    if (excludeWords.has(g.toLowerCase().trim())) return false;
    // Remove if contains accented char  
    if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(g)) return false;

    return true;
  });
}

export function mapOlDataToBook(dataOL: OpenLibData): Partial<BookProps> {
  return {
    title: dataOL.title,
    author: dataOL.author_name?.[0],
    coverEditions: dataOL.edition_key,
    curCoverIndex: 1,
    datePublished: dataOL.first_publish_year,
	  genre: cleanGenre(dataOL.subject), //NOT USING
  };
}

export function mapWikiDataToBook(dataWiki: WikiData): Partial<BookProps> {
  const sTitle = dataWiki.seriesTitle
  return {
    title: cleanName(dataWiki.wikiTitle, sTitle),
    seriesTitle: sTitle,
    placeInSeries: dataWiki.placeInSeries,
    prequel: cleanName(dataWiki.prequel, sTitle),
    sequel: cleanName(dataWiki.sequel, sTitle),
  };
}
