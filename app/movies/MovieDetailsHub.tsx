"use client";
import { DIFF_COLUMNS_MOVIE, MovieProps } from "@/types/movie";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import {
	ActorWork,
	CastMember,
	fetchActorWorks,
	fetchMovieCast,
} from "../../utils/getActorInfo";
import ShowModal from "../components/ActorModal";
import { AddShow } from "@/app/shows/AddShow";
import { AddMovie } from "@/app/movies/AddMovie";
import { useAuthFetch } from "@/app/auth/hooks/useAuthFetch";

export type MovieAction =
	| { type: "closeModal" }
	| { type: "delete" }
	| {
			type: "changeStatus";
			payload: "Completed" | "Want to Watch" | "Dropped";
	  }
	| { type: "resetScore" }
	| { type: "setInitialTier"; payload: Tier }
	| { type: "changeNote"; payload: string }
	| { type: "saveNote" }
	| { type: "seriesNav"; payload: "sequel" | "prequel" }
	| { type: "clearSeriesMeta" }
	| { type: "needYearField" }
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
	showAnotherSeries?: (seriesDir: "left" | "right") => void;
	existingMovies?: MovieProps[];
}

export function MovieDetails({
	onClose,
	movie,
	onUpdate,
	addMovie,
	isLoading,
	showSequelPrequel,
	showAnotherSeries,
	existingMovies = [],
}: MovieDetailsProps) {
	const [localNote, setLocalNote] = useState(movie.note || "");
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
	const [selectedWorkMovie, setSelectedWorkMovie] =
		useState<MovieProps | null>(null);
	const { authFetch } = useAuthFetch();

	const handleWorkClick = useCallback((work: ActorWork) => {
		setPendingWork(work);
	}, []);

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
			case "cast":
				handleCast();
				break;
		}
	};

	const handleCast = async () => {
		setCastOpen(true);
		setCastLoading(true);
		try {
			setCast(await fetchMovieCast(movie.tmdbId ?? "-1", movie.imdbId, movie.id, authFetch));
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
		onClose();
	}, [addMovie, onClose]);

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

	return (
		<>
			<div className="lg:block hidden">
				<DesktopDetails
					item={movie}
					localNote={localNote}
					statusOptions={movieStatusOptions}
					mediaType="movie"
					isLoading={isLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={onClose}
					onSeriesNav={showAnotherSeries}
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
					isLoading={isLoading}
					isAdding={!!addMovie}
					onAdd={handleAddMovie}
					onClose={onClose}
					onSeriesNav={showAnotherSeries}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_MOVIE}
				/>
			</div>
			{castOpen && (
				<ShowModal
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
				/>
			)}
			{pendingWork?.media_type === "tv" && (
				<AddShow
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingShows={[]}
					onAddShow={async (s) => {
						await authFetch("/api/shows", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(s),
						});
						setPendingWork(null);
					}}
				/>
			)}
			{pendingWork?.media_type === "movie" && (
				<AddMovie
					isOpen={true}
					titleFromAbove={pendingWork.title}
					onClose={() => setPendingWork(null)}
					existingMovies={existingMovies}
					onAddMovie={async (m) => {
						await authFetch("/api/movies", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(m),
						});
						setPendingWork(null);
					}}
				/>
			)}
			{selectedWorkMovie && (
				<MovieDetails
					movie={selectedWorkMovie}
					onClose={() => setSelectedWorkMovie(null)}
					onUpdate={onUpdate}
					existingMovies={existingMovies}
				/>
			)}
		</>
	);
}
