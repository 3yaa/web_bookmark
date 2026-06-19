import React, { ReactNode } from "react";
import Image from "next/image";
import { BaseMediaProps, ColumnConfig, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import {
	formatDateShort,
	getStatusBg,
	getStatusBorderColor,
	getStatusStrokeColor,
	getStatusWaveColor,
} from "@/utils/formattingUtils";
import { getDisplayScore } from "@/lib/tierConfig";
import { BackdropDesktop } from "../../components/ui/BackdropDesktop";
import { ScoreBadge } from "../../components/ui/ScoreBadge";
import { ShowProgressBarDesktop } from "@/app/shows/components/showProgressListing";
import { ShowProps } from "@/types/show";

interface DesktopItemProps<T extends BaseMediaProps> {
	item: T;
	index: number;
	total: number;
	rank: number;
	mediaType: string;
	onClick: (item: T) => void;
	differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
}

export const DesktopItem = React.memo(function DesktopItem<
	T extends BaseMediaProps,
>({
	item,
	index,
	total,
	// rank,
	mediaType,
	onClick,
	differentColumns,
}: DesktopItemProps<T>) {
	const s = item as unknown as SeriesMediaProps;
	const g = item as unknown as GameProps;

	function pseudoRand(seed: string | number, salt = 0): number {
		const str = String(seed) + salt;
		let h = 2166136261;
		for (let i = 0; i < str.length; i++) {
			h ^= str.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return ((h >>> 0) % 1000) / 1000; // 0..1
	}
	return (
		// hover:scale-[1.005]
		<div
			className={`relative group max-w-[99%] mx-auto grid md:grid-cols-[auto_1fr_1.2fr_0.3fr] gap-3 py-0.5 items-center
  bg-zinc-900/65 hover:bg-zinc-800/80
  shadow-sm hover:shadow-lg hover:shadow-black/40
  border-l-4 ${getStatusBorderColor(item.status)}
  border-b border-b-zinc-700/20
  rounded-md rounded-l-xl
  backdrop-blur-sm
  hover:-translate-y-0.5 
  transition-[transform,background-color,box-shadow]
  duration-420 ease-[cubic-bezier(0.34,1.56,0.64,1)]
  hover:cursor-pointer
  ${index === 0 ? "" : "my-0.5"}
  ${index === total - 1 && "rounded-bl-md"}
`}
			onClick={() => onClick(item)}
		>
			{/* ISLAND - COVER */}
			{(item.posterUrl ?? item.coverUrl) ? (
				<div className="w-20 aspect-2/3 relative shrink-0">
					<Image
						src={(item.posterUrl ?? item.coverUrl)!}
						alt={item.title || "Untitled"}
						width={1280}
						height={720}
						priority
						className={`relative h-auto self-stretch aspect-2/3 rounded-l-lg rounded-r-sm transition-transform duration-450 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04] group-hover:-translate-y-0.5 ${mediaType === "game" ? "object-cover" : "object-fill"} `}
					/>
				</div>
			) : (
				<div className="relative self-stretch aspect-2/3 bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30" />
			)}

			{/* ISLAND - CONTENT */}
			<div className="flex flex-col min-w-0 flex-1 relative z-10 self-stretch">
				{/* TOP PART */}
				<div className="flex-1 flex flex-col justify-center">
					{/* SERIES TITLE */}
					<div className="h-5 font-semibold text-zinc-400 text-sm group-hover:text-zinc-300 flex gap-1">
						{(s.seriesTitle ?? g.mainTitle) && (
							<>
								<span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
									{s.seriesTitle ?? g.mainTitle} ᭡
								</span>
								{s.placeInSeries && (
									<span>{s.placeInSeries}</span>
								)}
							</>
						)}
					</div>
					{/* TITLE */}
					<div className="flex items-start justify-between gap-4 min-w-0 -mt-0.75">
						<div className="flex items-baseline gap-2 min-w-0 max-w-full">
							<span className="title-line font-semibold text-zinc-300 text-[18px] group-hover:text-zinc-100/90 transition-colors duration-200 max-w-full inline-block align-bottom">
								<span className="block truncate">
									{item.title || "-"}
								</span>
								<svg
									preserveAspectRatio="none"
									viewBox="0 0 200 8"
									aria-hidden="true"
								>
									<path
										d={(() => {
											const seed =
												item.id ?? item.title ?? index;
											// stronger amplitude 3.5 - 4.8 for visible curves
											const amp =
												3.5 +
												pseudoRand(seed, 11) * 1.3;
											// random direction (above or below baseline first)
											const dir =
												pseudoRand(seed, 23) > 0.5
													? 1
													: -1;
											// slight phase offset so curves don't all look the same
											const phase =
												pseudoRand(seed, 37) * 0.4 -
												0.2;
											const baseline = 5;
											// cubic bezier — control points placed for smooth sine-like wave
											const p1y =
												baseline -
												amp * dir * (1 + phase);
											const p2y =
												baseline +
												amp * dir * (1 - phase);
											return `M 2 ${baseline} C 66 ${p1y}, 134 ${p2y}, 198 ${baseline}`;
										})()}
										style={{
											stroke: getStatusStrokeColor(
												item.status,
											),
										}}
									/>
								</svg>
							</span>
						</div>
					</div>

					<div className="flex items-center gap-x-1.5 group-hover:mt-1.25 ml-px text-[13px] text-zinc-500 font-semibold min-w-0 transition-[margin] ease-out">
						{/* AUTHOR */}
						<span className="truncate">
							{differentColumns[0].getValue(item)}
						</span>
						<span className="text-zinc-600 shrink-0">·</span>
						{/* RELEASE DATE */}
						<span className="shrink-0 tabular-nums">
							{differentColumns[1].getValue(item)}
						</span>
						{/* COMPLETED DATE */}
						{item.dateCompleted && item.status === "Completed" && (
							<span className="flex items-center gap-x-1.5 shrink-0">
								<span className="text-zinc-600">·</span>
								<span className="tabular-nums">
									{formatDateShort(item.dateCompleted)}
								</span>
							</span>
						)}
					</div>
				</div>

				{/* PROGRESS */}
				<div className="mb-2 -mt-3">
					{mediaType === "show" ? (
						<ShowProgressBarDesktop
							show={item as unknown as ShowProps}
						/>
					) : (
						<div
							className={`relative w-full mt-2 ${getStatusBg(item.status)} h-0.75 rounded-md overflow-hidden`}
						>
							<div
								className="absolute inset-0"
								style={{
									background: `${getStatusWaveColor(item.status)}`,
									animation: "wave 4s ease-in-out infinite",
									width: "200%",
								}}
							/>
						</div>
					)}
				</div>

				{/* NOTE */}
				<span className="block text-center text-[13px] font-medium text-zinc-400/90 truncate pb-1.5">
					{item.note ? (
						<>&ldquo;{item.note}&rdquo;</>
					) : (
						<>&ldquo;{"· · ·"}&rdquo;</>
					)}
				</span>
			</div>

			{/* ISLAND - BACKDROP */}
			{item.backdropUrl ? (
				<BackdropDesktop src={item.backdropUrl} />
			) : (
				item.coverUrl && (
					<BackdropDesktop src={item.coverUrl} is_book={true} />
				)
			)}

			{/* ISLAND - SCORE */}
			<div className="relative flex flex-col items-center justify-center -ml-3 mr-2">
				<ScoreBadge
					score={
						item.score?.mu
							? getDisplayScore(item.score.mu)
							: undefined
					}
					seed={item.id ?? item.title ?? index}
				/>
				<div
					className="w-px h-1.5 opacity-20 rounded-full"
					style={{ background: getStatusStrokeColor(item.status) }}
				/>
				<div
					className="h-px w-36 rounded-full"
					style={{
						background: `linear-gradient(to right, transparent, ${getStatusStrokeColor(item.status)}, transparent)`,
						opacity: 0.65,
					}}
				/>
			</div>
		</div>
	);
}) as <T extends BaseMediaProps>(props: DesktopItemProps<T>) => ReactNode;
