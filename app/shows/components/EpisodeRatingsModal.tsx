"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { ShowProps } from "@/types/show";
import type { AuthFetch } from "@/app/auth/hooks/useAuthFetch";
import Image from "next/image";
import { Loading } from "@/app/components/ui/Loading";
import { ModalBackdrop, ModalPanel } from "@/app/components/ui/ModalMotion";

interface EpisodeRating {
	season: number;
	episode: number;
	score: number | null;
}

interface SeriesInfo {
	rating: number | null;
	votes: number | null;
}

interface EpisodeRatingsModalProps {
	show: ShowProps;
	onClose: () => void;
	authFetch: AuthFetch;
}

const RATING_TIERS = [
	// BLUE
	{
		label: "Goosebumps",
		min: 9.7,
		bg: "bg-[#1da1f2]",
		text: "text-white",
	},
	// DARK GREEN
	{ label: "Exceptional", min: 9.0, bg: "bg-[#186a3b]", text: "text-white" },
	// GREEN
	{ label: "Amazing", min: 8.0, bg: "bg-[#28b463]", text: "text-zinc-900" },
	// EMERALD
	{
		label: "Good",
		min: 7.0,
		bg: "bg-emerald-400",
		text: "text-zinc-900",
	},
	// YELLOW
	{
		label: "Pretty Good",
		min: 6.0,
		bg: "bg-[#f4d03f]",
		text: "text-zinc-900",
	},
	// ORANGE
	{ label: "Average", min: 5.0, bg: "bg-[#f39c12]", text: "text-zinc-900" },
	// RED
	{ label: "Off-key", min: 4.0, bg: "bg-[#e74c3c]", text: "text-white" },
	// PURPLE
	{ label: "Bad", min: 0.0, bg: "bg-[#633974]", text: "text-white" },
] as const;

function getTier(score: number | null) {
	if (score === null) return null;
	for (const tier of RATING_TIERS) {
		if (score >= tier.min) return tier;
	}
	return null;
}

function getTierRgba(score: number | null): string {
	if (score === null) return "transparent";
	if (score >= 9.7) return "rgba(29,161,242,0.5)";
	if (score >= 9.0) return "rgba(24,106,59,0.6)";
	if (score >= 8.0) return "rgba(40,180,99,0.5)";
	if (score >= 7.0) return "rgba(52,211,153,0.45)";
	if (score >= 6.0) return "rgba(244,208,63,0.5)";
	if (score >= 5.0) return "rgba(243,156,18,0.5)";
	if (score >= 4.0) return "rgba(231,76,60,0.5)";
	return "rgba(99,57,116,0.5)";
}

function formatVotes(votes: number): string {
	if (votes >= 1_000_000) return `${(votes / 1_000_000).toFixed(1)}M`;
	if (votes >= 1_000) return `${(votes / 1_000).toFixed(0)}K`;
	return String(votes);
}

export function EpisodeRatingsModal({
	show,
	onClose,
	authFetch,
}: EpisodeRatingsModalProps) {
	const [ratings, setRatings] = useState<EpisodeRating[]>([]);
	const [series, setSeries] = useState<SeriesInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchRatings() {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams();
				if (show.imdbId) {
					params.set("imdbId", show.imdbId);
				} else {
					params.set("tmdbId", show.tmdbId);
					params.set("showId", String(show.id));
				}

				const res = await authFetch(
					`/api/shows-api/episodes-score?${params}`,
				);
				if (!res.ok) throw new Error("Could not fetch episode ratings");
				const data = await res.json();
				setRatings(data.data ?? []);
				setSeries(data.series ?? null);
			} catch (e) {
				setError(
					e instanceof Error ? e.message : "Failed to load ratings",
				);
			} finally {
				setLoading(false);
			}
		}

		fetchRatings();
	}, [show.id, show.tmdbId, show.imdbId, authFetch]);

	const seasons = show.seasons ?? [];
	const maxEpisodes =
		seasons.length > 0
			? Math.max(...seasons.map((s) => s.episode_count))
			: 0;

	const grid: Record<number, Record<number, number | null>> = {};
	for (const { season, episode, score } of ratings) {
		if (!grid[season]) grid[season] = {};
		grid[season][Number(episode)] = score;
	}

	const seasonAverages = seasons.map((_, i) => {
		const scores = Object.values(grid[i + 1] ?? {}).filter(
			(s): s is number => s !== null,
		);
		if (scores.length === 0) return null;
		return +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
	});

	return (
		<ModalBackdrop className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-30">
			<div className="fixed inset-0" onClick={onClose} />
			<ModalPanel className="relative bg-zinc-950 rounded-2xl shadow-2xl p-6 max-w-[94vw] max-h-[90vh] overflow-hidden">
				<div className="flex gap-3 items-center">
					{/* LEFT PANEL */}
					<div className="flex flex-col gap-3 w-75 shrink-0">
						{show.posterUrl && (
							<div className="relative bg-[#141414] p-3.5 rounded-xl shadow-island select-none">
								<div className="relative w-full overflow-hidden rounded-lg aspect-2/3">
									<Image
										src={show.posterUrl}
										alt={show.title}
										fill
										className="object-fill"
										sizes="300px"
									/>
									<div
										className="absolute inset-0 rounded-lg pointer-events-none"
										style={{
											background:
												"linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.3) 100%)",
										}}
									/>
								</div>
								<div className="absolute -inset-1 pointer-events-none rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.4)]" />
							</div>
						)}
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between gap-2 mx-1.5">
								<p className="text-zinc-100 font-bold text-lg leading-snugml-2">
									{show.title}
								</p>
								{series?.rating != null && (
									<span className="flex items-center gap-2 shrink-0">
										{series.votes != null && (
											<span className="text-zinc-400 text-xs font-semibold">
												{formatVotes(series.votes)}
											</span>
										)}
										<span className="text-zinc-400">
											󠁯•󠁏
										</span>
										<Leaf
											className="w-3 h-3 text-emerald-300/75 fill-emerald-300/15"
											strokeWidth={1.75}
										/>
										<span className="text-base font-black tabular-nums text-zinc-100 tracking-tight">
											{series.rating.toFixed(1)}
										</span>
									</span>
								)}
							</div>
							{/* wave bar */}
							<div className="w-full bg-zinc-800 rounded-full h-0.75 overflow-hidden">
								<div className="bg-zinc-900 h-0.75 rounded-full relative overflow-hidden w-full">
									<div
										className="absolute inset-0"
										style={{
											background: getTier(
												series?.rating ?? null,
											)
												? `linear-gradient(90deg, transparent 20%, ${getTierRgba(series?.rating ?? null)} 50%, transparent 80%)`
												: "transparent",
											animation:
												"wave 6s ease-in-out infinite",
											width: "200%",
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT PANEL */}
					<div className="overflow-auto max-h-123.5 max-w-[calc(94vw-21rem)] grid place-items-center">
						{loading && (
							<div className="relative h-48 w-64">
								<Loading
									customStyle="h-6 w-6 border-zinc-600"
									customBg="bg-transparent"
								/>
							</div>
						)}
						{error && (
							<div className="flex items-center justify-center h-48 w-64 text-red-400 text-sm">
								{error}
							</div>
						)}

						{!loading &&
							!error &&
							(() => {
								const isSingleSeason = seasons.length === 1;
								const CHUNK = 11;
								const numChunks = isSingleSeason
									? Math.ceil(maxEpisodes / CHUNK)
									: 1;

								const EpisodeCell = ({
									epNum,
									season,
									sIdx,
								}: {
									epNum: number;
									season: (typeof seasons)[0];
									sIdx: number;
								}) => {
									if (epNum > season.episode_count)
										return <td key={sIdx} />;
									const score = grid[sIdx + 1]?.[epNum];
									const tier = getTier(score ?? null);
									return (
										<td key={sIdx}>
											<div
												className={`${tier?.bg ?? "bg-zinc-800"} ${tier?.text ?? "text-zinc-400"} rounded-lg w-14 h-9 flex items-center justify-center tabular-nums text-xl font-bold`}
											>
												{score != null
													? score.toFixed(1)
													: "?"}
											</div>
										</td>
									);
								};

								const AvgRow = ({
									asHeader,
									className = "",
								}: {
									asHeader: boolean;
									className?: string;
								}) => {
									const Cell = asHeader ? "th" : "td";
									return (
										<tr className={className}>
											<Cell className="text-zinc-400 text-xs font-semibold pr-1 text-right pb-2">
												avg
											</Cell>
											{seasonAverages.map((avg, i) => {
												const tier = getTier(avg);
												return (
													<Cell
														key={i}
														className="pb-2"
													>
														<div className="w-14 flex flex-col items-center gap-1">
															<span className="text-white font-bold text-lg tabular-nums -mb-1">
																{avg != null
																	? avg.toFixed(
																			1,
																		)
																	: "—"}
															</span>
															<div
																className={`h-1 w-full rounded-full ${tier?.bg ?? "bg-zinc-700"}`}
															/>
														</div>
													</Cell>
												);
											})}
										</tr>
									);
								};

								if (isSingleSeason) {
									const chunks = Array.from(
										{ length: numChunks },
										(_, ci) => ({
											start: ci * CHUNK + 1,
											end: Math.min(
												(ci + 1) * CHUNK,
												maxEpisodes,
											),
											isLast: ci === numChunks - 1,
										}),
									);
									return (
										<div className="flex gap-0 items-start">
											{chunks.map((chunk) => (
												<table
													key={chunk.start}
													className="border-separate border-spacing-x-2 border-spacing-y-1.5"
												>
													<tbody>
														{Array.from(
															{
																length:
																	chunk.end -
																	chunk.start +
																	1,
															},
															(_, idx) => {
																const epNum =
																	chunk.start +
																	idx;
																return (
																	<tr
																		key={
																			epNum
																		}
																	>
																		<td className="text-zinc-400 text-sm font-semibold pr-1 text-right">
																			E
																			{
																				epNum
																			}
																		</td>
																		{seasons.map(
																			(
																				season,
																				sIdx,
																			) => (
																				<EpisodeCell
																					key={
																						sIdx
																					}
																					epNum={
																						epNum
																					}
																					season={
																						season
																					}
																					sIdx={
																						sIdx
																					}
																				/>
																			),
																		)}
																	</tr>
																);
															},
														)}
														{chunk.isLast && (
															<tr>
																<td className="text-zinc-500 text-xs font-semibold pr-1 text-right pt-2">
																	avg
																</td>
																{seasonAverages.map(
																	(
																		avg,
																		i,
																	) => {
																		const tier =
																			getTier(
																				avg,
																			);
																		return (
																			<td
																				key={
																					i
																				}
																				className="pt-2"
																			>
																				<div className="w-14 flex flex-col items-center gap-1">
																					<span className="text-white font-bold text-lg tabular-nums -mb-1">
																						{avg !=
																						null
																							? avg.toFixed(
																									1,
																								)
																							: "—"}
																					</span>
																					<div
																						className={`h-1 w-full rounded-full ${tier?.bg ?? "bg-zinc-700"}`}
																					/>
																				</div>
																			</td>
																		);
																	},
																)}
															</tr>
														)}
													</tbody>
												</table>
											))}
										</div>
									);
								}

								return (
									<table className="border-separate border-spacing-x-2 border-spacing-y-1.5">
										<thead>
											<tr>
												<th className="w-10" />
												{seasons.map((_, i) => (
													<th
														key={i}
														className="text-zinc-400 font-semibold text-center text-sm w-14 pb-1"
													>
														S{i + 1}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{Array.from(
												{ length: maxEpisodes },
												(_, epIdx) => {
													const epNum = epIdx + 1;
													return (
														<tr key={epNum}>
															<td className="text-zinc-400 text-sm font-semibold pr-1 text-right">
																E{epNum}
															</td>
															{seasons.map(
																(
																	season,
																	sIdx,
																) => (
																	<EpisodeCell
																		key={
																			sIdx
																		}
																		epNum={
																			epNum
																		}
																		season={
																			season
																		}
																		sIdx={
																			sIdx
																		}
																	/>
																),
															)}
														</tr>
													);
												},
											)}
											<AvgRow asHeader={false} />
										</tbody>
									</table>
								);
							})()}
					</div>
				</div>
			</ModalPanel>
		</ModalBackdrop>
	);
}
