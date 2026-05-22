import React, { ReactNode } from "react";
import Image from "next/image";
import { BaseMediaProps, ColumnConfig } from "@/types/media";
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
	rank,
	mediaType,
	onClick,
	differentColumns,
}: DesktopItemProps<T>) {
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
			className={`relative group max-w-[99%] mx-auto grid md:grid-cols-[auto_1fr_0.8fr_0.4fr] gap-3 py-0.5 items-center
  bg-zinc-900/65 hover:bg-zinc-800/80
  shadow-sm hover:shadow-lg hover:shadow-black/40
  border-l-4 ${getStatusBorderColor(item.status)}
  border-b border-b-zinc-700/20
  rounded-md rounded-l-xl
  backdrop-blur-sm
  hover:-translate-y-0.5 
	
  transition-[transform,background-color,box-shadow]
  duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
  hover:cursor-pointer
  ${index === 0 ? "" : "my-0.5"}
  ${index === total - 1 && "rounded-bl-md"}
`}
			onClick={() => onClick(item)}
		>
			{/* ISLAND - COVER */}
			{(item.posterUrl ?? item.coverUrl) ? (
				<div className="w-22 aspect-2/3 relative z-10 shrink-0">
					<Image
						src={(item.posterUrl ?? item.coverUrl)!}
						alt={item.title || "Untitled"}
						width={1280}
						height={720}
						priority
						className={`relative z-10 h-auto self-stretch aspect-2/3 rounded-l-lg rounded-r-sm transition-transform duration-450 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04] group-hover:-translate-y-0.5 ${mediaType === "game" ? "object-cover" : "object-fill"}`}
					/>
				</div>
			) : (
				<div className="relative z-10 self-stretch aspect-2/3 bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30" />
			)}

			{/* ISLAND - CONTENT */}
			<div className="flex flex-col min-w-0 flex-1 relative z-10 py-0.5">
				{/* SERIES TITLE */}
				<div className="font-semibold text-zinc-400 text-sm group-hover:text-zinc-300 flex gap-1">
					{(item.seriesTitle ?? item.mainTitle) ? (
						<>
							<span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
								{item.seriesTitle ?? item.mainTitle}
							</span>
							<span>᭡</span>
							{item.placeInSeries && (
								<span>{item.placeInSeries}</span>
							)}
						</>
					) : (
						""
					)}
				</div>
				{/* TITLE */}
				<div className="flex items-start justify-between gap-4 min-w-0">
					<div className="flex items-baseline gap-2 min-w-0 max-w-full">
						<span className="title-line font-semibold text-zinc-100 text-[18px] group-hover:text-white transition-colors duration-200 max-w-full inline-block align-bottom">
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
											3.5 + pseudoRand(seed, 11) * 1.3;
										// random direction (above or below baseline first)
										const dir =
											pseudoRand(seed, 23) > 0.5 ? 1 : -1;
										// slight phase offset so curves don't all look the same
										const phase =
											pseudoRand(seed, 37) * 0.4 - 0.2;
										const baseline = 5;
										// cubic bezier — control points placed for smooth sine-like wave
										const p1y =
											baseline - amp * dir * (1 + phase);
										const p2y =
											baseline + amp * dir * (1 - phase);
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

				<div className="flex gap-2 items-center mt-1">
					{/* AUTHOR */}
					<span className="text-zinc-400 text-sm truncate">
						{differentColumns[0].getValue(item)}
					</span>
					<span className="text-zinc-400">·</span>
					{/* RELEASE DATE */}
					<span className="text-zinc-500 text-sm shrink-0">
						{differentColumns[1].getValue(item)}
					</span>
				</div>

				{/* COMPLETED DATE */}
				{item.dateCompleted ? (
					<div className="flex items-center gap-2 mt-1 text-sm">
						{item.status === "Completed" && item.dateCompleted && (
							<span className="text-zinc-500 ml-1">
								{formatDateShort(item.dateCompleted)}
							</span>
						)}
					</div>
				) : (
					""
				)}

				{/* PROGRESS */}
				{mediaType === "show" ? (
					<ShowProgressBarDesktop
						show={item as unknown as ShowProps}
					/>
				) : (
					<div
						className={`absolute -bottom-2.5 left-0 w-[85%] ${getStatusBg(
							item.status,
						)} h-0.75 rounded-md overflow-hidden`}
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

				{/* NOTE */}
				{item.note && (
					<span className="text-zinc-400 text-sm italic truncate mt-1">
						&ldquo;{item.note}&rdquo;
					</span>
				)}
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
			<div className="flex flex-col items-center justify-center gap-1">
				<ScoreBadge
					score={
						item.score?.mu
							? getDisplayScore(item.score.mu)
							: undefined
					}
					seed={item.id ?? item.title ?? index}
				/>
				<span
					className="px-2 py-0.5 text-[11px] font-black uppercase whitespace-nowrap rounded-xs select-none tracking-wide -rotate-6 group-hover:rotate-0 transition-transform duration-300 ease-out"
					style={{
						color: getStatusStrokeColor(item.status),
						border: `1.5px dashed ${getStatusStrokeColor(item.status)}`,
						opacity: 0.82,
					}}
				>
					{item.status}
				</span>
			</div>
		</div>
	);
}) as <T extends BaseMediaProps>(props: DesktopItemProps<T>) => ReactNode;
