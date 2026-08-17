"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ModalBackdrop } from "@/app/components/ui/ModalMotion";
import { Clapperboard } from "lucide-react";
//
import { MovieProps } from "@/types/movie";
//
import {
	mapMetaToMovie,
	mapSeriesToMovie,
} from "@/app/movies/utils/movieMapping";
//
import { MovieDetails } from "./MovieDetailsHub";
//
import { useMovieSearch } from "@/hooks/external/useMovieSearch";
import { buildCover } from "@/utils/coverColor";
interface AddMovieProps {
	isOpen: boolean;
	onClose: () => void;
	existingMovies: MovieProps[];
	// resolves true when the score battler took over the flow
	onAddMovie: (item: MovieProps) => void | Promise<boolean | void>;
	titleFromAbove?: string;
	// keeps prequel/sequel jumps alive while previewing an unadded movie
	onSeriesNav?: (targetTitle: string) => void;
	isInList?: (title: string) => boolean;
}

export function AddMovie({
	isOpen,
	onClose,
	onAddMovie,
	existingMovies,
	titleFromAbove,
	onSeriesNav,
	isInList,
}: AddMovieProps) {
	//failure reasons && their fixes -- for user
	const [failedReason, setFailedReason] = useState("");
	//
	const [needYear, setNeedYear] = useState(false);
	const [activeModal, setActiveModal] = useState<"movieDetails" | null>(null);
	//
	const titleToSearch = useRef<HTMLInputElement>(null);
	const yearToSearch = useRef<HTMLInputElement>(null);
	const [isDupTitle, setIsDupTitle] = useState(false);
	//
	const [newMovie, setNewMovie] = useState<Partial<MovieProps>>({});
	//
	const [logoUrls, setLogoUrls] = useState<string[]>([]);
	const [logoIndex, setLogoIndex] = useState(0);
	//
	const [posterUrls, setPosterUrls] = useState<string[]>([]);
	const [posterIndex, setPosterIndex] = useState(0);
	const [backdropUrls, setBackdropUrls] = useState<string[]>([]);
	const [backdropIndex, setBackdropIndex] = useState(0);
	//
	const { searchForMovie, isMovieSearching } = useMovieSearch();

	const reset = useCallback(() => {
		setFailedReason("");
		setIsDupTitle(false);
		setNeedYear(false);
		//
		setActiveModal(null);
		setNewMovie({});
		setLogoUrls([]);
		setLogoIndex(0);
		setPosterUrls([]);
		setPosterIndex(0);
		setBackdropUrls([]);
		setBackdropIndex(0);
		if (titleToSearch.current) {
			titleToSearch.current.value = "";
			titleToSearch.current.focus();
		}
		if (yearToSearch.current) {
			yearToSearch.current.value = "";
		}
	}, []);

	const handleMovieSearch = useCallback(async () => {
		setActiveModal("movieDetails");
		//
		const titleSearching = titleToSearch.current?.value.trim();
		if (!titleSearching) return;
		const yearSearchingStr = yearToSearch.current?.value.trim();
		const yearSearching = yearSearchingStr
			? parseInt(yearSearchingStr, 10)
			: undefined;
		//
		const movieData = await searchForMovie(titleSearching, yearSearching);
		// dup logic --- NEEDS TO BE ABOVE EMPTY LOGIC CAUSE REPSONSE IS EMPTY
		if (movieData && "isDuplicate" in movieData) {
			setFailedReason(`Already Have Movie: ${movieData.title}`);
			setIsDupTitle(true);
			// dups open up need year pipe
			setNeedYear(true);
			setActiveModal(null);
			setTimeout(() => {
				yearToSearch.current?.focus();
			}, 0);
			return;
		}
		// empty
		if (!movieData?.imdbId || !movieData.title) {
			setFailedReason("Could Not Find Movie.");
			setNeedYear(true);
			setActiveModal(null);
			setTimeout(() => {
				yearToSearch.current?.focus();
			}, 0);
			return;
		}
		//format movie
		const mappedMovie = mapMetaToMovie(movieData);
		const mappedSeries = mapSeriesToMovie(movieData.series);
		setNewMovie({
			...mappedMovie,
			...mappedSeries,
		});
		setLogoUrls(movieData.logos ?? []);
		setLogoIndex(0);
		setPosterUrls(movieData.posters ?? []);
		setPosterIndex(0);
		setBackdropUrls(movieData.backdrops ?? []);
		setBackdropIndex(0);
		//
		const cover = await buildCover(mappedMovie.cover?.url);
		if (cover) setNewMovie((prev) => ({ ...prev, cover }));
	}, [searchForMovie]);

	// reread color
	useEffect(() => {
		const url = posterUrls[posterIndex];
		if (!url) return;
		let alive = true;
		buildCover(url).then((cover) => {
			if (alive && cover) setNewMovie((prev) => ({ ...prev, cover }));
		});
		return () => {
			alive = false;
		};
	}, [posterUrls, posterIndex]);

	const handleMovieDetailsUpdates = useCallback(
		async (
			_movieId: number,
			updates?: Partial<MovieProps>,
			needYearField?: boolean,
		) => {
			if (needYearField) {
				setActiveModal(null);
				setNeedYear(true);
				setTimeout(() => {
					yearToSearch.current?.focus();
				}, 0);
				return;
			}
			setNewMovie((prev) => ({ ...prev, ...updates }));
		},
		[],
	);

	const handleMovieAdd = async () => {
		// double check not adding duplicate
		if (newMovie.imdbId && isDupTitle) {
			return;
		}
		//
		let isStatus = newMovie.status;
		if (!isStatus) {
			isStatus = "Want to Watch";
		}
		const finalMovie = {
			...newMovie,
			status: isStatus,
			// when logo text set to null
			...(logoUrls.length
				? { logoUrl: logoUrls[logoIndex] ?? null }
				: {}),
			// cover already tracks the picked poster
			...(backdropUrls.length
				? { backdropUrl: backdropUrls[backdropIndex] }
				: {}),
		};
		const isBattling = await onAddMovie(finalMovie as MovieProps);
		if (!isBattling) onClose();
	};

	const handleMovieDetailsClose = () => {
		reset();
		setActiveModal(null);
		if (titleFromAbove) {
			onClose();
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.stopPropagation();
			handleMovieSearch();
		}
	};

	const eraseErrMsg = () => {
		if (failedReason) {
			setFailedReason("");
			setIsDupTitle(false);
		}
	};

	//reset on both because sometimes when opening some ui artificate
	useEffect(() => {
		reset();
	}, [isOpen, reset]);

	// useEffect(() => {
	//   if (activeModal === null && !failedReason) {
	//     reset();
	//   }
	// }, [activeModal, reset, failedReason]);

	// for when to search movie without modal
	useEffect(() => {
		if (titleFromAbove) {
			if (titleToSearch.current) {
				titleToSearch.current.value = titleFromAbove;
			}
			// reset for jump
			if (yearToSearch.current) {
				yearToSearch.current.value = "";
			}
			handleMovieSearch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [titleFromAbove]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		//
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	if (!isOpen) return null;

	return (
		<ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
			<div className="fixed inset-0" onClick={onClose} />
			{!titleFromAbove || needYear || isDupTitle ? (
				<div className="bg-linear-to-b from-zinc-950/80 to-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
					<h2 className="text-xl font-semibold mb-4 text-zinc-300/90 flex justify-center items-center gap-2">
						<Clapperboard className="w-5 h-5 text-zinc-300/90" />
						Search for New Movie
					</h2>
					<div className="flex gap-3">
						<input
							type="text"
							ref={titleToSearch}
							placeholder="Search for movie..."
							onKeyDown={handleKeyPress}
							onInput={eraseErrMsg}
							disabled={isMovieSearching}
							className="w-full bg-zinc-800/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-300 font-medium placeholder-zinc-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-900/50 outline-none transition-all duration-200 shadow-lg shadow-black/20"
						/>
						{needYear && (
							<div className="">
								<input
									type="number"
									ref={yearToSearch}
									placeholder="Release Year"
									onKeyDown={handleKeyPress}
									onInput={eraseErrMsg}
									disabled={isMovieSearching}
									className="w-full bg-zinc-800/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-300 font-medium placeholder-zinc-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-900/50 outline-none transition-all duration-200"
								/>
							</div>
						)}
					</div>
					<div className="flex justify-between mx-2">
						{failedReason && !isMovieSearching && (
							<div className="mt-3 text-zinc-400 text-sm font-medium">
								{failedReason}
							</div>
						)}
					</div>
				</div>
			) : (
				<input
					type="text"
					ref={titleToSearch}
					disabled
					style={{ display: "none" }}
				/>
			)}
			{activeModal === "movieDetails" && (
				<MovieDetails
					movie={newMovie as MovieProps}
					onClose={handleMovieDetailsClose}
					onUpdate={handleMovieDetailsUpdates}
					addMovie={handleMovieAdd}
					existingMovies={existingMovies}
					showSequelPrequel={onSeriesNav}
					isInList={isInList}
					isLoading={{
						isTrue: isMovieSearching,
						style: "h-8 w-8 border-emerald-400",
						text: "Searching...",
					}}
					logoUrls={logoUrls}
					logoIndex={logoIndex}
					updateLogoIndex={setLogoIndex}
					posterUrls={posterUrls}
					posterIndex={posterIndex}
					updatePosterIndex={setPosterIndex}
					backdropUrls={backdropUrls}
					backdropIndex={backdropIndex}
					updateBackdropIndex={setBackdropIndex}
				/>
			)}
		</ModalBackdrop>
	);
}
