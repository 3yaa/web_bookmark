"use client";
import { DIFF_COLUMNS_MOVIE, MovieProps } from "@/types/movie";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import { useScoreNudge } from "@/hooks/useScoreNudge";
import {
	ActorWork,
	CastMember,
	fetchActorWorks,
	fetchMovieCredits,
} from "../../utils/getActorInfo";
import { ActorItemsModal } from "../components/ActorModal";
import { DirectorPicker } from "@/app/movies/components/DirectorPicker";
import { AnimatePresence } from "framer-motion";
import { AddShow } from "@/app/shows/AddShow";
import { AddMovie } from "@/app/movies/AddMovie";
import { useAuthFetch } from "@/app/auth/hooks/useAuthFetch";
import { ShowProps } from "@/types/show";
import { ShowDetails } from "../shows/ShowDetailsHub";
import { MediaStatus } from "@/types/media";
import { useMovieSearch } from "@/hooks/external/useMovieSearch";
import { mapSeriesToMovie } from "./utils/movieMapping";
import { cleanName } from "@/utils/cleanName";

// check if movie has tmdbID
const isRealTmdbId = (tmdbId?: string) => !!tmdbId && tmdbId !== "-1";

const normalizeTitle = (title: string) =>
	title
		.toLowerCase()
		.trim()
		.replace(/^(the|a|an)\s+/, "");

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
	| { type: "confirmRefresh" }
	| { type: "cancelRefresh" }
	| { type: "cast" }
	| { type: "directorClick"; payload: string }
	| { type: "directorPicker" };

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
	// stores legacy movies when an actor's filmography reveals its tmdb id
	onBackfillTmdbId?: (movieId: number, tmdbId: string) => void;
}

export function MovieDetails({
	onClose,
	movie,
	onUpdate,
	addMovie,
	isLoading,
	showSequelPrequel,
	isInList,
	existingMovies = [],
	existingShows = [],
	onShowUpdate,
	onAddWork,
	onAddShow,
	onRefresh,
	onBackfillTmdbId,
}: MovieDetailsProps) {
	const [localNote, setLocalNote] = useState(movie.note || "");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { reloadMovie, searchForMovie } = useMovieSearch();
	// refresh preview state -- nothing is written until it is confirmed
	const [isSelecting, setIsSelecting] = useState(false);
	const [refreshMeta, setRefreshMeta] = useState<Partial<MovieProps>>({});
	// actor related
	const [castOpen, setCastOpen] = useState(false);
	const [cast, setCast] = useState<CastMember[]>([]);
	const [castLoading, setCastLoading] = useState(false);
	const [selectedActor, setSelectedActor] = useState<CastMember | null>(null);
	const [actorWorks, setActorWorks] = useState<ActorWork[]>([]);
	const [actorLoading, setActorLoading] = useState(false);
	// director related
	const [isDirectorView, setIsDirectorView] = useState(false);
	const [clickedDirector, setClickedDirector] = useState<string | null>(null);
	const [directorPickerOpen, setDirectorPickerOpen] = useState(false);
	//
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
			if (isRealTmdbId(m.tmdbId)) map.set(`movie:${m.tmdbId}`, m.status);
		for (const s of existingShows)
			if (isRealTmdbId(s.tmdbId)) map.set(`tv:${s.tmdbId}`, s.status);
		return map;
	}, [existingMovies, existingShows]);

	// for legacy
	const backfilled = useRef<Set<number>>(new Set());
	useEffect(() => {
		if (!onBackfillTmdbId || actorWorks.length === 0) return;
		const legacy = existingMovies.filter(
			(m) => !isRealTmdbId(m.tmdbId) && !backfilled.current.has(m.id),
		);
		if (legacy.length === 0) return;
		//
		for (const work of actorWorks) {
			if (work.media_type !== "movie") continue;
			const workYear = parseInt(work.date?.slice(0, 4) ?? "");
			if (isNaN(workYear)) continue;
			const match = legacy.find(
				(m) =>
					m.dateReleased === workYear &&
					normalizeTitle(m.title) === normalizeTitle(work.title),
			);
			if (!match) continue;
			backfilled.current.add(match.id);
			onBackfillTmdbId(match.id, String(work.id));
		}
	}, [actorWorks, existingMovies, onBackfillTmdbId]);

	// for cross media
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
			case "confirmRefresh":
				handleConfirmRefresh();
				break;
			case "cancelRefresh":
				handleCancelRefresh();
				break;
			case "cast":
				handleCast();
				break;
			case "directorClick":
				handleDirectorClick(action.payload);
				break;
			case "directorPicker":
				setDirectorPickerOpen(true);
				break;
		}
	};

	// stages the reload -- writes nothing until confirmRefresh
	const handleRefresh = async () => {
		if (!onRefresh || isRefreshing || isSelecting) return;
		// legacy movies that doesn't have tmdbid
		const hasTmdbId = !!movie.tmdbId && movie.tmdbId !== "-1";
		if (!hasTmdbId && !movie.title) return;
		setIsRefreshing(true);
		try {
			// no tmdb id to look up -- resolve one by title first
			const reloaded = hasTmdbId
				? await reloadMovie(movie.tmdbId as string)
				: await searchForMovie(movie.title, movie.dateReleased, true);
			if (!reloaded || "isDuplicate" in reloaded) return;
			// tmdbId is identity, left untouched
			const meta: Partial<MovieProps> = {
				posterUrl: reloaded.poster_url,
				backdropUrl: reloaded.backdrop_url,
			};
			// legacy
			if (!hasTmdbId) {
				meta.tmdbId = reloaded.tmdb_id;
				meta.director = reloaded.director;
				meta.dateReleased = reloaded.released_date;
			}
			const series = reloaded.series
				? mapSeriesToMovie(reloaded.series)
				: undefined;
			if (series) Object.assign(meta, series);
			const title = cleanName(reloaded.title, series?.seriesTitle);
			if (title) meta.title = title;
			setRefreshMeta(meta);
			setIsSelecting(true);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleConfirmRefresh = async () => {
		if (!onRefresh) return;
		const meta = { ...refreshMeta };
		exitSelecting();
		if (Object.keys(meta).length) await onRefresh(meta);
	};

	const handleCancelRefresh = () => {
		exitSelecting();
	};

	const exitSelecting = () => {
		setIsSelecting(false);
		setRefreshMeta({});
	};

	const handleCast = async () => {
		// reset on open instead of on close, so the exit animation keeps
		// whatever was on screen
		setSelectedActor(null);
		setIsDirectorView(false);
		setCastOpen(true);
		setCastLoading(true);
		try {
			const { cast: castList } = await fetchMovieCredits(
				movie.tmdbId ?? "-1",
				movie.imdbId,
				movie.id,
				authFetch,
			);
			setCast(castList);
		} catch {
			setCast([]);
		} finally {
			setCastLoading(false);
		}
	};

	const handleDirectorClick = async (name: string) => {
		if (!name) return;
		setClickedDirector(name);
		setIsDirectorView(true);
		setCastOpen(true);
		setSelectedActor(null);
		setActorWorks([]);
		setActorLoading(true);
		try {
			const { cast: castList, directors } = await fetchMovieCredits(
				movie.tmdbId ?? "-1",
				movie.imdbId,
				movie.id,
				authFetch,
			);
			setCast(castList);
			// match the name that was clicked -- a film can have several
			const wanted = name.toLowerCase().trim();
			const director =
				directors.find((d) => d.name.toLowerCase().trim() === wanted) ??
				directors[0];
			if (!director) return;
			setSelectedActor(director);
			setActorWorks(
				await fetchActorWorks(director.id, authFetch, "director"),
			);
		} catch {
			setActorWorks([]);
		} finally {
			setActorLoading(false);
		}
	};

	const handleActorClick = async (member: CastMember) => {
		setIsDirectorView(false);
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

	// need to reset local note 
	useEffect(() => {
		setLocalNote(movie.note || "");
		setIsSelecting(false);
		setRefreshMeta({});
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

	// while previewing render new
	const previewMovie = isSelecting ? { ...movie, ...refreshMeta } : movie;

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
					item={previewMovie}
					isSelecting={isSelecting}
					localNote={localNote}
					statusOptions={movieStatusOptions}
					mediaType="movie"
					isLoading={displayLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={handleModalClose}
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
					item={previewMovie}
					isSelecting={isSelecting}
					localNote={localNote}
					statusOptions={movieStatusOptions}
					mediaType="movie"
					isLoading={displayLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={handleModalClose}
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
				{directorPickerOpen && (
					<DirectorPicker
						key="director-picker"
						names={(movie.director ?? "")
							.split(",")
							.map((n) => n.trim())
							.filter(Boolean)}
						onClose={() => setDirectorPickerOpen(false)}
						onPick={(name) => {
							setDirectorPickerOpen(false);
							handleDirectorClick(name);
						}}
					/>
				)}
			</AnimatePresence>
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
						// only close -- clearing the actor here would swap the
						// filmography for the cast grid mid-exit, changing the
						// panel's height and shifting the centred modal
						onClose={() => setCastOpen(false)}
						onActorClick={handleActorClick}
						onActorBack={() => {
							setSelectedActor(null);
							setIsDirectorView(false);
						}}
						onFilmSortChange={setFilmSort}
						onWorkClick={handleWorkClick}
						addedStatusById={addedStatusById}
						isDirectorView={isDirectorView}
						directorName={clickedDirector ?? movie.director}
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
						// route through the parent's data hook
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
