"use client";
import {
	BookCoverProps,
	BookProps,
	BookSearchResult,
	BookSeriesAPIProps,
	DIFF_COLUMNS_BOOK,
} from "@/types/book";
import { useCallback, useEffect, useState } from "react";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { bookStatusOptions } from "@/utils/dropDownDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import { useScoreNudge } from "@/hooks/useScoreNudge";
import { useBookSearch } from "@/hooks/external/useBookSearch";
import {
	mapBookAPIDatatoBook,
	mapBookAPISeriesData,
} from "./utils/bookMapping";
import { ShowMultBooks } from "./components/ShowMultBooks";
import { AnimatePresence } from "framer-motion";

export type BookAction =
	| { type: "closeModal" }
	| { type: "delete" }
	| {
			type: "changeStatus";
			payload: "Completed" | "Want to Read" | "Dropped";
	  }
	| { type: "resetScore" }
	| { type: "nudgeScore"; payload: "up" | "down" }
	| { type: "setInitialTier"; payload: Tier }
	| { type: "changeNote"; payload: string }
	| { type: "saveNote" }
	| { type: "seriesNav"; payload: "sequel" | "prequel" }
	| { type: "changeCover"; payload: "next" | "prev" }
	| { type: "clearSeriesMeta" }
	| { type: "refresh" }
	| { type: "confirmRefresh" }
	| { type: "cancelRefresh" }
	| { type: "pickCoverColor"; payload: string }
	| { type: "moreBooks" };

interface BookDetailsProps {
	book: BookProps;
	onClose: () => void;
	isLoading?: { isTrue: boolean; style: string; text: string };
	onUpdate: (
		bookId: number,
		updates?: Partial<BookProps>,
		takeAction?: boolean,
	) => void;
	addBook?: () => void;
	showSequelPrequel?: (sequelTitle: string) => void;
	isInList?: (title: string) => boolean;
	showBookInSeries?: (seriesDir: "left" | "right") => void;
	onShowMore?: () => void;
	onRefresh?: (metadata: Partial<BookProps>) => Promise<void>;
	//
	coverUrls?: BookCoverProps[];
	coverIndex?: number;
	updateCoverIndex?: (newIndex: number) => void;
	updateCoverColor?: (color: string) => void;
}

export function BookDetails({
	onClose,
	book,
	onUpdate,
	addBook,
	isLoading,
	showBookInSeries, //when wiki gives more then 1 option
	showSequelPrequel,
	isInList,
	onShowMore,
	onRefresh,
	coverUrls,
	coverIndex,
	updateCoverIndex,
	updateCoverColor,
}: BookDetailsProps) {
	const [localNote, setLocalNote] = useState(book.note || "");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { searchForBooksMulti, searchForBookByKey, isBookSearching } =
		useBookSearch();
	// refresh preview state -- picks a cover before saving
	const [isSelecting, setIsSelecting] = useState(false);
	const [refreshCovers, setRefreshCovers] = useState<BookCoverProps[]>([]);
	const [refreshCoverIndex, setRefreshCoverIndex] = useState(0);
	const [refreshMeta, setRefreshMeta] = useState<Partial<BookProps>>({});
	//
	const [multResultsOpen, setMultResultsOpen] = useState(false);
	const [refreshResults, setRefreshResults] = useState<BookSearchResult[]>(
		[],
	);
	// cycle between the series a refreshed book belongs to
	const [refreshSeries, setRefreshSeries] = useState<BookSeriesAPIProps[]>(
		[],
	);
	const [refreshSeriesIndex, setRefreshSeriesIndex] = useState(0);

	// manual +/- 0.1 score tweaks -- phi tightens once, on close
	const { nudge: nudgeScore, commit: commitScoreNudge } = useScoreNudge(
		book,
		onUpdate,
	);

	const handleAction = (action: BookAction) => {
		switch (action.type) {
			// =========modal actions=============
			case "closeModal":
				handleModalClose();
				break;
			case "delete":
				handleDelete();
				break;
			// =========update actions=============
			case "changeStatus":
				handleStatusChange(action.payload);
				break;
			case "setInitialTier":
				onUpdate(book.id, {
					score: {
						mu: getSeedMu(action.payload),
						phi: TIER_PHI_THRESHOLD[action.payload],
					},
				});
				break;
			case "resetScore":
				onUpdate(book.id, { score: null });
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
			case "changeCover":
				if (isSelecting) handleSelectCoverChange(action.payload);
				else handleCoverChange(action.payload);
				break;
			case "clearSeriesMeta":
				if (book.seriesTitle) {
					onUpdate(book.id, {
						seriesTitle: null,
						placeInSeries: null,
						prequel: null,
						sequel: null,
					});
				}
				break;
			// =========other actions=============
			case "seriesNav":
				handleSeriesOpen(action.payload);
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
			case "pickCoverColor":
				handlePickCoverColor(action.payload);
				break;
			case "moreBooks":
				if (isSelecting) handleShowRefreshResults();
				else onShowMore?.();
				break;
		}
	};

	const handleShowRefreshResults = async () => {
		setMultResultsOpen(true);
		const q = [book.title, book.author].filter(Boolean).join(" ");
		const results = await searchForBooksMulti(q);
		setRefreshResults(results || []);
	};

	const handlePickRefreshResult = async (candidate: BookSearchResult) => {
		setMultResultsOpen(false);
		setIsRefreshing(true);
		try {
			const full = await searchForBookByKey(candidate.key);
			if (!full) return;
			const mapped = mapBookAPIDatatoBook(full);
			const seriesData = mapBookAPISeriesData(full.series);
			setRefreshMeta({
				key: full.key,
				title: mapped.title,
				author: mapped.author,
				datePublished: mapped.datePublished,
				numPages: mapped.numPages,
				rating: mapped.rating,
				seriesTitle: seriesData.seriesTitle,
				placeInSeries: seriesData.placeInSeries,
				prequel: seriesData.prequel,
				sequel: seriesData.sequel,
			});
			setRefreshCovers(full.covers ?? []);
			setRefreshCoverIndex(0);
			setRefreshSeries(full.series ?? []);
			setRefreshSeriesIndex(0);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handlePickCoverColor = (color: string) => {
		if (isSelecting) {
			setRefreshCovers((prev) =>
				prev.map((c, i) =>
					i === refreshCoverIndex ? { ...c, color } : c,
				),
			);
		} else {
			updateCoverColor?.(color);
		}
	};

	const handleRefreshSeriesChange = (dir: "left" | "right") => {
		if (refreshSeries.length < 2) return;
		const newIndex =
			dir === "left"
				? refreshSeriesIndex === 0
					? refreshSeries.length - 1
					: refreshSeriesIndex - 1
				: refreshSeriesIndex === refreshSeries.length - 1
					? 0
					: refreshSeriesIndex + 1;
		setRefreshSeriesIndex(newIndex);
		const sd = mapBookAPISeriesData(refreshSeries, newIndex);
		setRefreshMeta((prev) => ({
			...prev,
			seriesTitle: sd.seriesTitle,
			placeInSeries: sd.placeInSeries,
			prequel: sd.prequel,
			sequel: sd.sequel,
		}));
	};

	const handleSelectCoverChange = (dir: "next" | "prev") => {
		if (!refreshCovers.length) return;
		setRefreshCoverIndex((i) =>
			dir === "next"
				? (i + 1) % refreshCovers.length
				: i === 0
					? refreshCovers.length - 1
					: i - 1,
		);
	};

	// reload via key
	const handleRefresh = async () => {
		if (!onRefresh || !book.key || isRefreshing || isSelecting) return;
		setIsRefreshing(true);
		try {
			const response = await searchForBookByKey(book.key);
			if (!response) return;
			const mapped = mapBookAPIDatatoBook(response);
			const seriesData = mapBookAPISeriesData(response.series);
			// `total` from seriesData is omitted -- not stored
			const meta: Partial<BookProps> = {
				numPages: mapped.numPages,
				rating: mapped.rating,
				seriesTitle: seriesData.seriesTitle,
				placeInSeries: seriesData.placeInSeries,
				prequel: seriesData.prequel,
				sequel: seriesData.sequel,
			};
			const covers = response.covers ?? [];
			// start on the cover closest to the one already saved
			const startIdx = covers.findIndex((c) => c.url === book.cover?.url);
			setRefreshMeta(meta);
			setRefreshCovers(covers);
			setRefreshCoverIndex(startIdx >= 0 ? startIdx : 0);
			setRefreshSeries(response.series ?? []);
			setRefreshSeriesIndex(0);
			setIsSelecting(true);
		} finally {
			setIsRefreshing(false);
		}
	};

	// apply the previewed cover + metadata
	const handleConfirmRefresh = async () => {
		if (!onRefresh) return;
		const meta: Partial<BookProps> = { ...refreshMeta };
		if (refreshCovers.length) meta.cover = refreshCovers[refreshCoverIndex];
		exitSelecting();
		await onRefresh(meta);
	};

	const handleCancelRefresh = () => {
		exitSelecting();
	};

	const exitSelecting = () => {
		setIsSelecting(false);
		setRefreshCovers([]);
		setRefreshCoverIndex(0);
		setRefreshMeta({});
		setMultResultsOpen(false);
		setRefreshResults([]);
		setRefreshSeries([]);
		setRefreshSeriesIndex(0);
	};

	const handleStatusChange = (value: string) => {
		const newStatus = value as "Completed" | "Want to Read";
		const statusLoad: Partial<BookProps> = {
			status: newStatus,
		};
		if (newStatus === "Completed") {
			statusLoad.dateCompleted = new Date();
		} else if (book.dateCompleted) {
			statusLoad.dateCompleted = null;
		}
		onUpdate(book.id, statusLoad);
	};

	const handleCoverChange = (dir: string) => {
		if (!updateCoverIndex || coverIndex === undefined || !coverUrls) {
			return;
		}
		//
		let newCoverIndex = coverIndex;
		if (dir === "next") {
			newCoverIndex = (coverIndex + 1) % coverUrls.length;
		} else if (dir === "prev") {
			newCoverIndex =
				coverIndex === 0 ? coverUrls.length - 1 : coverIndex - 1;
		}
		updateCoverIndex(newCoverIndex);
	};

	const handleSeriesOpen = (seriesDir: string) => {
		if (!showSequelPrequel) return;
		const targetTitle = seriesDir === "sequel" ? book.sequel : book.prequel;
		if (targetTitle) {
			showSequelPrequel(targetTitle);
		}
	};

	const handleSaveNote = () => {
		if (localNote !== book.note) {
			onUpdate(book.id, { note: localNote });
		}
	};

	const handleDelete = () => {
		onClose();
		const shouldDelete = true;
		onUpdate(book.id, undefined, shouldDelete);
	};

	const handleModalClose = () => {
		// fold the deferred phi drop into the update this close flushes
		commitScoreNudge();
		// if (addBook) return;
		onClose();
	};

	const handleAddBook = useCallback(() => {
		if (!addBook) return;
		addBook();
	}, [addBook]);

	// need to reset local note -- since changing book (seuqel/prequel) doesn't remount
	useEffect(() => {
		setLocalNote(book.note || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [book.id]);

	useEffect(() => {
		const handleLeave = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				const activeElement = document.activeElement;
				const isInTextarea = activeElement?.tagName === "TEXTAREA";
				const isInInput = activeElement?.tagName === "INPUT";
				if (!isInTextarea && !isInInput) {
					handleAddBook();
				}
			}
		};
		//
		window.addEventListener("keydown", handleLeave);
		return () => window.removeEventListener("keydown", handleLeave);
	}, [onClose, handleAddBook]);

	if (!book) return null;

	const displayLoading = isRefreshing
		? {
				isTrue: true,
				style: "h-8 w-8 border-emerald-400",
				text: "Reloading...",
			}
		: isLoading;

	// apply refresh to preview
	const previewBook = isSelecting
		? {
				...book,
				...refreshMeta,
				cover: refreshCovers[refreshCoverIndex] ?? book.cover,
			}
		: book;

	return (
		<>
			<div className="lg:block hidden">
				<DesktopDetails
					item={previewBook}
					localNote={localNote}
					statusOptions={bookStatusOptions}
					mediaType="book"
					isLoading={displayLoading}
					isAdding={!!addBook}
					onAdd={handleAddBook}
					onClose={handleModalClose}
					onSeriesNav={
						isSelecting
							? refreshSeries.length > 1
								? handleRefreshSeriesChange
								: undefined
							: showBookInSeries
					}
					canRefresh={!!onRefresh}
					isInList={isInList}
					isSelecting={isSelecting}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_BOOK}
					coverUrls={isSelecting ? refreshCovers : coverUrls}
					coverIndex={isSelecting ? refreshCoverIndex : coverIndex}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileDetails
					item={previewBook}
					localNote={localNote}
					statusOptions={bookStatusOptions}
					mediaType="book"
					isLoading={displayLoading}
					isAdding={!!addBook}
					onAdd={handleAddBook}
					onClose={handleModalClose}
					onSeriesNav={
						isSelecting
							? refreshSeries.length > 1
								? handleRefreshSeriesChange
								: undefined
							: showBookInSeries
					}
					canRefresh={!!onRefresh}
					isInList={isInList}
					isSelecting={isSelecting}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_BOOK}
					coverUrls={isSelecting ? refreshCovers : coverUrls}
					coverIndex={isSelecting ? refreshCoverIndex : coverIndex}
				/>
			</div>
			{/* PICK A DIFFERENT RESULT (refresh) */}
			<AnimatePresence>
				{multResultsOpen && (
					<ShowMultBooks
						key="mult-refresh"
						onClose={() => setMultResultsOpen(false)}
						books={refreshResults}
						prompt={book.title}
						onClickedBook={handlePickRefreshResult}
						isLoading={isBookSearching}
					/>
				)}
			</AnimatePresence>
		</>
	);
}
