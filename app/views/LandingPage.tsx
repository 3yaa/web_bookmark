"use client";

import Link from "next/link";
import { Book, Film, Tv, Gamepad2, ChevronRight } from "lucide-react";
import LightRays from "@/app/components/ui/LightRays";
import { BaseMediaProps } from "@/types/media";
import { useEffect, useState } from "react";
import { useAuthFetch } from "../auth/hooks/useAuthFetch";
import { StatsBar } from "../components/StatsBar";
import { RecentItems } from "../components/RecentMedias";

const sections = [
	{ name: "Movies", key: "movies", href: "/movies", icon: Film },
	{ name: "Shows", key: "shows", href: "/shows", icon: Tv },
	{ name: "Books", key: "books", href: "/books", icon: Book },
	{ name: "Games", key: "games", href: "/games", icon: Gamepad2 },
];

export default function LandingPage() {
	const { authFetch } = useAuthFetch();
	const [isLoading, setIsLoading] = useState(false);
	const [stats, setStats] = useState<Record<
		string,
		Record<string, number>
	> | null>(null);
	const [recentMedias, setRecentMedias] = useState<Record<
		string,
		BaseMediaProps[]
	> | null>(null);

	const getStats = async () => {
		try {
			setIsLoading(true);
			const response = await authFetch(`/api/stats?recentLimit=4`);
			if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
			const resJson = await response.json();
			setStats(resJson.data);
			setRecentMedias(resJson.recent);
		} catch (e) {
			console.error("Error fetching stats: ", e);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getStats();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className="relative min-h-screen w-full flex flex-col items-center bg-black text-white overflow-hidden">
			{/* hollow nit nit */}
			<div className="absolute inset-0 hidden sm:block">
				<LightRays
					raysOrigin="top-center"
					raysColor="#ffffff"
					raysSpeed={0.5}
					lightSpread={1.2}
					rayLength={2}
					fadeDistance={0.9}
					saturation={1.0}
					followMouse
					mouseInfluence={0.15}
					noiseAmount={0.05}
					distortion={0.08}
					className="w-full h-full"
				/>
			</div>

			{/* HEADER */}
			<header className="relative z-10 hidden sm:block mt-24 text-center">
				<h1 className="text-6xl font-extrabold tracking-tight bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
					Mouthful
				</h1>
			</header>

			{/* MEDIA CARDS */}
			<div className="relative z-10 mt-6 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 px-4 sm:px-6 w-full max-w-425">
				{sections.map((section) => {
					const raw = stats?.[section.key];
					const rawEntries = raw ? Object.entries(raw) : [];
					const avgScoreEntry = rawEntries.find(
						([k]) => k === "avgScore",
					);
					const avgScore = avgScoreEntry
						? Number(avgScoreEntry[1])
						: undefined;
					const mediaStats = raw
						? Object.fromEntries(
								rawEntries.filter(([k]) => k !== "avgScore"),
							)
						: undefined;
					const hasStats =
						mediaStats && Object.keys(mediaStats).length > 0;
					const recent = recentMedias?.[section.key];

					return (
						<div
							key={section.name}
							className="group/card relative rounded-2xl
                bg-zinc-900/60 border border-zinc-700/30
                shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),inset_0_-1px_2px_rgba(255,255,255,0.03)]
                p-4 sm:p-5 flex flex-col gap-4"
						>
							{/* ── nav buttons ── */}
							<Link href={section.href} className="block">
								<div
									className="group/btn relative flex items-center justify-between
                    rounded-xl px-4 py-4 sm:py-5
                    bg-zinc-800/60 border border-zinc-700/50 shadow-island
                    hover:bg-zinc-700/40 hover:border-zinc-600/50
                    hover:scale-[1.02] active:scale-[0.98]
                    active:shadow-[0_1px_4px_rgba(0,0,0,0.5)]
                    hover:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.5)]
                    cursor-pointer transition-all duration-200 ease-out"
								>
									<div className="flex items-center gap-3">
										<section.icon
											className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-400
                        group-hover/btn:text-zinc-300 transition-colors duration-200"
											strokeWidth={1.5}
										/>
										<span
											className="text-base sm:text-lg font-medium text-zinc-300
                        group-hover/btn:text-zinc-200 transition-colors duration-200"
										>
											{section.name}
										</span>
									</div>
									<ChevronRight
										className="w-5 h-5 text-zinc-600
                      group-hover/btn:text-zinc-400 group-hover/btn:translate-x-0.5
                      transition-all duration-200"
									/>
								</div>
							</Link>

							{/* ── stats ── */}
							<div className="px-1">
								{hasStats && (
									<StatsBar
										data={mediaStats}
										avgScore={avgScore}
									/>
								)}
								{/* LOADER */}
								{isLoading && !hasStats && (
									<div className="w-full space-y-2">
										{/* labels row */}
										<div className="h-4 flex items-center justify-between">
											<div className="h-3.5 w-16 rounded bg-zinc-800/40 animate-pulse" />
											<div className="h-3.5 w-8 rounded bg-zinc-800/40 animate-pulse" />
										</div>
										{/* bar */}
										<div className="w-full h-5.5 rounded-sm bg-zinc-800/60 animate-pulse" />
									</div>
								)}
							</div>

							{/* ── recent items (sm+ only) ── */}
							<div className="hidden sm:block px-1 -mt-2">
								{recent && recent.length > 0 && (
									<RecentItems items={recent} />
								)}
								{/* LOADER */}
								{isLoading && !recent && (
									<div className="mt-3 flex flex-col gap-2 -mr-1">
										{[0, 1, 2, 3].map((i) => (
											<div
												key={i}
												className="relative flex items-center gap-3 rounded-lg px-2 pr-4 py-2
                          bg-zinc-950/60 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8),inset_0_-1px_0_rgba(255,255,255,0.1)] border-t border-zinc-950/80"
											>
												{/* poster */}
												<div className="w-12 h-16 sm:w-14 sm:h-18 shrink-0 rounded-sm bg-zinc-800/40 animate-pulse shadow-island p-0.5" />
												{/* title + timestamp */}
												<div className="flex-1 min-w-0 space-y-1.5">
													<div className="h-3.5 w-3/4 rounded bg-zinc-800/40 animate-pulse" />
													<div className="h-2.5 w-1/3 rounded bg-zinc-800/40 animate-pulse" />
												</div>
												{/* score */}
												<div className="shrink-0 w-8 py-1.5 -mt-3 h-8 rounded-lg bg-zinc-800/40 animate-pulse border border-zinc-800/40" />
												{/* status bar */}
												<div className="absolute bottom-3 left-19 right-3 h-0.75 rounded-full bg-zinc-800/30 animate-pulse" />
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* FOOTER */}
			<footer className="relative z-10 mt-auto pt-12 pb-4 text-zinc-600 text-sm tracking-wide">
				© {new Date().getFullYear()} Mouthful
			</footer>
		</main>
	);
}
