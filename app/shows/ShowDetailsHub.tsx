"use client";
import { DIFF_COLUMNS_SHOW, ShowProps } from "@/types/show";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { showStatusOptions } from "@/utils/dropDownDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import {
	ActorWork,
	CastMember,
	fetchActorWorks,
	fetchShowCast,
} from "../../utils/getActorInfo";
import { ActorItemsModal } from "../components/ActorModal";
import { AnimatePresence } from "framer-motion";
import { AddShow } from "./AddShow";
import { AddMovie } from "@/app/movies/AddMovie";
import { useAuthFetch } from "@/app/auth/hooks/useAuthFetch";
import { EpisodeRatingsModal } from "./components/EpisodeRatingsModal";
import { MovieProps } from "@/types/movie";
import { MovieDetails } from "@/app/movies/MovieDetailsHub";
import { MediaStatus } from "@/types/media";

export type ShowAction =
	| { type: "closeModal" }
	| { type: "delete" }
	| { type: "needYearField" }
	| {
			type: "changeStatus";
			payload: "Completed" | "Want to Watch" | "Dropped" | "Watching";
	  }
	| { type: "resetScore" }
	| { type: "setInitialTier"; payload: Tier }
	| { type: "changeNote"; payload: string }
	| { type: "saveNote" }
	| { type: "changeSeason"; payload: "left" | "right" }
	| { type: "changeEpisode"; payload: "left" | "right" }
	| { type: "clickSeasonInput" }
	| { type: "clickEpisodeInput" }
	| { type: "submitSeasonInput" }
	| { type: "submitEpisodeInput" }
	| { type: "changeSeasonInput"; payload: string }
	| { type: "changeEpisodeInput"; payload: string }
	| { type: "changeSeasonNum"; payload: number }
	| { type: "changeEpisodeNum"; payload: number }
	| { type: "cast" }
	| { type: "openRatings" };

interface ShowDetailsProps {
	show: ShowProps;
	onClose: () => void;
	isLoading?: { isTrue: boolean; style: string; text: string };
	onUpdate: (
		showId: number,
		updates?: Partial<ShowProps>,
		takeAction?: boolean,
	) => void;
	addShow?: () => void;
	existingShows?: ShowProps[];
	onAddWork?: (show: ShowProps) => Promise<unknown>;
	//
	existingMovies?: MovieProps[];
	onMovieUpdate?: (
		movieId: number,
		updates?: Partial<MovieProps>,
		takeAction?: boolean,
	) => void;
	onAddMovie?: (movie: MovieProps) => Promise<unknown>;
}

export function ShowDetails({
	onClose,
	show,
	onUpdate,
	addShow,
	isLoading,
	existingShows = [],
	existingMovies = [],
	onAddWork,
	onMovieUpdate,
	onAddMovie,
}: ShowDetailsProps) {
	const [localNote, setLocalNote] = useState(show.note || "");
	const [editingMode, setEditingMode] = useState({
		season: false,
		episode: false,
	});
	const [inputValues, setInputValues] = useState<{
		season: number | "";
		episode: number | "";
	}>({
		season: show.curSeasonIndex + 1,
		episode: show.curEpisode,
	});
	// actor related
	const [ratingsOpen, setRatingsOpen] = useState(false);
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
	// store only the id + type; the live object is derived from the
	// existingMovies/existingShows arrays on each render so edits show up
	// immediately instead of after a reopen
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

	// live lookups -- these re-resolve whenever existingMovies/existingShows
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

	const handleAction = (action: ShowAction) => {
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
				onUpdate(show.id, {
					score: {
						mu: getSeedMu(action.payload),
						phi: TIER_PHI_THRESHOLD[action.payload],
					},
				});
				break;
			case "resetScore":
				onUpdate(show.id, { score: null });
				break;
			case "changeNote":
				setLocalNote(action.payload);
				break;
			case "saveNote":
				handleSaveNote();
				break;
			// =========season/episode navigation=============
			case "changeSeason":
				handleSeasonChange(action.payload);
				break;
			case "changeEpisode":
				handleEpisodeChange(action.payload);
				break;
			// =========s/ep input editing=============
			case "clickSeasonInput":
				handleInputClick("season");
				break;
			case "clickEpisodeInput":
				handleInputClick("episode");
				break;
			case "changeSeasonInput":
				handleSeasonInputChange(action.payload);
				break;
			case "changeEpisodeInput":
				handleEpisodeInputChange(action.payload);
				break;
			case "submitSeasonInput":
				handleInputSubmit("season");
				break;
			case "submitEpisodeInput":
				handleInputSubmit("episode");
				break;
			case "changeEpisodeNum":
				onUpdate(show.id, {
					curEpisode: action.payload,
				});
				break;
			case "changeSeasonNum":
				onUpdate(show.id, {
					curSeasonIndex: action.payload,
				});
				break;
			case "cast":
				handleCast();
				break;
			case "openRatings":
				setRatingsOpen(true);
				break;
		}
	};

	const handleCast = async () => {
		setCastOpen(true);
		setCastLoading(true);
		try {
			setCast(await fetchShowCast(Number(show.tmdbId), authFetch));
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
		const updatesViaStatus: Partial<ShowProps> = {
			status: newStatus,
		};
		if (newStatus === "Completed") {
			updatesViaStatus.dateCompleted = new Date();
			if (show.seasons) {
				updatesViaStatus.curEpisode =
					show.seasons[show.seasons.length - 1].episode_count;
				updatesViaStatus.curSeasonIndex = show.seasons.length - 1;
			}
		} else if (show.dateCompleted) {
			updatesViaStatus.dateCompleted = null;
		}
		onUpdate(show.id, updatesViaStatus);
	};

	const handleSaveNote = () => {
		if (localNote !== show.note) {
			onUpdate(show.id, { note: localNote });
		}
	};

	const handleDelete = () => {
		onClose();
		const shouldDelete = true;
		onUpdate(show.id, undefined, shouldDelete);
	};

	const handleModalClose = () => {
		// if (addShow) return;
		onClose();
	};

	const handleAddShow = useCallback(() => {
		if (!addShow) return;
		addShow();
	}, [addShow]);

	const handleNeedYear = () => {
		const needYear = true;
		onUpdate(show.id, undefined, needYear);
	};

	const handleInputClick = (type: "season" | "episode") => {
		if (editingMode[type]) {
			setEditingMode({ season: false, episode: false });
			return;
		}
		//
		setEditingMode({
			season: type === "season",
			episode: type === "episode",
		});
		//
		setInputValues({
			season: show.curSeasonIndex + 1,
			episode: show.curEpisode,
		});
	};

	const handleInputSubmit = (type: "season" | "episode") => {
		if (!show.seasons) return;

		if (type === "season") {
			// empty input
			let seasonNum =
				inputValues.season === ""
					? show.curSeasonIndex + 1
					: inputValues.season;
			// force clamp top
			seasonNum =
				seasonNum > show.seasons.length
					? show.seasons.length
					: seasonNum;
			//
			if (seasonNum >= 1 && seasonNum <= show.seasons.length) {
				setEditingMode({ ...editingMode, season: false });
				onUpdate(show.id, {
					curSeasonIndex: seasonNum - 1,
					curEpisode: 1,
				});
			} else {
				setInputValues({
					...inputValues,
					season: show.curSeasonIndex + 1,
				});
				setEditingMode({ ...editingMode, season: false });
			}
		} else if (type === "episode") {
			const maxEpisodes = show.seasons[show.curSeasonIndex].episode_count;
			// empty input
			let episodeNum =
				inputValues.episode === ""
					? show.curEpisode
					: inputValues.episode;
			// force clamp top
			episodeNum = episodeNum > maxEpisodes ? maxEpisodes : episodeNum;
			//
			if (episodeNum >= 1 && episodeNum <= maxEpisodes) {
				setEditingMode({ ...editingMode, episode: false });
				onUpdate(show.id, { curEpisode: episodeNum });
			} else {
				setInputValues({ ...inputValues, episode: show.curEpisode });
				setEditingMode({ ...editingMode, episode: false });
			}
		}
	};

	const handleSeasonInputChange = (value: string) => {
		// allow empty string so user can clear and retype
		if (value === "") {
			setInputValues({
				...inputValues,
				season: "",
			});
		} else {
			const numValue = parseInt(value);
			setInputValues({
				...inputValues,
				season: isNaN(numValue) ? "" : Math.max(1, numValue),
			});
		}
	};

	const handleEpisodeInputChange = (value: string) => {
		if (value === "") {
			setInputValues({
				...inputValues,
				episode: "",
			});
		} else {
			const numValue = parseInt(value);
			setInputValues({
				...inputValues,
				episode: isNaN(numValue) ? "" : Math.max(0, numValue),
			});
		}
	};

	const handleSeasonChange = (dir: string) => {
		if (!show.seasons) return;
		//
		let seasonIndex = show.curSeasonIndex;
		const seasons = show.seasons;
		//
		const isFirstSeason = seasonIndex === 0;
		const isLastSeason = seasonIndex === seasons.length - 1;
		//
		if (dir === "left") {
			if (isFirstSeason) return;
			//
			seasonIndex -= 1;
		} else if (dir === "right") {
			if (isLastSeason) return;
			//
			seasonIndex += 1;
		}
		const curEp = 0;
		onUpdate(show.id, { curSeasonIndex: seasonIndex, curEpisode: curEp });
	};

	const handleEpisodeChange = (dir: string) => {
		if (!show.seasons) return;
		//
		let { curSeasonIndex: seasonIndex, curEpisode: curEp } = show;
		const seasons = show.seasons;
		//
		const isFirstEpisode = seasonIndex === 0 && curEp === 0;
		const isLastEpisode =
			seasonIndex === seasons.length - 1 &&
			curEp === seasons[seasonIndex].episode_count;
		//
		if (dir === "left") {
			if (isFirstEpisode) return;
			// go back season's last ep
			if (curEp === 0) {
				seasonIndex -= 1;
				curEp = seasons[seasonIndex].episode_count;
			} else {
				curEp -= 1;
			}
		} else if (dir === "right") {
			if (isLastEpisode) return;
			// go to next season's first ep
			if (curEp === seasons[seasonIndex].episode_count) {
				seasonIndex += 1;
				curEp = 0;
			} else {
				curEp += 1;
			}
		}

		onUpdate(show.id, { curSeasonIndex: seasonIndex, curEpisode: curEp });
	};

	useEffect(() => {
		const handleLeave = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				const activeElement = document.activeElement;
				const isInTextarea = activeElement?.tagName === "TEXTAREA";
				const isInInput = activeElement?.tagName === "INPUT";
				const isInEditingMode =
					editingMode.season || editingMode.episode;
				if (!isInTextarea && !isInInput && !isInEditingMode) {
					handleAddShow();
				}
			}
		};
		//
		window.addEventListener("keydown", handleLeave);
		return () => window.removeEventListener("keydown", handleLeave);
	}, [onClose, editingMode, handleAddShow]);

	useEffect(() => {
		setInputValues({
			season: show.curSeasonIndex + 1,
			episode: show.curEpisode,
		});
	}, [show.curSeasonIndex, show.curEpisode]);

	// need to reset local note -- since changing show doesn't remount
	useEffect(() => {
		setLocalNote(show.note || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [show.id]);

	if (!show) return null;

	return (
		<>
			<div className="lg:block hidden">
				<DesktopDetails
					item={show}
					localNote={localNote}
					statusOptions={showStatusOptions}
					mediaType="show"
					isLoading={isLoading}
					isAdding={!!addShow}
					onAdd={handleAddShow}
					onClose={onClose}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_SHOW}
					editingMode={editingMode}
					inputValues={inputValues}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileDetails
					item={show}
					localNote={localNote}
					statusOptions={showStatusOptions}
					mediaType="show"
					isLoading={isLoading}
					isAdding={!!addShow}
					onAdd={handleAddShow}
					onClose={onClose}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_SHOW}
				/>
			</div>
			<AnimatePresence>
				{ratingsOpen && (
					<EpisodeRatingsModal
						key="ratings"
						show={show}
						onClose={() => setRatingsOpen(false)}
						authFetch={authFetch}
					/>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{castOpen && (
					<ActorItemsModal
						key="cast"
						mediaTitle={show.title}
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

			{pendingWork?.media_type === "tv" && (
				<AddShow
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingShows={existingShows}
					onAddShow={async (s) => {
						// route through the parent's data hook so the listing
						// updates without a refresh; fall back to a raw POST
						if (onAddWork) {
							await onAddWork(s);
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
			{/* OPENED SHOW (from actor modal) -- reads the live object by id */}
			{selectedShow && (
				<ShowDetails
					show={selectedShow}
					onClose={() => setSelectedWorkItem(null)}
					onUpdate={onUpdate}
					existingShows={existingShows}
					existingMovies={existingMovies}
					onMovieUpdate={onMovieUpdate}
					onAddWork={onAddWork}
					onAddMovie={onAddMovie}
				/>
			)}
			{/* movie stuff */}
			{selectedMovie && onMovieUpdate && (
				<MovieDetails
					movie={selectedMovie}
					onClose={() => setSelectedWorkItem(null)}
					onUpdate={onMovieUpdate}
					existingMovies={existingMovies}
					existingShows={existingShows}
					onShowUpdate={onUpdate}
					onAddWork={onAddMovie}
					onAddShow={onAddWork}
				/>
			)}
			{pendingWork?.media_type === "movie" && (
				<AddMovie
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingMovies={existingMovies}
					onAddMovie={async (m) => {
						// route through the parent's data hook so the listing
						// updates without a refresh; fall back to a raw POST
						if (onAddMovie) {
							await onAddMovie(m);
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
		</>
	);
}
