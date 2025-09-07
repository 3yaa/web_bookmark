export interface BookProps {
  id: number; //--REQUIRED -> will do on server side
  // user set
  score?: number;
  dateCompleted?: Date;
  note?: string;
  status: "Completed" | "Want to Read" | "Dropped"; //!--REQUIRED
  // from ol&&google -- used for checking duplicate
  key: string; //!--REQUIRED
  // from ol||google
  title: string; //!--REQUIRED
  author?: string;
  coverUrl?: string;
  coverEditions?: string[];
  curCoverIndex?: number;
  datePublished?: number;
  // from wikidata
  seriesTitle?: string;
  placeInSeries?: string;
  prequel?: string;
  sequel?: string;
}

export interface AllBooks {
  OpenLibBooks: OpenLibData[];
  GoogleBooks: GoogleBooks[];
}

export interface OpenLibData {
  key: string; // call to wikidata || check dup
  // details
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  // covers
  edition_key?: string[];
}

export interface GoogleBooks {
  id: string; // check dup
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_url?: string;
}

export interface WikiData {
  wiki_title?: string; // another title
  series_title?: string;
  place_in_series?: string;
  prequel?: string;
  sequel?: string;
}
