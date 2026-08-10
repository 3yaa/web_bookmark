"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ModalBackdrop } from "@/app/components/ui/ModalMotion";
import { Book } from "lucide-react";
//
import { BookProps, BookCoverProps, BookSearchResult } from "@/types/book";
import { SeriesAPIProps } from "@/types/media";
//
import {
	mapBookAPIDatatoBook,
	mapBookAPISeriesData,
} from "@/app/books/utils/bookMapping";
import { cleanName } from "@/utils/cleanName";
//
import { BookDetails } from "./BookDetailsHub";
import { ShowMultBooks } from "./components/ShowMultBooks";
import { AnimatePresence } from "framer-motion";
//
import { useBookSearch } from "@/hooks/external/useBookSearch";

interface AddBookProps {
	isOpen: boolean;
	onClose: () => void;
	existingBooks: BookProps[];
	// resolves true when the score battler took over the flow
	onAddBook: (item: BookProps) => void | Promise<boolean | void>;
	titleFromAbove?: string;
}

export function AddBook({
	isOpen,
	onClose,
	onAddBook,
	titleFromAbove,
}: AddBookProps) {
	//failure reasons && their fixes -- for user
	const [failedReason, setFailedReason] = useState("");
	//
	const [activeModal, setActiveModal] = useState<
		"bookDetails" | "multOptions" | null
	>(null);
	//
	const titleToSearch = useRef<HTMLInputElement>(null);
	const [isDupTitle, setIsDupTitle] = useState(false);
	//
	const [newBook, setNewBook] = useState<Partial<BookProps>>({});
	const [series, setSeries] = useState<SeriesAPIProps[]>([]);
	const [seriesIndex, setSeriesIndex] = useState(0);
	//
	const [covers, setCovers] = useState<BookCoverProps[]>([]);
	const [coverIndex, setCoverIndex] = useState(0);
	// multi-result picker
	const [allNewBooks, setAllNewBooks] = useState<BookSearchResult[]>([]);
	//
	const { searchForBooks, searchForBooksMulti, searchForBookByKey, isBookSearching } =
		useBookSearch();

	const reset = useCallback(() => {
		setFailedReason("");
		setIsDupTitle(false);
		//
		setActiveModal(null);
		setNewBook({});
		setCovers([]);
		setCoverIndex(0);
		setAllNewBooks([]);
		if (titleToSearch.current) {
			titleToSearch.current.value = "";
			titleToSearch.current.focus();
		}
	}, []);

	const handleBookSearch = useCallback(async () => {
		setActiveModal("bookDetails");
		//
		const titleSearching = titleToSearch.current?.value.trim();
		if (!titleSearching) return null;
		//
		const response = await searchForBooks(titleSearching);
		// error
		if (!response) return null;
		if (!response?.key || !response.title) {
			setFailedReason("Could Not Find Book.");
			setActiveModal(null);
			return;
		}
		// dup logic
		if (response && "isDuplicate" in response) {
			setFailedReason(`Already Have Book: ${response.title}`);
			setIsDupTitle(true);
			setActiveModal(null);
			return;
		}
		//save books
		setCovers(response.covers || []);
		setNewBook({
			...mapBookAPIDatatoBook(response),
			status: "Want to Read",
			...mapBookAPISeriesData(response.series),
		}); //main
		setSeries(response.series);
		setCovers(response.covers);
	}, [searchForBooks]);

	const handleShowMore = useCallback(async () => {
		const q = titleToSearch.current?.value.trim();
		if (!q) return;
		setActiveModal("multOptions");
		const results = await searchForBooksMulti(q);
		setAllNewBooks(results || []);
	}, [searchForBooksMulti]);

	// picked a specific result -- fetch its full record and show it
	const handlePickFromMultBooks = useCallback(
		async (candidate: BookSearchResult) => {
			setActiveModal("bookDetails");
			const full = await searchForBookByKey(candidate.key);
			if (!full) {
				setFailedReason("Could Not Load Book.");
				setActiveModal(null);
				return;
			}
			setSeries(full.series || []);
			setSeriesIndex(0);
			setCovers(full.covers || []);
			setCoverIndex(0);
			setNewBook({
				...mapBookAPIDatatoBook(full),
				status: "Want to Read",
				...mapBookAPISeriesData(full.series),
			});
		},
		[searchForBookByKey],
	);

	const handleBookDetailsUpdates = useCallback(
		async (_bookId: number, updates?: Partial<BookProps>) => {
			setNewBook((prev) => ({ ...prev, ...updates }));
		},
		[],
	);

	const handleBookAdd = async () => {
		// double check not adding duplicate
		if (newBook.key && isDupTitle) {
			return;
		}

		const finalBook = {
			...newBook,
			cover: covers[coverIndex],
			...mapBookAPISeriesData(series, seriesIndex),
		};
		console.log(finalBook);
		// only close when the battler did not take over -- closing
		// would clear the very item it is scoring
		const isBattling = await onAddBook(finalBook as BookProps);
		if (!isBattling) onClose();
	};

	const handleSeriesChange = useCallback(
		(option: "left" | "right") => {
			// loop
			const newSeriesIndex = ((direction: "left" | "right") => {
				const length = series.length;
				if (direction === "left") {
					return seriesIndex === 0 ? length - 1 : seriesIndex - 1;
				}
				return seriesIndex === length - 1 ? 0 : seriesIndex + 1;
			})(option);
			// series mapping
			setSeriesIndex(newSeriesIndex);
			const mappedSeriesData = mapBookAPISeriesData(
				series,
				newSeriesIndex,
			);
			setNewBook((prev) => {
				const updated = {
					...prev,
					title: cleanName(prev.title, mappedSeriesData.seriesTitle),
					...mappedSeriesData,
				};
				return updated;
			});
		},
		[series, seriesIndex],
	);

	const handleBookDetailsClose = () => {
		reset();
		setActiveModal(null);
		if (titleFromAbove) {
			onClose();
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.stopPropagation();
			handleBookSearch();
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

	// for when to search book without modal
	useEffect(() => {
		if (titleFromAbove) {
			if (titleToSearch.current) {
				titleToSearch.current.value = titleFromAbove;
			}
			handleBookSearch();
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
		<ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
			{/* maybe not allow user to close modal as new book coming? */}
			<div className="fixed inset-0" onClick={onClose} />
			{!titleFromAbove || !!failedReason ? (
				<div className="bg-linear-to-b from-zinc-950/80 to-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200 relative">
					<h2 className="text-xl font-semibold mb-4 text-zinc-300/90 flex justify-center items-center gap-2">
						<Book className="w-5 h-5 text-zinc-300/90" />
						Search for New Book
					</h2>
					<div className="flex gap-3">
						<input
							type="text"
							ref={titleToSearch}
							placeholder="Search for book..."
							onKeyDown={handleKeyPress}
							onInput={eraseErrMsg}
							disabled={isBookSearching}
							className="w-full bg-zinc-800/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-300 font-medium placeholder-zinc-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-900/50 outline-none transition-all duration-200 shadow-lg shadow-black/20"
						/>
					</div>
					<div className="flex justify-between mx-2">
						{failedReason && !isBookSearching && (
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
			{activeModal === "bookDetails" && (
				<BookDetails
					book={newBook as BookProps}
					onClose={handleBookDetailsClose}
					onUpdate={handleBookDetailsUpdates}
					addBook={handleBookAdd}
					isLoading={{
						isTrue: isBookSearching,
						style: "h-8 w-8 border-emerald-400",
						text: "Searching...",
					}}
					showBookInSeries={
						series.length > 1 ? handleSeriesChange : undefined
					}
					onShowMore={handleShowMore}
					coverUrls={covers}
					coverIndex={coverIndex}
					updateCoverIndex={(newIndex: number) =>
						setCoverIndex(newIndex)
					}
					updateCoverColor={(color: string) =>
						setCovers((prev) =>
							prev.map((c, i) =>
								i === coverIndex ? { ...c, color } : c,
							),
						)
					}
				/>
			)}
			<AnimatePresence>
				{activeModal === "multOptions" && (
					<ShowMultBooks
						key="mult"
						onClose={() => setActiveModal("bookDetails")}
						books={allNewBooks}
						prompt={titleToSearch.current?.value || ""}
						onClickedBook={handlePickFromMultBooks}
						isLoading={isBookSearching}
					/>
				)}
			</AnimatePresence>
		</ModalBackdrop>
	);
}
