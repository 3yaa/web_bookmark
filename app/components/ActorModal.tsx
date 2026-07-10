"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Tv, X, ChevronLeft } from "lucide-react";
import type { CastMember, ActorWork } from "../../utils/getActorInfo";
import { Loading } from "@/app/components/ui/Loading";
import { ModalBackdrop, ModalPanel } from "@/app/components/ui/ModalMotion";
import { MediaStatus } from "@/types/media";
import { getStatusBorderColor } from "@/utils/formattingUtils";

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
}: Props) {
	const [mediaFilter, setMediaFilter] = useState<"all" | "tv" | "movie">(
		"all",
	);

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
		selectedActor || castLoading
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
			onClick={onClose}
		>
			<ModalPanel
				className={`relative w-full ${colMaxWidth[cols]} max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-2xl shadow-black/80`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* HEADER */}
				<div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-linear-to-b from-zinc-900/50 to-transparent">
					<div className="flex items-center gap-3 min-w-0">
						{selectedActor && (
							<button
								onClick={onActorBack}
								className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all shrink-0"
							>
								<ChevronLeft
									className="w-4 h-4"
									strokeWidth={2.5}
								/>
							</button>
						)}
						<div className="min-w-0">
							<p className="text-[0.625rem] text-zinc-400/60 font-semibold uppercase tracking-[0.18em] mb-0.5">
								{selectedActor
									? "Filmography"
									: "Featured Cast"}
							</p>
							<h2 className="text-zinc-200/90 text-lg font-semibold leading-tight truncate tracking-tight">
								{selectedActor
									? selectedActor.name
									: mediaTitle}
							</h2>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{selectedActor && (
							<>
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
									{(["popularity", "recent"] as const).map(
										(s) => (
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
										),
									)}
								</div>
							</>
						)}
						<button
							onClick={onClose}
							className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all"
						>
							<X className="w-4 h-4" strokeWidth={2} />
						</button>
					</div>
				</div>

				{/* cast view */}
				<div className="overflow-y-auto px-6 py-6">
					{!selectedActor && (
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
										<div
											key={member.id}
											onClick={() => onActorClick(member)}
											className="group/actor cursor-pointer bg-linear-to-b from-zinc-900/70 to-zinc-950/85 rounded-xl border border-zinc-800/50 shadow-md shadow-black/50 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-0.5 hover:border-zinc-700/60 transition-all duration-300 ease-out overflow-hidden"
										>
											<div className="relative aspect-2/3 bg-zinc-900 overflow-hidden">
												{member.profile_path ? (
													<Image
														src={
															member.profile_path
														}
														alt={member.name}
														fill
														className="object-cover group-hover/actor:scale-[1.04] transition-transform duration-500 ease-out"
														sizes="(max-width: 1024px) 20vw, 12vw"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900 text-zinc-600 text-xl font-light">
														{member.name[0]}
													</div>
												)}
											</div>
											<div className="h-px bg-linear-to-r from-transparent via-zinc-700/40 to-transparent" />
											<div className="px-3 py-2.5">
												<p className="font-semibold text-zinc-200 text-[0.8125rem] leading-tight line-clamp-1">
													{member.name}
												</p>
												{member.character && (
													<p className="text-zinc-400 text-[0.75rem] mt-0.5 line-clamp-1 font-medium">
														{member.character}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}

					{/* Filmography view */}
					{selectedActor && (
						<div className="relative min-h-48">
							{actorLoading && (
								<Loading
									customStyle="h-5 w-5 border-zinc-600"
									customBg="bg-zinc-950"
								/>
							)}
							{!actorLoading && sortedWorks.length === 0 && (
								<p className="text-zinc-500 italic text-sm text-center py-20">
									No works found.
								</p>
							)}
							{!actorLoading && sortedWorks.length > 0 && (
								<>
									<div className="grid grid-cols-5 gap-x-4 gap-y-5">
										{sortedWorks
											.filter(
												(w) =>
													mediaFilter === "all" ||
													w.media_type ===
														mediaFilter,
											)
											.map((work) => {
												const matchedStatus =
													addedStatusById?.get(
														`${work.media_type}:${work.id}`,
													);
												return (
													<div
														key={`${work.media_type}-${work.id}`}
														onClick={() =>
															onWorkClick?.(work)
														}
														className={`bg-linear-to-b from-zinc-900/70 to-zinc-950/85 rounded-xl border shadow-md shadow-black/50 overflow-hidden ${onWorkClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60 transition-all duration-300 ease-out" : ""} ${matchedStatus ? `${getStatusBorderColor(matchedStatus!)} border-2` : "border-zinc-800/50 hover:border-zinc-700/60"}`}
													>
														<div className="relative aspect-2/3 bg-zinc-900 overflow-hidden">
															{matchedStatus && (
																<div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-300">
																	In List
																</div>
															)}
															{work.poster_path ? (
																<Image
																	src={
																		work.poster_path
																	}
																	alt={
																		work.title
																	}
																	fill
																	className="object-cover"
																	sizes="(max-width: 1024px) 20vw, 12vw"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900">
																	<Tv
																		className="w-5 h-5 text-zinc-700"
																		strokeWidth={
																			1.5
																		}
																	/>
																</div>
															)}
														</div>
														<div className="h-px bg-linear-to-r from-transparent via-zinc-700/40 to-transparent" />
														<div className="px-2.5 pt-2 pb-0.5">
															<p className="font-semibold text-zinc-200 text-[0.75rem] leading-snug line-clamp-1">
																{work.title}
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
													</div>
												);
											})}
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</ModalPanel>
		</ModalBackdrop>
	);
}
