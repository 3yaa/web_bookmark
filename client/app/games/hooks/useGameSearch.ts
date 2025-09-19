import { useState } from "react";
import { TMDBProps, TMDBTvProps } from "@/types/show";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export function useShowSearch() {
	const { authFetch, isAuthLoading } = useAuthFetch();
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isShowSearching = isSearching || isAuthLoading;

	// TMDB SEARCH API -- BASIC METADATA
	const searchForShow = async (
		title: string,
		year?: number | undefined
	): Promise<TMDBProps | null> => {
		try {
			setIsSearching(true);
			setError(null);
			//
			const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows-api/tmdb?title=${title}&year=${year}`;
			const response = await authFetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error--status: ${response.status}`);
			}
			//
			const resJson = await response.json();
			const show = resJson.data || null;
			//
			console.log("---", show);
			return show;
		} catch (e) {
			setError(e instanceof Error ? e.message : "An error occurred");
			console.error("Getting TMDb Search failed:", e);
			return null;
		} finally {
			setIsSearching(false);
		}
	};

	// TMDB TV API -- SEASON METADATA
	const searchForShowSeasonInfo = async (
		tmdbId: string
	): Promise<TMDBTvProps | null> => {
		try {
			setIsSearching(true);
			setError(null);
			//
			const url = `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/shows-api/tmdb-tv?tmdbId=${tmdbId}`;
			const response = await authFetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error--status: ${response.status}`);
			}
			//
			const resJson = await response.json();
			const seasonInfo = resJson.data || null;
			//
			console.log("++", seasonInfo);
			return seasonInfo;
		} catch (e) {
			setError(e instanceof Error ? e.message : "An error occurred");
			console.error("Getting TMDB TV failed: ", e);
			return null;
		} finally {
			setIsSearching(false);
		}
	};

	return {
		error,
		isShowSearching,
		searchForShow,
		searchForShowSeasonInfo,
	};
}
