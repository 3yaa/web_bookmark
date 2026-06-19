import { BaseMediaProps, ColumnConfig, SeriesMediaProps, SortState } from "./media";

export type BookSortConfig = SortState<
  "title" | "score" | "dateCompleted" | "author" | "datePublished"
>;

export const DIFF_COLUMNS_BOOK: [
  ColumnConfig<BookProps>,
  ColumnConfig<BookProps>,
] = [
  { label: "Author", sortKey: "author", getValue: (b) => b.author },
  {
    label: "Published",
    sortKey: "datePublished",
    getValue: (b) => b.datePublished,
  },
];

export interface BookProps extends BaseMediaProps, SeriesMediaProps {
  status: "Completed" | "Want to Read" | "Dropped";
  key: string;
  author?: string;
  datePublished?: number;
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
