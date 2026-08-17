import {
	Settings2,
	ChevronDown,
	ChevronUp,
	Circle,
	Search,
} from "lucide-react";
import Link from "next/link";
import { BaseMediaProps, MediaStatus, ColumnConfig } from "@/types/media";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loading } from "../../components/ui/Loading";
import { DesktopItem } from "./DesktopItem";
import { ShowsBadge } from "./ShowsBadge";

interface DesktopListingProps<T extends BaseMediaProps> {
	mediaItems: T[];
	isProcessing: boolean;
	// sort/filter
	sortConfig: { type: string; order: "asc" | "desc" } | null;
	statusOptions: MediaStatus[];
	curStatusFilter: MediaStatus | null;
	// [0]: author | [1]: dateReleased
	differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
	// search
	searchQuery: string;
	//
	mediaType: string;
	emptyListText: string;
	// callbacks
	onItemClicked: (item: T) => void;
	onSortConfig: (sortKey: string) => void;
	onSearchChange: (searchVal: string) => void;
	onStatusFilter: (Status: MediaStatus) => void;
}

export function DesktopListing<T extends BaseMediaProps>({
	mediaItems,
	isProcessing,
	sortConfig,
	statusOptions,
	curStatusFilter,
	differentColumns,
	searchQuery,
	mediaType,
	emptyListText,
	onItemClicked,
	onSortConfig,
	onSearchChange,
	onStatusFilter,
}: DesktopListingProps<T>) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [searchOpen, setSearchOpen] = useState(false);
	const searchBarRef = useRef<HTMLInputElement>(null);
	const statusFilterRef = useRef<HTMLDivElement>(null);
	const [openStatusOption, setOpenStatusOption] = useState(false);
	// row-height estimate scales with the fluid root font-size so the
	// scrollbar thumb doesn't visibly resize as rows are measured on 4K.
	const [rowEstimate, setRowEstimate] = useState(101);
	useEffect(() => {
		const update = () => {
			const root =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize,
				) || 16;
			setRowEstimate((101 / 16) * root);
		};
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);
	//
	const virtualizer = useVirtualizer({
		count: mediaItems.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowEstimate,
		overscan: 5,
		measureElement: (element) =>
			element?.getBoundingClientRect().height ?? rowEstimate,
		//
		useFlushSync: false,
	});
	//
	const ranks = useMemo(() => {
		if (sortConfig?.type !== "score") {
			return mediaItems.map((_, i) => i + 1);
		}

		const result: number[] = [];
		let currentRank = 1;

		for (let i = 0; i < mediaItems.length; i++) {
			if (i === 0) {
				result.push(currentRank);
				continue;
			}

			const prevScore = mediaItems[i - 1].score?.mu;
			const curScore = mediaItems[i].score?.mu;

			if (
				prevScore != null &&
				curScore != null &&
				prevScore === curScore
			) {
				result.push(result[i - 1]);
			} else {
				currentRank = i + 1;
				result.push(currentRank);
			}
		}

		return result;
	}, [mediaItems, sortConfig]);
	// use / to open search
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}
			//
			if (e.key === "/") {
				if (!searchOpen) {
					setSearchOpen(true);
					searchBarRef.current?.focus();
					e.preventDefault();
				}
			}
		};
		//
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [searchOpen]);
	// if click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				openStatusOption &&
				statusFilterRef.current &&
				!statusFilterRef.current.contains(e.target as Node)
			) {
				setOpenStatusOption(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [openStatusOption]);

	return (
		<div className="w-full md:w-[70%] lg:w-[65%] mx-auto flex flex-col h-screen">
			{/* STATUS FILTER */}
			<div
				className="fixed left-1 p-2 px-2.5 bg-linear-to-br from-zinc-900/80 to-zinc-950 border-zinc-700/50 shadow-lg shadow-black rounded-lg"
				ref={statusFilterRef}
				onClick={() => {
					setOpenStatusOption(!openStatusOption);
				}}
			>
				<div
					className={`
                    relative z-20 transition-all duration-300 ease-out rounded-md
                    ${openStatusOption ? "bg-zinc-800/60 p-2 -m-2" : ""}
                  `}
				>
					<Settings2
						className={`
                      w-5 h-5 transition-all duration-300 ease-out cursor-pointer
                      ${
							openStatusOption
								? "text-zinc-300 rotate-90 scale-110"
								: "text-zinc-400 rotate-0 scale-100"
						}
                    `}
					/>
				</div>
				{/* STATUS FILTER OPTIONS */}
				<div
					className={`
                    fixed left-0 mt-2 min-w-44 bg-linear-to-br from-zinc-900/95 to-zinc-950 backdrop-blur-xl
                    border border-zinc-800/40 rounded-lg shadow-2xl overflow-hidden
                    origin-top-left z-10
                    transition-all duration-300 ease-out
                    ${
						openStatusOption
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
					}
                  `}
				>
					{statusOptions.map((status, index) => (
						<div
							key={status}
							className={`
                        flex items-center justify-between px-4 py-3 text-zinc-300 text-sm
                        transition-all duration-200 ease-out cursor-pointer
                        hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-98
                        ${index !== statusOptions.length - 1 ? "border-b border-zinc-800/80" : ""}
                        ${curStatusFilter === status ? "bg-zinc-800/40" : ""}
                      `}
							style={{
								transitionDelay: openStatusOption
									? `${index * 30}ms`
									: "0ms",
							}}
							onClick={() => {
								onStatusFilter(status);
								setOpenStatusOption(false);
							}}
						>
							<span className="font-medium">{status}</span>
							<div
								className={`
                        transition-all duration-200 ease-out
                        ${
							curStatusFilter === status
								? "scale-100 opacity-100"
								: "scale-75 opacity-40"
						}
                      `}
							>
								{curStatusFilter === status ? (
									<div className="relative w-5 h-5">
										<Circle className="w-5 h-5 text-blue-400 absolute" />
										<div className="w-3 h-3 bg-blue-400/90 rounded-full absolute top-1 left-1 animate-pulse" />
									</div>
								) : (
									<Circle className="w-5 h-5 text-gray-500" />
								)}
							</div>
						</div>
					))}
				</div>
			</div>
			{/* SEARCH BUTTON/BAR */}
			<div className="fixed top-1 right-1 z-20">
				<div className="relative">
					{/* SEARCH BUTTON */}
					<div
						className={`flex items-center gap-2 bg-linear-to-bl from-zinc-900/80 to-zinc-950 border-zinc-700/50 shadow-lg shadow-black rounded-lg transition-all duration-300 ease-out ${
							searchOpen
								? "w-72 px-3 py-2"
								: "w-9 h-9 px-0 py-0 cursor-pointer hover:bg-zinc-800/70"
						}`}
						onClick={() => {
							if (!searchOpen) {
								setSearchOpen(true);
								searchBarRef.current?.focus();
							}
						}}
					>
						<Search
							className={`w-4 h-4 text-zinc-400/75 font-bold shrink-0 transition-all duration-300 ${
								searchOpen ? "ml-0" : "ml-2.5"
							}`}
						/>
						{/* SEARCH BAR */}
						<input
							type="text"
							ref={searchBarRef}
							value={searchQuery}
							onFocus={() => setSearchOpen(true)}
							onChange={(e) => {
								onSearchChange(e.target.value);
							}}
							onBlur={() => !searchQuery && setSearchOpen(false)}
							placeholder={"Search " + mediaType + "s..."}
							className={`bg-transparent text-sm text-zinc-100 font-medium placeholder-zinc-500 focus:outline-none flex-1 transition-all duration-300 ${
								searchOpen
									? "w-full opacity-100 pointer-events-auto"
									: "w-0 opacity-0 pointer-events-none"
							}`}
						/>
						{searchOpen && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onSearchChange("");
									setSearchOpen(false);
								}}
								className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors hover:cursor-pointer"
							>
								✕
							</button>
						)}
					</div>
				</div>
			</div>
			{/* HEADING */}
			<div className="sticky top-0 z-10 w-full">
				<div className="relative max-w-full mx-auto flex items-center gap-4 px-4 py-2 bg-zinc-900/75 backdrop-blur-xl border-x border-b border-zinc-800/50 rounded-b-lg select-none">
					{mediaType === "show" && (
						<Link
							href="/shows/discover"
							title="Browse shows"
							className="absolute -right-14 top-0 opacity-60 hover:opacity-80 hover:scale-105 transition-all duration-300 origin-top"
							onClick={(e) => e.stopPropagation()}
						>
							<ShowsBadge />
						</Link>
					)}
					{/* media type + count */}
					<div className="flex items-baseline gap-2 shrink-0">
						<span className="text-[0.6875rem] font-bold tracking-[0.22em] uppercase text-zinc-400">
							{mediaType}s
						</span>
						<span className="text-[0.75rem] font-mono text-zinc-500 tracking-tight">
							{mediaItems.length}
						</span>
					</div>
					{/* sort options pushed right */}
					<div className="flex items-center gap-0 ml-auto">
						{(
							[
								{ key: "title", label: "Title" },
								{ key: "score", label: "Score" },
								{
									key: differentColumns[0].sortKey,
									label: differentColumns[0].label,
								},
								{
									key: differentColumns[1].sortKey,
									label: differentColumns[1].label,
								},
								{ key: "dateCompleted", label: "Completed" },
							] as { key: string; label: string }[]
						).map(({ key, label }, i, arr) => {
							const active = sortConfig?.type === key;
							return (
								<div key={key} className="flex items-center">
									<button
										onClick={() => onSortConfig(key)}
										className={`flex items-center gap-1 px-3 py-0.5 text-[0.75rem] font-medium tracking-wide transition-all duration-200 cursor-pointer ${
											active
												? "text-zinc-100"
												: "text-zinc-500 hover:text-zinc-300"
										}`}
									>
										{active &&
											(sortConfig?.order === "desc" ? (
												<ChevronDown className="w-3 h-3 text-zinc-500" />
											) : (
												<ChevronUp className="w-3 h-3 text-zinc-500" />
											))}
										{label}
									</button>
									{i < arr.length - 1 && (
										<span className="text-zinc-700 text-xs select-none">
											|
										</span>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
			{/* LOADER */}
			{isProcessing && (
				<div className="relative bg-black/20 backdrop-blur-lg">
					<Loading
						customStyle="mt-72 h-12 w-12 border-gray-400"
						text=""
					/>
				</div>
			)}
			{/* NO MEDIA */}
			{!isProcessing && mediaItems.length === 0 && (
				<div className="text-center py-12">
					<p className="text-zinc-400 italic text-lg">
						{emptyListText}
					</p>
				</div>
			)}
			{/* LISTING */}
			{!isProcessing && mediaItems.length > 0 && (
				<div ref={parentRef} className="w-full overflow-auto flex-1">
					<div
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{virtualizer.getVirtualItems().map((virtualItem) => {
							const item = mediaItems[virtualItem.index];
							return (
								<div
									key={item.id}
									data-index={virtualItem.index}
									ref={virtualizer.measureElement}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualItem.start}px)`,
									}}
								>
									<DesktopItem
										item={item}
										index={virtualItem.index}
										total={mediaItems.length}
										rank={ranks[virtualItem.index]}
										mediaType={mediaType}
										onClick={onItemClicked}
										differentColumns={differentColumns}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
