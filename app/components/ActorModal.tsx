"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, Tv } from "lucide-react";
import type { CastMember, ActorWork } from "../../utils/getActorInfo";
import { Loading } from "@/app/components/ui/Loading";
import { ModalBackdrop, ModalPanel } from "@/app/components/ui/ModalMotion";
import { MediaStatus } from "@/types/media";
import type { ReactNode } from "react";
import { getStatusBorderColor } from "@/utils/formattingUtils";

interface PosterCardProps {
	src: string | null;
	alt: string;
	// stands in when there is no image -- an initial, an icon, anything
	fallback: ReactNode;
	footer: ReactNode;
	badge?: ReactNode;
	onClick?: () => void;
	sizes?: string;
	// border and shadow are per-usage
	className?: string;
	zoomOnHover?: boolean;
}

function PosterCard({
	src,
	alt,
	fallback,
	footer,
	badge,
	onClick,
	sizes = "(max-width: 1024px) 20vw, 12vw",
	className = "",
	zoomOnHover = false,
}: PosterCardProps) {
	return (
		<div
			onClick={onClick}
			className={`group/card bg-linear-to-b from-zinc-900 to-zinc-950 rounded-lg border overflow-hidden ${
				onClick ? "cursor-pointer" : ""
			} ${className}`}
		>
			<div className="relative aspect-2/3 bg-zinc-900 overflow-hidden">
				{badge}
				{src ? (
					<Image
						src={src}
						alt={alt}
						fill
						draggable={false}
						sizes={sizes}
						className={`object-cover select-none ${
							zoomOnHover
								? "group-hover/card:scale-[1.04] transition-transform duration-500 ease-out"
								: ""
						}`}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900 text-zinc-600 text-xl font-light select-none">
						{fallback}
					</div>
				)}
			</div>
			<div className="h-px bg-linear-to-r from-transparent via-zinc-700/40 to-transparent" />
			{footer}
		</div>
	);
}

type Props = {
	mediaTitle: string;
	cast: CastMember[];
	castLoading: boolean;
	selectedActor: CastMember | null;
	sortedWorks: ActorWork[];
	actorLoading: boolean;
	filmSort: "popularity" | "recent";
	onClose: () => void;
	onActorClick: (member: CastMember) => void;
	onActorBack: () => void;
	onFilmSortChange: (sort: "popularity" | "recent") => void;
	onWorkClick?: (work: ActorWork) => void;
	addedStatusById?: Map<string, MediaStatus>;
	isDirectorView?: boolean;
	directorName?: string;
};

export function ActorItemsModal({
	mediaTitle,
	cast,
	castLoading,
	selectedActor,
	sortedWorks,
	actorLoading,
	filmSort,
	onClose,
	onActorClick,
	onActorBack,
	onFilmSortChange,
	onWorkClick,
	addedStatusById,
	isDirectorView = false,
	directorName,
}: Props) {
	const [mediaFilter, setMediaFilter] = useState<"all" | "tv" | "movie">(
		"all",
	);
	const headerRef = useRef<HTMLDivElement>(null);
	const [islandTop, setIslandTop] = useState(96);

	useLayoutEffect(() => {
		if (!headerRef.current) return;
		setIslandTop(headerRef.current.offsetHeight);
	}, [selectedActor]);

	useEffect(() => {
		setMediaFilter("all");
	}, [selectedActor]);

	useEffect(() => {
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		const originalOverflow = document.body.style.overflow;
		const originalPaddingRight = document.body.style.paddingRight;

		document.body.style.overflow = "hidden";
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}

		return () => {
			document.body.style.overflow = originalOverflow;
			document.body.style.paddingRight = originalPaddingRight;
		};
	}, []);
	const cols =
		selectedActor || castLoading || isDirectorView
			? 6
			: Math.min(Math.max(cast.length, 1), 6);

	const colMaxWidth: Record<number, string> = {
		1: "max-w-xs",
		2: "max-w-sm",
		3: "max-w-xl",
		4: "max-w-2xl",
		5: "max-w-4xl",
		6: "max-w-5xl",
	};

	const colGrid: Record<number, string> = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
		4: "grid-cols-4",
		5: "grid-cols-5",
		6: "grid-cols-6",
	};

	return (
		<ModalBackdrop
			className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-20 p-4"
			onClick={selectedActor && !isDirectorView ? onActorBack : onClose}
		>
			<div className={`relative w-full ${colMaxWidth[cols]}`}>
				{selectedActor && !actorLoading && (
					<motion.div
						key="portrait-island"
						initial={{ opacity: 0, x: 10 }}
						animate={{
							opacity: 1,
							x: 0,
							transition: { duration: 0.24, ease: "easeOut" },
						}}
						className="absolute right-full mr-4 hidden 2xl:block w-50"
						style={{ top: islandTop }}
						onClick={(e) => e.stopPropagation()}
					>
						<PosterCard
							src={selectedActor.profile_path}
							alt={selectedActor.name}
							fallback={selectedActor.name[0]}
							sizes="12rem"
							className="border-zinc-800/50 shadow-2xl shadow-black/80"
							footer={
								<div className="relative px-2.5 pt-2 pb-0.5">
									<p
										aria-hidden
										className="text-[0.75rem] leading-snug invisible"
									>
										&nbsp;
									</p>
									<div
										aria-hidden
										className="flex items-center justify-between"
									>
										<span className="text-zinc-500 text-[0.6875rem] font-medium invisible">
											Film
										</span>
									</div>
									<div className="absolute inset-0 flex items-center justify-center px-2.5">
										<p className="font-semibold text-zinc-200 text-[0.9rem] leading-snug line-clamp-2 text-center">
											{selectedActor.name}
										</p>
									</div>
								</div>
							}
						/>
					</motion.div>
				)}
				<ModalPanel
					className={`relative w-full max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-2xl shadow-black/80`}
					onClick={(e) => e.stopPropagation()}
				>
					{/* HEADER */}
					<div
						ref={headerRef}
						className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-linear-to-b from-zinc-900/50 to-transparent"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div className="min-w-0">
								<p className="text-[0.625rem] text-zinc-400/60 font-semibold uppercase tracking-[0.18em] mb-0.5">
									{selectedActor || isDirectorView
										? "Discover"
										: "Featured Cast"}
								</p>
								<h2 className="text-zinc-200/90 text-lg font-semibold leading-tight truncate tracking-tight">
									{selectedActor
										? selectedActor.name
										: isDirectorView && directorName
											? directorName
											: mediaTitle}
								</h2>
							</div>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							{(selectedActor || isDirectorView) && (
								<div
									className={`flex items-center gap-2 transition-opacity duration-200 ${
										selectedActor
											? "opacity-100"
											: "opacity-0 pointer-events-none"
									}`}
								>
									<div className="flex items-center gap-1 p-1 rounded-lg bg-linear-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 shadow-md shadow-black/40">
										{(["all", "tv", "movie"] as const).map(
											(f) => (
												<button
													key={f}
													onClick={() =>
														setMediaFilter(f)
													}
													className={`cursor-pointer px-3 py-1 rounded-md text-[0.6875rem] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
														mediaFilter === f
															? "bg-zinc-700/70 text-zinc-100 shadow-sm"
															: "text-zinc-500 hover:text-zinc-300"
													}`}
												>
													{f === "all"
														? "All"
														: f === "tv"
															? "Series"
															: "Film"}
												</button>
											),
										)}
									</div>
									<div className="flex items-center gap-1 p-1 rounded-lg bg-linear-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 shadow-md shadow-black/40">
										{(
											["popularity", "recent"] as const
										).map((s) => (
											<button
												key={s}
												onClick={() =>
													onFilmSortChange(s)
												}
												className={`cursor-pointer px-3 py-1 rounded-md text-[0.6875rem] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
													filmSort === s
														? "bg-zinc-700/70 text-zinc-100 shadow-sm"
														: "text-zinc-500 hover:text-zinc-300"
												}`}
											>
												{s === "popularity"
													? "Popular"
													: "Recent"}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* cast view */}
					<div className="relative flex-1 overflow-y-auto px-6 py-6">
						<motion.div
							key={
								selectedActor
									? `works-${selectedActor.id}`
									: "cast"
							}
							initial={selectedActor ? { opacity: 0 } : false}
							animate={{
								opacity: 1,
								transition: { duration: 0.4, ease: "easeInOut" },
							}}
						>
							{actorLoading &&
								(selectedActor || isDirectorView) && (
									<>
										<div className="min-h-48" aria-hidden />
										<Loading
											customStyle="h-5 w-5 border-zinc-600"
											customBg="bg-zinc-950"
										/>
									</>
								)}
							{!selectedActor && !isDirectorView && (
								<>
									{castLoading && (
										<div className="flex justify-center py-20">
											<Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
										</div>
									)}
									{!castLoading && cast.length === 0 && (
										<p className="text-zinc-500 italic text-sm text-center py-20">
											No cast found.
										</p>
									)}
									{!castLoading && cast.length > 0 && (
										<div
											className={`grid ${colGrid[cols]} gap-x-4 gap-y-5`}
										>
											{cast.map((member) => (
												<PosterCard
													key={member.id}
													src={member.profile_path}
													alt={member.name}
													fallback={member.name[0]}
													zoomOnHover
													onClick={() =>
														onActorClick(member)
													}
													className="border-zinc-800/50 shadow-md shadow-black/50 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-0.5 hover:border-zinc-700/60 transition-all duration-300 ease-out"
													footer={
														<div className="px-3 py-2.5">
															<p className="font-semibold text-zinc-200 text-[0.8125rem] leading-tight line-clamp-1">
																{member.name}
															</p>
															{member.character && (
																<p className="text-zinc-400 text-[0.75rem] mt-0.5 line-clamp-1 font-medium">
																	{
																		member.character
																	}
																</p>
															)}
														</div>
													}
												/>
											))}
										</div>
									)}
								</>
							)}

							{/* Filmography view */}
							{(selectedActor || isDirectorView) && (
								<div className="relative min-h-48">
									{!actorLoading &&
										sortedWorks.length === 0 && (
											<p className="text-zinc-500 italic text-sm text-center py-20">
												No works found.
											</p>
										)}
									{!actorLoading &&
										sortedWorks.length > 0 && (
											<>
												<div className="grid grid-cols-5 gap-x-4 gap-y-5">
													{sortedWorks
														.filter(
															(w) =>
																mediaFilter ===
																	"all" ||
																w.media_type ===
																	mediaFilter,
														)
														.map((work) => {
															const matchedStatus =
																addedStatusById?.get(
																	`${work.media_type}:${work.id}`,
																);
															return (
																<PosterCard
																	key={`${work.media_type}-${work.id}`}
																	src={
																		work.poster_path
																	}
																	alt={
																		work.title
																	}
																	fallback={
																		<Tv
																			className="w-5 h-5 text-zinc-700"
																			strokeWidth={
																				1.5
																			}
																		/>
																	}
																	onClick={
																		onWorkClick
																			? () =>
																					onWorkClick(
																						work,
																					)
																			: undefined
																	}
																	className={`shadow-md shadow-black/50 ${onWorkClick ? "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60 transition-all duration-300 ease-out" : ""} ${matchedStatus ? `${getStatusBorderColor(matchedStatus!)} border-2` : "border-zinc-800/50 hover:border-zinc-700/60"}`}
																	badge={
																		matchedStatus ? (
																			<div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-300 select-none">
																				In
																				List
																			</div>
																		) : undefined
																	}
																	footer={
																		<div className="px-2.5 pt-2 pb-0.5">
																			<p className="font-semibold text-zinc-200 text-[0.75rem] leading-snug line-clamp-1">
																				{
																					work.title
																				}
																			</p>
																			<div className="flex items-center justify-between">
																				<span className="text-zinc-500 text-[0.6875rem] font-medium">
																					{work.media_type ===
																					"tv"
																						? "Series"
																						: "Film"}
																				</span>
																				{work.date && (
																					<span className="text-zinc-400 text-[0.6875rem] font-semibold tabular-nums">
																						{work.date.slice(
																							0,
																							4,
																						)}
																					</span>
																				)}
																			</div>
																			<div></div>
																		</div>
																	}
																/>
															);
														})}
												</div>
											</>
										)}
								</div>
							)}
						</motion.div>
					</div>
				</ModalPanel>
			</div>
		</ModalBackdrop>
	);
}
