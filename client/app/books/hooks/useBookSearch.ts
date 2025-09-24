import { useState } from "react";
import {
  OpenLibraryProps,
  GoogleBooksProps,
  WikidataProps,
} from "@/types/book";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useBookSearch() {
  const { authFetch, isAuthLoading } = useAuthFetch();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBookSearching = isSearching || isAuthLoading;

  // OPEN LIBRARY API -- BOOK PRIMINARY
  const searchForBooks = async (
    query: string,
    limit: number
  ): Promise<OpenLibraryProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      // make call
      const url = `/api/books-api/open-library?query=${query}&limit=${limit}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      // format data
      const resJson = await response.json();
      const books = resJson.data || null;
      //
      return books;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting open library failed: ", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // WikidataProps API -- SERIES INFO
  const searchForSeriesInfo = async (
    olid: string
  ): Promise<WikidataProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/books-api/wikidata?openLibraryID=${olid}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const seriesInfo = resJson.data || null;
      //
      return seriesInfo;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting wikidata failed:", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // GOOGLE BOOKS API -- BOOK BACKUP
  const searchForBackupBooks = async (
    query: string,
    limit: number
  ): Promise<GoogleBooksProps[] | null> => {
    try {
      setIsSearching(true);
      setError(null);
      //
      const url = `/api/books-api/google-books?query=${query}&limit=${limit}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      const books = resJson.data || null;
      //
      return books;
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      console.error("Getting google books failed: ", e);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    error,
    isBookSearching,
    searchForBooks,
    searchForSeriesInfo,
    searchForBackupBooks,
  };
}
