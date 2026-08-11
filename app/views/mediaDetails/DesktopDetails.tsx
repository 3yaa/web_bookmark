import Image from "next/image";
import { Loading } from "@/app/components/ui/Loading";
import { DirectorNames } from "../../movies/components/DirectorNames";
import { ModalBackdrop, ModalPanel } from "@/app/components/ui/ModalMotion";
import { BaseMediaProps, ColumnConfig, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import {
	formatDateShort,
	getStatusBorderGradient,
	getStatusDetailWaveColor,
} from "@/utils/formattingUtils";
import {
	Trash2,
	Plus,
	X,
	ChevronsUp,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronDown,
	RotateCcw,
	RefreshCw,
	Check,
	List,
	Unlink,
	Users,
	BarChart2,
	Leaf,
} from "lucide-react";
import { BackdropImage } from "@/app/components/ui/Backdrop";
import { Dropdown, Option } from "@/app/components/ui/Dropdown";
import { tierOptions } from "@/utils/dropDownDetails";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { BookCoverConfig } from "@/app/books/components/BookCoverConfigDetails";
import { CoverColorPicker } from "@/app/components/ui/CoverColorPicker";
import { BookBackdropDetails } from "@/app/components/ui/BookBackdrop";
import { SeriesNav } from "./shared/SeriesNav";
import { EditProgress } from "@/app/shows/components/EditProgressDetail";
import {
	canNudgeMu,
	getDisplayScore,
	getTierFromMu,
	Tier,
} from "@/lib/tierConfig";
import { ShowProps } from "@/types/show";
import { MovieProps } from "@/types/movie";
import { BookCoverProps, BookProps } from "@/types/book";

// hover-revealed +/- controls on the score row
const SCORE_NUDGE_BTN =
	"flex justify-center items-center w-6.5 h-6.5 rounded-md bg-zinc-800/80 border border-zinc-700/25 hover:bg-zinc-700/35 hover:border-zinc-700/40 active:bg-zinc-700/40 active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:hover:bg-zinc-800/80 disabled:border-zinc-600/25 disabled:opacity-40 disabled:cursor-default";

const HEADER_WASH_MASK = [
	"linear-gradient(to right, transparent 0px, black 20px, black calc(100% - 44px), transparent 100%)",
	"linear-gradient(to bottom, transparent 0px, black 22px, black calc(100% - 22px), transparent 100%)",
].join(", ");

interface DesktopDetailsProps<T extends BaseMediaProps> {
	item: T;
	localNote: string;
	statusOptions: Option[];
	mediaType: string;
	isLoading?: { isTrue: boolean; style: string; text: string };
	isAdding: boolean;
	onAdd: () => void;
	onClose: () => void;
	onSeriesNav?: (dir: "left" | "right") => void;
	isInList?: (title: string) => boolean;
	differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
	onAction: (action: { type: string; payload?: unknown }) => void;
	canRefresh?: boolean;
	isSelecting?: boolean;
	// only for book
	coverUrls?: BookCoverProps[];
	coverIndex?: number;
	// only for game
	backdropUrls?: string[];
	backdropIndex?: number;
	// only for show
	editingMode?: { season: boolean; episode: boolean };
	inputValues?: { season: number | ""; episode: number | "" };
}

export function DesktopDetails<T extends BaseMediaProps>({
	item,
	localNote,
	statusOptions,
	mediaType,
	isLoading,
	isAdding,
	onAdd,
	onClose,
	onSeriesNav,
	isInList,
	onAction,
	canRefresh,
	isSelecting,
	coverUrls,
	coverIndex,
	backdropUrls,
	backdropIndex,
	editingMode,
	inputValues,
	differentColumns,
}: DesktopDetailsProps<T>) {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault(); // prevent new line
			onAction({ type: "saveNote" });
			e.currentTarget.blur(); // remove focus
		}
	};
	const series = item as unknown as SeriesMediaProps;
	const gameItem = item as unknown as GameProps;
	const movieItem = item as unknown as MovieProps;
	const bookItem = item as unknown as BookProps;

	// only for game/book
	const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
		//detects which side of the div was clicked
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const elementWidth = rect.width;
		const isRightSide = clickX > elementWidth / 2;

		onAction({
			type: "changeCover",
			payload: isRightSide ? "next" : "prev",
		});
	};

	// the cover being shown right now
	const activeCover =
		mediaType === "book"
			? coverUrls?.[coverIndex ?? 0]
			: (item.cover ?? undefined);

	// cover colour picker
	const colorPicker = activeCover ? (
		<CoverColorPicker
			key={activeCover.url}
			coverUrl={activeCover.url}
			currentColor={activeCover.color}
			onPick={(color) =>
				onAction({ type: "pickCoverColor", payload: color })
			}
		/>
	) : null;

	//images
	const coverSrc = item.cover?.url ?? item.posterUrl;
	const coverColor =
		(isAdding || isSelecting) && coverUrls?.[coverIndex ?? 0]
			? coverUrls[coverIndex ?? 0].color
			: item.cover?.color;
	const imageBackdropUrl =
		mediaType === "game" &&
		(isAdding || isSelecting) &&
		backdropIndex !== undefined
			? backdropUrls?.[backdropIndex]
			: item.backdropUrl;
	// moives only
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

	const hasBackdrop =
		mediaType === "book" ? !!coverColor : !!imageBackdropUrl;

	return (
		<ModalBackdrop className="fixed inset-0 bg-linear-to-br from-black/50 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20">
			<div
				className="fixed inset-0"
				onClick={() => {
					onAction({ type: "closeModal" });
				}}
			/>
			{/* BACKGROUND BORDER GRADIENT */}
			<ModalPanel
				className={`rounded-2xl bg-linear-to-b ${getStatusBorderGradient(
					item.status,
				)} p-1.5 py-2 lg:min-w-215 lg:max-w-215`}
			>
				{/* ACTUAL DETAIL CARD */}
				<div className="bg-linear-to-br bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-h-[calc(100vh-3rem)]">
					{isLoading?.isTrue && (
						<Loading
							customStyle={isLoading.style}
							text={isLoading.text}
						/>
					)}
					<div
						className={`px-5 py-3.5 border-0 rounded-2xl overflow-hidden`}
					>
						{/* ACTION BUTTONS */}
						{isSelecting ? (
							<div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
								{/* CHANGE SERIES */}
								{onSeriesNav && (
									<div className="flex gap-1 bg-zinc-800/50 rounded-lg">
										<button
											className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60 hover:cursor-pointer transition-all group"
											onClick={() => onSeriesNav("left")}
											title={"Previous series"}
										>
											<ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
										</button>
										<button
											className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60 hover:cursor-pointer transition-all group"
											onClick={() => onSeriesNav("right")}
											title={"Next series"}
										>
											<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
										</button>
									</div>
								)}
								{/* COVER COLORS */}
								{colorPicker}
								{/* MORE RESULTS (book) */}
								{mediaType === "book" && (
									<button
										className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer transition-all group"
										onClick={() =>
											onAction({ type: "moreBooks" })
										}
										title={"Other results"}
									>
										<List className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
									</button>
								)}
								{/* CONFIRM REFRESH */}
								<button
									className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
									onClick={() =>
										onAction({ type: "confirmRefresh" })
									}
									title={"Apply"}
								>
									<Check className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
								</button>
								{/* CANCEL REFRESH */}
								<button
									className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 hover:cursor-pointer transition-all group"
									onClick={() =>
										onAction({ type: "cancelRefresh" })
									}
									title={"Cancel"}
								>
									<X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
								</button>
							</div>
						) : isAdding ? (
							<div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
								{/* COVER COLORS */}
								{colorPicker}
								{/* NAV DIFFERENT SERIES */}
								{onSeriesNav && (
									<div className="flex gap-1 bg-zinc-800/50 rounded-lg">
										{/* LEFT BUTTON */}
										<button
											className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                      hover:cursor-pointer transition-all group"
											onClick={() => onSeriesNav("left")}
										>
											<ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
										</button>
										{/* RIGHT BUTTON */}
										<button
											className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                      hover:cursor-pointer transition-all group"
											onClick={() => onSeriesNav("right")}
										>
											<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
										</button>
									</div>
								)}
								{/* ADD */}
								<button
									className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
									onClick={onAdd}
									title={"Add " + mediaType}
								>
									<Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
								</button>
								{/* NEED YEAR */}
								{mediaType !== "book" && (
									<button
										className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer transition-all group"
										onClick={() => {
											onAction({
												type: "needYearField",
											});
										}}
										title={"Search with year"}
									>
										<ChevronsUp className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
									</button>
								)}
								{/* MORE RESULTS (book) */}
								{mediaType === "book" && (
									<button
										className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer transition-all group"
										onClick={() => {
											onAction({ type: "moreBooks" });
										}}
										title={"Other results"}
									>
										<List className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
									</button>
								)}
								{/* CLOSE BUTTON */}
								<button
									className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                    hover:cursor-pointer transition-all group"
									onClick={onClose}
									title={"Close"}
								>
									<X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
								</button>
							</div>
						) : (
							<div className="absolute right-3 top-3 flex items-center gap-1 z-10">
								{/* RELOAD METADATA FROM SOURCE */}
								{canRefresh && (
									<button
										className="p-1.5 rounded-lg bg-zinc-800/0 hover:bg-emerald-800/20 hover:cursor-pointer transition-all duration-200 group"
										onClick={() => {
											onAction({ type: "refresh" });
										}}
										title={"Reload cover / series info"}
									>
										<RefreshCw className="w-4 h-4 text-black/0 group-hover:text-emerald-400 transition-colors duration-200" />
									</button>
								)}
								{/* RESET SCORE */}
								{item.score && (
									<button
										className="p-1.5 rounded-lg bg-zinc-800/0 hover:bg-blue-800/20 hover:cursor-pointer transition-all duration-200 group"
										onClick={() => {
											onAction({ type: "resetScore" });
										}}
										title={"Reset score"}
									>
										<RotateCcw className="w-4 h-4 text-black/0 group-hover:text-blue-400 transition-colors duration-200" />
									</button>
								)}
								{/* DELETE SERIES METADATA */}
								{(series.seriesTitle ||
									series.placeInSeries ||
									series.prequel ||
									series.sequel) &&
									mediaType !== "game" && (
										<button
											className="p-1.5 rounded-lg bg-zinc-800/0 hover:bg-orange-700/20 hover:cursor-pointer transition-all duration-200 group"
											onClick={() => {
												onAction({
													type: "clearSeriesMeta",
												});
											}}
											title={"Clear series metadata"}
										>
											<Unlink className="w-4 h-4 text-black/0 group-hover:text-orange-400 transition-colors duration-200" />
										</button>
									)}
								{/* DELETE ITEM */}
								<button
									className="p-1.5 rounded-lg bg-zinc-800/0 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group"
									onClick={() => {
										onAction({ type: "delete" });
									}}
									title={"Delete " + mediaType}
								>
									<Trash2 className="w-4 h-4 text-black/0 group-hover:text-red-500 transition-colors duration-200" />
								</button>
							</div>
						)}

						<div className="flex gap-6">
							{/* LEFT SIDE -- PIC */}
							<div
								className={`relative bg-[#141414] p-3.5 rounded-xl shadow-island select-none ${
									coverUrls ? "hover:cursor-pointer" : ""
								}`}
								onClick={
									mediaType === "book" &&
									coverUrls &&
									coverUrls.length > 1
										? handleCoverChange
										: undefined
								}
								title={
									mediaType === "book" &&
									coverUrls &&
									coverIndex !== undefined
										? `${coverIndex + 1}/${coverUrls?.length}`
										: ""
								}
							>
								<div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg">
									{mediaType !== "book" ? (
										coverSrc ? (
											<Image
												src={coverSrc}
												alt={item.title || "Untitled"}
												width={1280}
												height={720}
												sizes={
													mediaType === "game"
														? "(min-width: 2200px) 500px, 250px"
														: undefined
												}
												quality={
													mediaType === "game"
														? 90
														: undefined
												}
												className={`min-w-62 min-h-93 ${mediaType === "game" ? "object-cover" : "object-fill"}`}
											/>
										) : (
											<div className="min-w-62 min-h-93 bg-linear-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
										)
									) : (
										<BookCoverConfig
											coverUrl={bookItem.cover?.url}
											title={item.title}
											coverUrls={coverUrls}
											coverIndex={coverIndex}
											className={
												"min-w-62 min-h-93 object-cover"
											}
											height={1280}
											width={720}
											sizes="(min-width: 2200px) 500px, 250px"
											quality={90}
										/>
									)}
								</div>
								{/* gradient overlay */}
								<div
									className="absolute inset-0 left-3.5 top-3.5 max-w-62 max-h-93 rounded-lg pointer-events-none"
									style={{
										background:
											"linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.3) 100%)",
									}}
								/>
								{/* Inner vignette */}
								<div className="absolute -inset-1 pointer-events-none rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.4)]" />
							</div>

							{/* RIGHT SIDE -- DETAILS */}
							<div className="flex flex-col flex-1 min-h-93 min-w-62 relative">
								{/* BACKDROP */}
								{mediaType === "book"
									? coverColor && (
											<BookBackdropDetails
												color={coverColor}
											/>
										)
									: imageBackdropUrl && (
											<BackdropImage
												src={imageBackdropUrl}
												width={
													mediaType === "game"
														? 1920
														: 1280
												}
												height={
													mediaType === "game"
														? 1080
														: 720
												}
											/>
										)}
								{/* game backdrop cycling overlay */}
								{mediaType === "game" &&
									(isAdding || isSelecting) &&
									backdropUrls &&
									backdropUrls.length > 1 && (
										<div
											className="absolute top-0 -left-8 -right-8 h-40 hover:cursor-pointer z-5"
											onClick={handleCoverChange}
											title={`${backdropIndex}/${backdropUrls.length}`}
										/>
									)}
								{/*  */}
								<div
									className={`flex flex-col flex-1 ${
										mediaType === "show"
											? "justify-end"
											: series.seriesTitle ||
												  gameItem.mainTitle
												? "justify-end mb-4"
												: "justify-end mb-3"
									}`}
								>
									{/* HEADER -- sat over backdrop */}
									<div className="relative flex flex-col w-fit max-w-full">
										{/* washblur */}
										{hasBackdrop &&
											mediaType !== "book" && (
												<div
													className="absolute -left-5 -right-10 -top-5 -bottom-2 -z-1 pointer-events-none backdrop-blur-[3px]"
													style={{
														backgroundColor:
															"rgba(9,9,11,0.16)",
														maskImage:
															HEADER_WASH_MASK,
														WebkitMaskImage:
															HEADER_WASH_MASK,
														maskComposite:
															"intersect",
														WebkitMaskComposite:
															"source-in",
													}}
												/>
											)}
										{/* SERIES TITLE */}
										{(() => {
											const seriesLabel =
												mediaType === "game"
													? gameItem.dlcIndex !== 0
														? gameItem.mainTitle
														: null
													: series.seriesTitle;

											return (
												seriesLabel && (
													<span className="font-semibold text-zinc-100/80 text-xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-0">
														{seriesLabel}
													</span>
												)
											);
										})()}
										{/* TITLE */}
										<div className="w-fit mb-1.5 max-w-full">
											<div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
												{item.title || "Untitled"}
											</div>
											{/* STATUS WAVE */}
											<div className="w-full bg-zinc-800 rounded-full h-0.75 overflow-hidden">
												<div
													className={`bg-zinc-900 h-0.75 transition-all duration-500 ease-out rounded-full relative overflow-hidden`}
													style={{ width: "100%" }}
												>
													<div
														className="absolute inset-0"
														style={{
															background:
																getStatusDetailWaveColor(
																	item.status,
																),
															animation:
																"wave 6s ease-in-out infinite",
															width: "200%",
														}}
													/>
												</div>
											</div>
										</div>
										{/* AUTHOR/STUDIO/DIRECTOR AND DATES */}
										<div className="flex justify-start items-center gap-2 w-full mb-3">
											{(mediaType === "show" ||
												mediaType === "movie") && (
												<button
													onClick={() =>
														onAction({
															type: "cast",
														})
													}
													title="View cast"
													className="cursor-pointer text-zinc-400 hover:text-zinc-200 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-200 shrink-0 mr-0.5 hover:scale-105"
												>
													<Users
														className="w-4 h-3.75 -mt-0.5 ml-0.5"
														strokeWidth={2}
													/>
												</button>
											)}
											{mediaType === "show" && (
												<button
													onClick={() =>
														onAction({
															type: "openRatings",
														})
													}
													title="Episode ratings"
													className="cursor-pointer text-zinc-400 hover:text-zinc-200 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-200 shrink-0 mr-0.5 hover:scale-105"
												>
													<BarChart2
														className="w-4 h-3.75 -mt-0.5"
														strokeWidth={2}
													/>
												</button>
											)}
											<span className="font-medium text-zinc-200/70 text-md max-h-6 leading-6 min-w-0">
												{canOpenDirector ? (
													<DirectorNames
														names={directorNames}
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
													<span className="truncate max-w-60 inline-block align-bottom">
														{differentColumns[0].getValue(
															item,
														) ||
															"Unknown " +
																differentColumns[0]
																	.label}
													</span>
												)}
											</span>
											<div className="font-medium text-zinc-200/70 text-md leading-6">
												•
											</div>
											<span
												className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
												title="Date Published"
											>
												{differentColumns[1].getValue(
													item,
												) || "Unknown"}
											</span>
											{item.status === "Completed" && (
												<div className="flex items-center gap-2">
													<div className="font-medium text-zinc-200/70 text-md leading-6">
														•
													</div>
													<span
														className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
														title="Date Completed"
													>
														{formatDateShort(
															item.dateCompleted,
														)}
													</span>
												</div>
											)}
										</div>
									</div>
									<div></div>
									{/* STATUS AND SCORE */}
									<div className="flex justify-start gap-4 mb-2.5 max-w-[94%]">
										<div className="flex-[0.77] lg:min-w-41.25">
											<label className="text-sm font-medium text-zinc-400 mb-1 block">
												Status
											</label>
											<Dropdown
												value={item.status}
												onChange={(value) => {
													onAction({
														type: "changeStatus",
														payload: value as
															| "Completed"
															| "Want to Watch"
															| "Dropped",
													});
												}}
												options={statusOptions}
												customStyle="text-zinc-300/85"
												dropDuration={0.24}
											/>
										</div>
										<div className="flex-[0.865] lg:min-w-48.75">
											<div className="flex justify-between">
												<label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
													Score
												</label>
												{mediaType === "movie" &&
													item.status ===
														"Want to Watch" &&
													movieItem.imdbRating !=
														null && (
														<div className="flex items-center gap-1 mr-2">
															<Leaf
																className="w-3 h-3 text-emerald-300/65 fill-emerald-300/15"
																strokeWidth={
																	1.75
																}
															/>
															<span className="text-[0.8125rem] font-semibold tabular-nums text-zinc-300/80 tracking-tight">
																{movieItem.imdbRating.toFixed(
																	1,
																)}
															</span>
														</div>
													)}
												{mediaType === "book" &&
													item.status ===
														"Want to Read" &&
													bookItem.rating != null && (
														<div className="flex items-center gap-1 mr-2">
															<Leaf
																className="w-3 h-3 text-emerald-300/65 fill-emerald-300/15"
																strokeWidth={
																	1.75
																}
															/>
															<span className="text-[0.8125rem] font-semibold tabular-nums text-zinc-300/80 tracking-tight">
																{bookItem.rating.toFixed(
																	1,
																)}
															</span>
														</div>
													)}
											</div>
											{item.score ? (
												<div className="group w-full rounded-lg border backdrop-blur-md flex items-center justify-between gap-3 px-4 py-3 transition-all duration-300 ease-out bg-linear-to-b shadow-md border-zinc-800/50 from-transparent via-zinc-800/30 to-zinc-800/50 shadow-black/20">
													<span className="text-sm text-zinc-300/85 font-bold tracking-wide">
														{!isAdding &&
															`${getDisplayScore(item.score.mu)} - `}
														{getTierFromMu(
															item.score!.mu,
														)}
													</span>
													{/* NUDGE SCORE BY 0.1 */}
													{!isAdding &&
														!isSelecting && (
															<div className="flex gap-1 -my-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
																<button
																	className={
																		SCORE_NUDGE_BTN
																	}
																	disabled={
																		!canNudgeMu(
																			item
																				.score
																				.mu,
																			"down",
																		)
																	}
																	onClick={() =>
																		onAction(
																			{
																				type: "nudgeScore",
																				payload:
																					"down",
																			},
																		)
																	}
																	title={
																		"Lower by 0.1"
																	}
																>
																	<ChevronDown className="w-4 h-4 text-zinc-300/80" />
																</button>
																<button
																	className={
																		SCORE_NUDGE_BTN
																	}
																	disabled={
																		!canNudgeMu(
																			item
																				.score
																				.mu,
																			"up",
																		)
																	}
																	onClick={() =>
																		onAction(
																			{
																				type: "nudgeScore",
																				payload:
																					"up",
																			},
																		)
																	}
																	title={
																		"Raise by 0.1"
																	}
																>
																	<ChevronUp className="w-4 h-4 text-zinc-300/80" />
																</button>
															</div>
														)}
												</div>
											) : (
												<Dropdown
													value={"-"}
													onChange={(value) => {
														if (value === "-")
															return;
														onAction({
															type: "setInitialTier",
															payload:
																value as Tier,
														});
													}}
													options={tierOptions}
													customStyle="text-zinc-300/85"
													dropStyle={(() => {
														const option =
															statusOptions.find(
																(opt) =>
																	opt.value ===
																	item.status,
															);
														return option
															? [
																	option.textStyle,
																	option.bgStyle,
																].filter(
																	(
																		s,
																	): s is string =>
																		s !==
																		undefined,
																)
															: [];
													})()}
													dropDuration={0.4}
												/>
											)}
										</div>
									</div>
									{/* SHOW PROGRESS (season/episode) */}
									{mediaType === "show" &&
										editingMode &&
										inputValues && (
											<EditProgress
												item={
													item as unknown as ShowProps
												}
												editingMode={editingMode}
												inputValues={inputValues}
												onAction={onAction}
											/>
										)}
									{/* NOTES */}
									<div className="space-y-1 mb-2 max-w-[94%]">
										<label className="text-sm font-medium text-zinc-400 block">
											Notes
										</label>
										<div className="bg-zinc-800/30 rounded-lg pl-3 pt-3 pr-1 pb-1.5 max-h-21.5 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200 shadow-lg shadow-black/20">
											<AutoTextarea
												value={localNote}
												onChange={(e) => {
													onAction({
														type: "changeNote",
														payload: e.target.value,
													});
												}}
												onKeyDown={handleKeyDown}
												onBlur={() => {
													onAction({
														type: "saveNote",
													});
												}}
												placeholder={
													"Add your thoughts about this " +
													mediaType +
													"..."
												}
												className="text-gray-300/90 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500 font-medium"
											/>
										</div>
									</div>
								</div>
								{/* PREQUEL AND SEQUEL */}
								{mediaType !== "show" && (
									<SeriesNav
										item={item}
										mediaType={mediaType}
										isAdding={isAdding}
										onAction={onAction}
										isInList={isInList}
										accentColor={coverColor}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</ModalPanel>
		</ModalBackdrop>
	);
}
