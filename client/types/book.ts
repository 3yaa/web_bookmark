export type SortConfig = {
  type: "title" | "score" | "dateCompleted" | "author" | "datePublished";
  order: "asc" | "desc";
};

export interface BookProps {
  id: number; //--REQUIRED -> will do on server side
  // user set
  score?: number;
  dateCompleted?: Date | null;
  note?: string;
  status: "Completed" | "Want to Read" | "Dropped"; //!--REQUIRED
  // from ol&&google -- used for checking duplicate
  key: string; //!--REQUIRED
  // from ol||google
  title: string; //!--REQUIRED
  author?: string;
  coverUrl?: string;
  datePublished?: number;
  // from WikidataProps
  seriesTitle?: string;
  placeInSeries?: string;
  prequel?: string;
  sequel?: string;
}

// export interface AllBooksProps {
//   OpenLibBooks: OpenLibraryProps[];
//   GoogleBooksProps: GoogleBooksProps[];
// }

export interface OpenLibraryProps {
  key: string; // call to WikidataProps || check dup
  // details
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  // covers
  cover_urls?: string[];
}

export interface GoogleBooksProps {
  id: string; // check dup
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_url?: string;
}

export interface WikidataProps {
  wiki_title?: string; // another title
  series_title?: string;
  place_in_series?: string;
  prequel?: string;
  sequel?: string;
}
