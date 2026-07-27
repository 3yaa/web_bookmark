"use client";
import { DIFF_COLUMNS_MOVIE, MovieProps } from "@/types/movie";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import { useScoreNudge } from "@/hooks/useScoreNudge";
import {
	ActorWork,
	CastMember,
	fetchActorWorks,
	fetchMovieCast,
} from "../../utils/getActorInfo";
import { ActorItemsModal } from "../components/ActorModal";
import { AnimatePresence } from "framer-motion";
import { AddShow } from "@/app/shows/AddShow";
import { AddMovie } from "@/app/movies/AddMovie";
import { useAuthFetch } from "@/app/auth/hooks/useAuthFetch";
import { ShowProps } from "@/types/show";
import { ShowDetails } from "../shows/ShowDetailsHub";
import { MediaStatus } from "@/types/media";
import { useMovieSearch } from "@/hooks/external/useMovieSearch";
import { mapTMDBToMovie, mapWikidataToMovie } from "./utils/movieMapping";

export type MovieAction =
	| { type: "closeModal" }
	| { type: "delete" }
	| {
			type: "changeStatus";
			payload: "Completed" | "Want to Watch" | "Dropped";
	  }
	| { type: "resetScore" }
	| { type: "nudgeScore"; payload: "up" | "down" }
	| { type: "setInitialTier"; payload: Tier }
	| { type: "changeNote"; payload: string }
	| { type: "saveNote" }
	| { type: "seriesNav"; payload: "sequel" | "prequel" }
	| { type: "clearSeriesMeta" }
	| { type: "needYearField" }
	| { type: "refresh" }
	| { type: "cast" };

interface MovieDetailsProps {
	movie: MovieProps;
	onClose: () => void;
	isLoading?: { isTrue: boolean; style: string; text: string };
	onUpdate: (
		movieId: number,
		updates?: Partial<MovieProps>,
		takeAction?: boolean,
	) => void;
	addMovie?: () => void;
	showSequelPrequel?: (sequelTitle: string) => void;
	isInList?: (title: string) => boolean;
	showAnotherSeries?: (seriesDir: "left" | "right") => void;
	existingMovies?: MovieProps[];
	onAddWork?: (movie: MovieProps) => Promise<unknown>;
	//
	onShowUpdate?: (
		showId: number,
		updates?: Partial<ShowProps>,
		takeAction?: boolean,
	) => void;
	existingShows?: ShowProps[];
	onAddShow?: (movie: ShowProps) => Promise<unknown>;
	// reload metadata from source (poster/backdrop, series)
	onRefresh?: (metadata: Partial<MovieProps>) => Promise<void>;
}

export function MovieDetails({
	onClose,
	movie,
	onUpdate,
	addMovie,
	isLoading,
	showSequelPrequel,
	isInList,
	showAnotherSeries,
	existingMovies = [],
	existingShows = [],
	onShowUpdate,
	onAddWork,
	onAddShow,
	onRefresh,
}: MovieDetailsProps) {
	const [localNote, setLocalNote] = useState(movie.note || "");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { searchForPosters, searchForSeriesInfo } = useMovieSearch();
	// actor related
	const [castOpen, setCastOpen] = useState(false);
	const [cast, setCast] = useState<CastMember[]>([]);
	const [castLoading, setCastLoading] = useState(false);
	const [selectedActor, setSelectedActor] = useState<CastMember | null>(null);
	const [actorWorks, setActorWorks] = useState<ActorWork[]>([]);
	const [actorLoading, setActorLoading] = useState(false);
	const [filmSort, setFilmSort] = useState<"popularity" | "recent">(
		"popularity",
	);
	const [pendingWork, setPendingWork] = useState<ActorWork | null>(null);
	const [selectedWorkItem, setSelectedWorkItem] = useState<
		{ type: "movie"; id: number } | { type: "tv"; id: number } | null
	>(null);
	const { authFetch } = useAuthFetch();

	const addedStatusById = useMemo(() => {
		const map = new Map<string, MediaStatus>();
		for (const m of existingMovies)
			if (m.tmdbId) map.set(`movie:${m.tmdbId}`, m.status);
		for (const s of existingShows)
			if (s.tmdbId) map.set(`tv:${s.tmdbId}`, s.status);
		return map;
	}, [existingMovies, existingShows]);

	// change, so an update made inside the nested modal is reflected right away
	const selectedMovie =
		selectedWorkItem?.type === "movie"
			? existingMovies.find((m) => m.id === selectedWorkItem.id)
			: undefined;

	const selectedShow =
		selectedWorkItem?.type === "tv"
			? existingShows.find((s) => s.id === selectedWorkItem.id)
			: undefined;

	const handleWorkClick = useCallback(
		(work: ActorWork) => {
			if (work.media_type === "movie") {
				const existing = existingMovies.find(
					(m) => m.tmdbId === String(work.id),
				);
				if (existing)
					return setSelectedWorkItem({
						type: "movie",
						id: existing.id,
					});
			} else {
				const existing = existingShows.find(
					(s) => s.tmdbId === String(work.id),
				);
				if (existing)
					return setSelectedWorkItem({
						type: "tv",
						id: existing.id,
					});
			}
			setPendingWork(work);
		},
		[existingMovies, existingShows],
	);

	// manual +/- 0.1 score tweaks -- phi tightens once, on close
	const { nudge: nudgeScore, commit: commitScoreNudge } = useScoreNudge(
		movie,
		onUpdate,
	);

	const handleAction = (action: MovieAction) => {
		switch (action.type) {
			// =========modal actions=============
			case "closeModal":
				handleModalClose();
				break;
			case "delete":
				handleDelete();
				break;
			case "needYearField":
				handleNeedYear();
				break;
			// =========update actions=============
			case "changeStatus":
				handleStatusChange(action.payload);
				break;
			case "setInitialTier":
				onUpdate(movie.id, {
					score: {
						mu: getSeedMu(action.payload),
						phi: TIER_PHI_THRESHOLD[action.payload],
					},
				});
				break;
			case "resetScore":
				onUpdate(movie.id, { score: null });
				break;
			case "nudgeScore":
				nudgeScore(action.payload);
				break;
			case "changeNote":
				setLocalNote(action.payload);
				break;
			case "saveNote":
				handleSaveNote();
				break;
			case "clearSeriesMeta":
				if (movie.seriesTitle) {
					onUpdate(movie.id, {
						seriesTitle: null,
						placeInSeries: null,
						prequel: null,
						sequel: null,
					});
				}
				break;
			// =========other actions=============
			case "seriesNav":
				handleSeriesNav(action.payload);
				break;
			case "refresh":
				handleRefresh();
				break;
			case "cast":
				handleCast();
				break;
		}
	};

	const handleRefresh = async () => {
		if (!onRefresh || !movie.imdbId || isRefreshing) return;
		setIsRefreshing(true);
		try {
			const [tmdb, wiki] = await Promise.all([
				searchForPosters(movie.imdbId),
				searchForSeriesInfo(movie.imdbId),
			]);
			const meta: Partial<MovieProps> = {};
			// only imagery refreshes -- tmdbId is identity, left untouched
			if (tmdb) {
				const t = mapTMDBToMovie(tmdb);
				meta.posterUrl = t.posterUrl;
				meta.backdropUrl = t.backdropUrl;
			}
			if (wiki && wiki.length)
				Object.assign(meta, mapWikidataToMovie(wiki[0]));
			if (Object.keys(meta).length) await onRefresh(meta);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleCast = async () => {
		setCastOpen(true);
		setCastLoading(true);
		try {
			setCast(
				await fetchMovieCast(
					movie.tmdbId ?? "-1",
					movie.imdbId,
					movie.id,
					authFetch,
				),
			);
		} catch {
			setCast([]);
		} finally {
			setCastLoading(false);
		}
	};

	const handleActorClick = async (member: CastMember) => {
		setSelectedActor(member);
		setActorWorks([]);
		setActorLoading(true);
		try {
			setActorWorks(await fetchActorWorks(member.id, authFetch));
		} catch {
			setActorWorks([]);
		} finally {
			setActorLoading(false);
		}
	};

	const sortedWorks = useMemo(
		() =>
			[...actorWorks].sort((a, b) =>
				filmSort === "recent"
					? b.date.localeCompare(a.date)
					: b.popularity - a.popularity,
			),
		[actorWorks, filmSort],
	);

	const handleStatusChange = (value: string) => {
		const newStatus = value as "Completed" | "Want to Watch";
		const statusLoad: Partial<MovieProps> = {
			status: newStatus,
		};
		if (newStatus === "Completed") {
			statusLoad.dateCompleted = new Date();
		} else if (movie.dateCompleted) {
			statusLoad.dateCompleted = null;
		}
		onUpdate(movie.id, statusLoad);
	};

	// switches modal to new movie in series
	const handleSeriesNav = (seriesDir: string) => {
		if (!showSequelPrequel) return;
		const targetTitle =
			seriesDir === "sequel" ? movie.sequel : movie.prequel;
		if (targetTitle) {
			showSequelPrequel(targetTitle);
		}
	};

	const handleSaveNote = () => {
		if (localNote !== movie.note) {
			onUpdate(movie.id, { note: localNote });
		}
	};

	const handleDelete = () => {
		onClose();
		const shouldDelete = true;
		onUpdate(movie.id, undefined, shouldDelete);
	};

	const handleModalClose = () => {
		// fold the deferred phi drop into the update this close flushes
		commitScoreNudge();
		// if (addMovie) return;
		onClose();
	};

	// AddMovie.tsx -- goes back to search with year field
	const handleNeedYear = () => {
		const needYear = true;
		onUpdate(movie.id, undefined, needYear);
	};

	const handleAddMovie = useCallback(() => {
		if (!addMovie) return;
		addMovie();
	}, [addMovie]);

	// need to reset local note -- since changing movie (sequel/prequel) doesn't remount
	useEffect(() => {
		setLocalNote(movie.note || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [movie.id]);

	useEffect(() => {
		const handleLeave = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				const activeElement = document.activeElement;
				const isInTextarea = activeElement?.tagName === "TEXTAREA";
				const isInInput = activeElement?.tagName === "INPUT";
				if (!isInTextarea && !isInInput) {
					handleAddMovie();
				}
			}
		};
		//
		window.addEventListener("keydown", handleLeave);
		return () => window.removeEventListener("keydown", handleLeave);
	}, [onClose, handleAddMovie]);

	if (!movie) return null;

	const displayLoading = isRefreshing
		? {
				isTrue: true,
				style: "h-8 w-8 border-emerald-400",
				text: "Reloading...",
			}
		: isLoading;

	return (
		<>
			<div className="lg:block hidden">
				<DesktopDetails
					item={movie}
					localNote={localNote}
					statusOptions={movieStatusOptions}
					mediaType="movie"
					isLoading={displayLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={handleModalClose}
					onSeriesNav={showAnotherSeries}
					isInList={isInList}
					canRefresh={!!onRefresh}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_MOVIE}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileDetails
					item={movie}
					localNote={localNote}
					statusOptions={movieStatusOptions}
					mediaType="movie"
					isLoading={displayLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={handleModalClose}
					onSeriesNav={showAnotherSeries}
					isInList={isInList}
					canRefresh={!!onRefresh}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_MOVIE}
				/>
			</div>
			<AnimatePresence>
				{castOpen && (
					<ActorItemsModal
						key="cast"
						mediaTitle={movie.title}
						cast={cast}
						castLoading={castLoading}
						selectedActor={selectedActor}
						sortedWorks={sortedWorks}
						actorLoading={actorLoading}
						filmSort={filmSort}
						onClose={() => {
							setCastOpen(false);
							setSelectedActor(null);
						}}
						onActorClick={handleActorClick}
						onActorBack={() => setSelectedActor(null)}
						onFilmSortChange={setFilmSort}
						onWorkClick={handleWorkClick}
						addedStatusById={addedStatusById}
					/>
				)}
			</AnimatePresence>
			{pendingWork?.media_type === "movie" && (
				<AddMovie
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingMovies={existingMovies}
					onAddMovie={async (m) => {
						// route through the parent's data hook so the listing
						// updates without a refresh; fall back to a raw POST
						if (onAddWork) {
							await onAddWork(m);
						} else {
							await authFetch("/api/movies", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(m),
							});
						}
						setPendingWork(null);
					}}
				/>
			)}
			{selectedMovie && (
				<MovieDetails
					movie={selectedMovie}
					onClose={() => setSelectedWorkItem(null)}
					onUpdate={onUpdate}
					existingMovies={existingMovies}
					existingShows={existingShows}
					onShowUpdate={onShowUpdate}
					onAddWork={onAddWork}
					onAddShow={onAddShow}
				/>
			)}
			{/* SHOW STUFF */}
			{selectedShow && onShowUpdate && (
				<ShowDetails
					show={selectedShow}
					onClose={() => setSelectedWorkItem(null)}
					onUpdate={onShowUpdate}
					existingShows={existingShows}
					existingMovies={existingMovies}
					onMovieUpdate={onUpdate}
					onAddWork={onAddShow}
					onAddMovie={onAddWork}
				/>
			)}
			{pendingWork?.media_type === "tv" && (
				<AddShow
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingShows={existingShows}
					onAddShow={async (s) => {
						if (onAddShow) {
							await onAddShow(s);
						} else {
							await authFetch("/api/shows", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(s),
							});
						}
						setPendingWork(null);
					}}
				/>
			)}
		</>
	);
}
