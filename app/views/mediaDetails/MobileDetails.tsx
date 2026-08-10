import Image from "next/image";
import { Option } from "@/app/components/ui/Dropdown";
import { DirectorNames } from "../../movies/components/DirectorNames";
import { BaseMediaProps, ColumnConfig, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import { ShowProps } from "@/types/show";
import { useEffect, useRef, useState } from "react";
import { MobileScorePicker } from "@/app/components/ui/MobileScorePicker";
import {
	Plus,
	ChevronLeft,
	ChevronRight,
	ChevronsUp,
	RefreshCw,
	Check,
	X,
	List,
} from "lucide-react";
import { Loading } from "@/app/components/ui/Loading";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import { MobileAutoTextarea } from "@/app/components/ui/MobileAutoTextArea";
import { BookCoverConfig } from "@/app/books/components/BookCoverConfigDetails";
import { CoverColorPicker } from "@/app/books/components/CoverColorPicker";
import { MobileProgressPicker } from "@/app/components/ui/MobileSeasonEpPicker";
import { MobileSeriesNav } from "./shared/MobileSeriesNav";
import { calcCurProgress } from "@/app/shows/utils/progressCalc";
import { getDisplayScore } from "@/lib/tierConfig";
import { BookCoverProps, BookProps } from "@/types/book";

interface MobileDetailsProps<T extends BaseMediaProps> {
	item: T;
	localNote: string;
	onClose: () => void;
	isLoading?: { isTrue: boolean; style: string; text: string };
	isAdding: boolean;
	onAdd: () => void;
	statusOptions: Option[];
	mediaType: string;
	onAction: (action: { type: string; payload?: unknown }) => void;
	differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
	onSeriesNav?: (dir: "left" | "right") => void; // book + movie
	isInList?: (title: string) => boolean;
	canRefresh?: boolean;
	isSelecting?: boolean;
	coverUrls?: BookCoverProps[]; // book only
	coverIndex?: number; // book only
}

export function MobileDetails<T extends BaseMediaProps>({
	item,
	localNote,
	onClose,
	isLoading,
	isAdding,
	onAdd,
	statusOptions,
	mediaType,
	onAction,
	differentColumns,
	onSeriesNav,
	isInList,
	canRefresh,
	isSelecting,
	coverUrls,
	coverIndex,
}: MobileDetailsProps<T>) {
	// for movies only
	const canOpenDirector =
		mediaType === "movie" &&
		!isAdding &&
		!isSelecting &&
		!!differentColumns[0].getValue(item);

	// split director names
	const directorNames = canOpenDirector
		? String(differentColumns[0].getValue(item) ?? "")
				.split(",")
				.map((n) => n.trim())
				.filter(Boolean)
		: [];

	const [isProgressPickerOpen, setIsProgressPickerOpen] = useState(false);
	const [isScorePickerOpen, setIsScorePickerOpen] = useState(false);
	const [posterLoaded, setPosterLoaded] = useState(false);
	const [translateY, setTranslateY] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const startY = useRef(0);
	const startScrollY = useRef(0);
	const modalRef = useRef<HTMLDivElement>(null);
	const dragVelocity = useRef(0);
	const lastY = useRef(0);
	const lastTime = useRef(0);

	const s = item as unknown as SeriesMediaProps;
	const g = item as unknown as GameProps;
	const show = item as unknown as ShowProps;

	const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const elementWidth = rect.width;
		const isRightSide = clickX > elementWidth / 2;

		onAction({
			type: "changeCover",
			payload: isRightSide ? "next" : "prev",
		});
	};

	const colorPicker =
		mediaType === "book" && coverUrls && coverUrls.length > 0 ? (
			<CoverColorPicker
				key={coverUrls[coverIndex ?? 0]?.url}
				coverUrl={coverUrls[coverIndex ?? 0]?.url}
				currentColor={coverUrls[coverIndex ?? 0]?.color}
				onPick={(color) =>
					onAction({ type: "pickCoverColor", payload: color })
				}
			/>
		) : null;

	const handleTouchStart = (e: React.TouchEvent) => {
		if (isScorePickerOpen || isProgressPickerOpen) return;
		//
		const target = e.target as HTMLElement;
		if (
			target.closest("button") ||
			target.closest("textarea") ||
			target.closest("[data-no-drag]")
		) {
			return;
		}

		const modal = modalRef.current;
		if (!modal) return;

		if (modal.scrollTop < 3) {
			startY.current = e.touches[0].clientY;
			lastY.current = e.touches[0].clientY;
			lastTime.current = Date.now();
			startScrollY.current = modal.scrollTop;
			dragVelocity.current = 0;
			setIsDragging(true);
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging || isScorePickerOpen || isProgressPickerOpen) return;

		const modal = modalRef.current;
		if (!modal) return;

		const currentY = e.touches[0].clientY;
		const currentTime = Date.now();
		const deltaY = currentY - startY.current;

		const timeDelta = currentTime - lastTime.current;
		if (timeDelta > 0) {
			dragVelocity.current = (currentY - lastY.current) / timeDelta;
		}

		lastY.current = currentY;
		lastTime.current = currentTime;

		if (modal.scrollTop < 3 && deltaY > 0) {
			const resistance = Math.max(0.3, 1 - deltaY / 800);
			setTranslateY(deltaY * resistance);
		} else if (deltaY < 0) {
			setIsDragging(false);
			setTranslateY(0);
		}
	};

	const handleTouchEnd = () => {
		if (!isDragging) return;

		const threshold = 50;
		const velocityThreshold = 0.5;

		if (
			translateY > threshold ||
			dragVelocity.current > velocityThreshold
		) {
			const finalY = Math.max(
				translateY + dragVelocity.current * 200,
				window.innerHeight,
			);
			setTranslateY(finalY);
			setIsExiting(true);
			setTimeout(() => {
				onClose();
			}, 75);
		} else {
			setTranslateY(0);
		}

		setIsDragging(false);
		dragVelocity.current = 0;
	};

	useEffect(() => {
		// trigger mount animation
		requestAnimationFrame(() => {
			setIsVisible(true);
		});

		// NOOP IF IT AIN'T A PHONE
		if (window.matchMedia("(min-width: 1024px)").matches) return;

		// original values
		const originalOverflow = document.body.style.overflow;
		const originalPosition = document.body.style.position;
		const originalTop = document.body.style.top;
		const scrollY = window.scrollY;

		// lock body in place
		document.body.style.overflow = "hidden";
		document.body.style.position = "fixed";
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = "100%";

		return () => {
			document.body.style.overflow = originalOverflow;
			document.body.style.position = originalPosition;
			document.body.style.top = originalTop;
			document.body.style.width = "";
			window.scrollTo(0, scrollY);
		};
	}, []);

	return (
		<>
			<div
				ref={modalRef}
				className={`fixed inset-0 z-30 bg-zinc-950 flex flex-col ${
					isScorePickerOpen || isProgressPickerOpen
						? "overflow-hidden"
						: "overflow-y-auto"
				}`}
				style={{
					transform: `translateY(${translateY}px)`,
					opacity: isVisible ? 1 : 0,
					transition: isDragging
						? "none"
						: isExiting
							? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
							: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{isLoading?.isTrue && (
					<Loading
						customStyle={isLoading.style}
						text={isLoading.text}
						isMobile={true}
					/>
				)}
				{/* ACTION BAR */}
				{(posterLoaded || isAdding || isSelecting) && (
					<div className="sticky top-0 z-30">
						<div className="absolute top-0 left-0 right-0 mt-1.5 mx-0.5 flex items-center justify-between">
							{/* RELOAD METADATA FROM SOURCE */}
							{!isAdding && !isSelecting && canRefresh && (
								<button
									className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md active:scale-95 transition-transform duration-150"
									onClick={() =>
										onAction({ type: "refresh" })
									}
									title="Reload cover / series info"
								>
									<RefreshCw className="w-5 h-5 text-slate-400" />
								</button>
							)}
							{/* CONFIRM / CANCEL REFRESH PREVIEW */}
							{isSelecting && (
								<div className="flex items-center gap-2">
									{/* CHANGE SERIES */}
									{onSeriesNav && (
										<div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
											<button
												className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform duration-150"
												onClick={() =>
													onSeriesNav("left")
												}
											>
												<ChevronLeft className="w-5 h-5 text-gray-400" />
											</button>
											<button
												className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform duration-150"
												onClick={() =>
													onSeriesNav("right")
												}
											>
												<ChevronRight className="w-5 h-5 text-gray-400" />
											</button>
										</div>
									)}
									{mediaType === "book" && (
										<button
											className="bg-zinc-800/50 backdrop-blur-2xl p-2 px-2.5 rounded-md active:scale-95 transition-transform duration-150"
											onClick={() =>
												onAction({ type: "moreBooks" })
											}
											title="Other results"
										>
											<List className="w-5 h-5 text-slate-400" />
										</button>
									)}
									{colorPicker}
									<button
										className="bg-zinc-800/50 backdrop-blur-2xl p-2 px-2.5 rounded-md active:scale-95 transition-transform duration-150"
										onClick={() =>
											onAction({ type: "confirmRefresh" })
										}
										title="Apply"
									>
										<Check className="w-5 h-5 text-green-400" />
									</button>
									<button
										className="bg-zinc-800/50 backdrop-blur-2xl p-2 px-2.5 rounded-md active:scale-95 transition-transform duration-150"
										onClick={() =>
											onAction({ type: "cancelRefresh" })
										}
										title="Cancel"
									>
										<X className="w-5 h-5 text-red-300" />
									</button>
								</div>
							)}
							{isAdding && (
								<>
									{/* ADD BUTTON */}
									<button
										className="bg-zinc-800/50 backdrop-blur-2xl p-2 px-2.5 rounded-md active:scale-95 transition-transform duration-150"
										onClick={onAdd}
									>
										<Plus className="w-5 h-5 text-slate-400" />
									</button>
									{/* COVER COLORS */}
									{colorPicker}
									{/* COVER INDICATOR */}
									{mediaType === "book" &&
										coverUrls &&
										coverUrls.length > 1 &&
										coverIndex !== undefined && (
											<div className="p-1.5 px-2.5 bg-zinc-800/50 backdrop-blur-sm rounded-md">
												<span className="text-xs text-slate-400 font-medium">
													{coverIndex + 1}/
													{coverUrls.length}
												</span>
											</div>
										)}
									<div className="flex items-center gap-2">
										{/* DIFFERENT SERIES OPTIONS */}
										{onSeriesNav && (
											<div className="flex gap-1 bg-zinc-800/60 rounded-lg p-0.5">
												<button
													className="bg-zinc-800/50 p-2 rounded-md active:scale-95 transition-transform duration-150"
													onClick={() =>
														onSeriesNav("left")
													}
												>
													<ChevronLeft className="w-5 h-5 text-gray-400 transition-colors" />
												</button>
												<button
													className="bg-zinc-800/50 backdrop-blur-2xl p-2 px-2.5 rounded-md active:scale-95 transition-transform duration-150"
													onClick={() =>
														onSeriesNav("right")
													}
												>
													<ChevronRight className="w-5 h-5 text-gray-400 transition-colors" />
												</button>
											</div>
										)}
										{/* NEED YEAR */}
										<button
											className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5 active:scale-95 transition-transform duration-150"
											onClick={() => {
												onAction({
													type:
														mediaType === "book"
															? "moreBooks"
															: "needYearField",
												});
											}}
											title={
												mediaType === "book"
													? "See More Options"
													: "Search with year"
											}
										>
											<ChevronsUp className="w-5 h-5 text-slate-400 transition-colors" />
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				)}
				{/* INFO */}
				<div className="pb-10">
					{/* PIC */}
					<div
						className={`relative w-full overflow-hidden bg-zinc-900/40 transition-all duration-300 ${
							isDragging && "rounded-lg"
						} ${coverUrls && coverUrls.length > 1 ? "cursor-pointer" : ""}`}
						onClick={
							coverUrls && coverUrls.length > 1
								? handleCoverChange
								: undefined
						}
					>
						{mediaType === "book" ? (
							<BookCoverConfig
								coverUrl={
									(item as unknown as BookProps).cover?.url
								}
								title={item.title}
								coverUrls={coverUrls}
								coverIndex={coverIndex}
								onLoad={() => setPosterLoaded(true)}
								height={900}
								width={1280}
								sizes="100vw"
								quality={90}
								className="object-cover w-full"
							/>
						) : item.posterUrl ? (
							<Image
								src={item.posterUrl}
								alt={item.title || "Poster"}
								width={1280}
								height={900}
								className="object-cover w-full"
								onLoad={() => setPosterLoaded(true)}
							/>
						) : (
							<div className="h-64 bg-linear-to-br from-zinc-700 to-zinc-800" />
						)}
						{/* BOTTOM FADE */}
						<div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
					</div>
					<div className="px-4">
						<div className="mt-4">
							{/* SERIES TITLE */}
							{(() => {
								const seriesLabel =
									mediaType === "game"
										? g.dlcIndex !== 0
											? g.mainTitle
											: null
										: s.seriesTitle;

								return seriesLabel ? (
									<div className="text-zinc-400 text-sm font-semibold -mt-2.5">
										{seriesLabel}
									</div>
								) : (
									<div></div>
								);
							})()}
							<div className="flex justify-between">
								{/* TITLE */}
								<h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
									{item.title}
								</h1>
								{/* SCORE */}
								<div data-no-drag>
									<button
										onClick={() => {
											if (!item.score)
												setIsScorePickerOpen(true);
										}}
										className="relative text-zinc-300/90 font-bold bg-linear-to-br from-zinc-800/90 to-zinc-950 px-3.5 py-1.75 rounded-lg shadow-lg shadow-black"
									>
										<span className="relative z-10">
											{item.score?.mu != null
												? getDisplayScore(item.score.mu)
												: "-"}
										</span>
									</button>
								</div>
							</div>
							{/* AUTHOR/STUDIO/DIRECTOR AND DATES */}
							<div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
								<span className="min-w-0">
									{canOpenDirector ? (
										<DirectorNames
											names={directorNames}
											width="max-w-40"
											onPick={(name) =>
												onAction({
													type: "directorClick",
													payload: name,
												})
											}
											onMore={() =>
												onAction({
													type: "directorPicker",
												})
											}
										/>
									) : (
										differentColumns[0].getValue(item) ||
										"Unknown " + differentColumns[0].label
									)}
								</span>
								•
								<span>
									{differentColumns[1].getValue(item) ||
										"Unknown"}
								</span>
								{item.dateCompleted && (
									<>
										•
										<span>
											{formatDateShort(
												item.dateCompleted,
											)}
										</span>
									</>
								)}
							</div>
						</div>
						{/* PROGRESS BAR — show only */}
						{mediaType === "show" && show.seasons && (
							<div onClick={() => setIsProgressPickerOpen(true)}>
								<div className="mt-4.5 w-full bg-zinc-800/80 rounded-md h-1.5 overflow-hidden shadow-md shadow-black/50">
									<div
										className={`${getStatusBg(item.status)} h-1.5 transition-all duration-500 ease-out rounded-md`}
										style={{
											width: `${
												show.seasons?.[
													show.curSeasonIndex ?? 0
												]?.episode_count
													? calcCurProgress(
															show.seasons,
															show.curSeasonIndex ??
																0,
															show.curEpisode ??
																0,
														)
													: 100
											}%`,
										}}
									/>
								</div>
								<div className="mt-1 flex justify-between text-zinc-400 text-sm font-bold mb-0.5">
									<span>
										Season:{" "}
										{(show.curSeasonIndex ?? 0) + 1 || "-"}
									</span>
									<span>
										Episode: {show.curEpisode ?? "-"}
									</span>
								</div>
							</div>
						)}
						{/* STATUS */}
						<div className="mt-3" data-no-drag>
							<label className="text-zinc-400 text-xs font-medium">
								Status
							</label>
							<div className="pt-1 flex flex-wrap gap-2 pb-1">
								{statusOptions.map((status, index) => (
									<button
										key={status.value}
										onClick={() =>
											onAction({
												type: "changeStatus",
												payload: `${status.label}`,
											})
										}
										className={`${
											index === 3 ? "w-full" : "flex-1"
										} px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 shadow-lg shadow-black/50 ${
											status.label === item.status
												? `${getStatusBg(status.label)} text-zinc-100`
												: "text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60"
										}`}
									>
										{status.label}
									</button>
								))}
							</div>
						</div>
						{/* PREQUEL AND SEQUEL */}
						{mediaType !== "show" && (
							<MobileSeriesNav
								item={item}
								mediaType={mediaType}
								isAdding={isAdding}
								onAction={onAction}
								isInList={isInList}
							/>
						)}
						{/* NOTE */}
						<div
							className={`${mediaType === "show" ? "mt-1" : "mt-3"}`}
							data-no-drag
						>
							<label className="text-zinc-400 text-xs font-medium">
								Notes
							</label>
							<div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 focus-within:ring-1 focus-within:ring-zinc-700 transition-all duration-200 max-h-22 overflow-auto shadow-lg shadow-black/50">
								<MobileAutoTextarea
									value={localNote}
									onChange={(e) =>
										onAction({
											type: "changeNote",
											payload: e.target.value,
										})
									}
									onBlur={() =>
										onAction({ type: "saveNote" })
									}
									placeholder={
										"Add your thoughts about this " +
										mediaType +
										"..."
									}
									className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<MobileScorePicker
				isOpen={isScorePickerOpen}
				onClose={() => setIsScorePickerOpen(false)}
				onScoreChange={(tier) =>
					onAction({ type: "setInitialTier", payload: tier })
				}
			/>
			{mediaType === "show" && (
				<MobileProgressPicker
					isOpen={isProgressPickerOpen}
					seasons={show.seasons || []}
					curSeasonIndex={show.curSeasonIndex ?? 0}
					curEpisode={show.curEpisode ?? 1}
					onClose={() => setIsProgressPickerOpen(false)}
					onSeasonIndexChange={(seasonIndex) => {
						onAction({
							type: "changeSeasonNum",
							payload: seasonIndex,
						});
					}}
					onEpisodeChange={(episode) => {
						onAction({
							type: "changeEpisodeNum",
							payload: episode,
						});
					}}
				/>
			)}
		</>
	);
}
