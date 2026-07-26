// FOR GAME/MOVIE/BOOK
import { useId } from "react";
import { BaseMediaProps, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import { BookProps } from "@/types/book";

interface SeriesNavProps {
	item: BaseMediaProps;
	mediaType: string;
	isAdding: boolean;
	onAction: (action: { type: string; payload?: unknown }) => void;
	accentColor?: string;
}

export function SeriesNav({
	item,
	mediaType,
	isAdding,
	onAction,
	accentColor,
}: SeriesNavProps) {
	const uid = useId().replace(/:/g, "");
	const nav =
		mediaType === "game"
			? (() => {
					const g = item as unknown as GameProps;
					return {
						prev:
							g.dlcs && g.dlcIndex - 1 >= 0
								? {
										label: "Previous",
										name: g.dlcs[g.dlcIndex - 1].name,
										action: {
											type: "dlcNav",
											payload: "prev",
										},
									}
								: null,
						center: g.dlcIndex !== 0 ? String(g.dlcIndex) : null,
						next:
							g.dlcs && g.dlcIndex + 1 < g.dlcs.length
								? {
										label: "Next",
										name: g.dlcs[g.dlcIndex + 1].name,
										action: {
											type: "dlcNav",
											payload: "next",
										},
									}
								: null,
					};
				})()
			: mediaType === "book"
				? (() => {
						const b = item as unknown as BookProps;
						return {
							prev: b.prequel
								? {
										label: "Prequel",
										name: b.prequel,
										action: {
											type: "seriesNav",
											payload: "prequel",
										},
									}
								: null,
							center: b.placeInSeries
								? b.total
									? `${b.placeInSeries}/${b.total}`
									: b.placeInSeries
								: null,
							next: b.sequel
								? {
										label: "Sequel",
										name: b.sequel,
										action: {
											type: "seriesNav",
											payload: "sequel",
										},
									}
								: null,
						};
					})()
				: (() => {
						const s = item as unknown as SeriesMediaProps;
						return {
							prev: s.prequel
								? {
										label: "Prequel",
										name: s.prequel,
										action: {
											type: "seriesNav",
											payload: "prequel",
										},
									}
								: null,
							center: s.placeInSeries ?? null,
							next: s.sequel
								? {
										label: "Sequel",
										name: s.sequel,
										action: {
											type: "seriesNav",
											payload: "sequel",
										},
									}
								: null,
						};
					})();

	// no series/dlc to navigate — a hanging garland instead: strands pinned high
	// at the outer edges droop down into a centre festoon + drop pendant. Same
	// ~min-h-9 section height the series block takes, so the layout stays put.
	if (!nav.prev && !nav.center && !nav.next) {
		const acc = accentColor
			? `color-mix(in srgb, ${accentColor} 55%, #52525b)`
			: "#52525b";
		return (
			<div className="pt-2.5 pr-2">
				<div
					className="flex items-start pr-1.5 select-none opacity-70"
					style={{ color: acc }}
				>
					{/* left strand — high at the edge, drooping toward centre */}
					<div className="flex-1 h-9">
						<svg
							className="w-full h-full"
							viewBox="0 0 120 36"
							preserveAspectRatio="none"
							fill="none"
						>
							<defs>
								<linearGradient
									id={`${uid}-l`}
									x1="0"
									y1="0"
									x2="1"
									y2="0"
								>
									<stop
										offset="0"
										stopColor="currentColor"
										stopOpacity="0"
									/>
									<stop
										offset="0.22"
										stopColor="currentColor"
										stopOpacity="1"
									/>
									<stop
										offset="1"
										stopColor="currentColor"
										stopOpacity="1"
									/>
								</linearGradient>
							</defs>
							<path
								d="M0 5 C 34 7, 62 15, 92 16 C 102 16.3, 111 16.2, 120 16"
								stroke={`url(#${uid}-l)`}
								strokeWidth="1.1"
								strokeLinecap="round"
								vectorEffect="non-scaling-stroke"
							/>
						</svg>
					</div>
					{/* centre festoon + drop pendant */}
					<svg
						className="h-9 shrink-0"
						width="64"
						viewBox="0 0 64 36"
						fill="none"
						style={{ overflow: "visible" }}
					>
						<path
							d="M2 16 C 16 21, 24 23, 32 23 C 40 23, 48 21, 62 16"
							stroke="currentColor"
							strokeWidth="1.1"
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d="M9 16 C 19 20, 26 21.5, 32 21.5 C 38 21.5, 45 20, 55 16"
							stroke="currentColor"
							strokeWidth="1.1"
							strokeOpacity="0.5"
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d="M32 22 C 28.5 25, 28.5 29, 32 32 C 35.5 29, 35.5 25, 32 22 Z"
							stroke="currentColor"
							strokeWidth="1.1"
							fill="currentColor"
							fillOpacity="0.16"
							vectorEffect="non-scaling-stroke"
						/>
						<g fill="currentColor">
							<circle cx="2" cy="16" r="1.6" />
							<circle cx="62" cy="16" r="1.6" />
							<path d="M32 31 L34.2 33.4 L32 35.8 L29.8 33.4 Z" />
						</g>
					</svg>
					{/* right strand — mirror */}
					<div className="flex-1 h-9">
						<svg
							className="w-full h-full"
							viewBox="0 0 120 36"
							preserveAspectRatio="none"
							fill="none"
						>
							<defs>
								<linearGradient
									id={`${uid}-r`}
									x1="0"
									y1="0"
									x2="1"
									y2="0"
								>
									<stop
										offset="0"
										stopColor="currentColor"
										stopOpacity="1"
									/>
									<stop
										offset="0.78"
										stopColor="currentColor"
										stopOpacity="1"
									/>
									<stop
										offset="1"
										stopColor="currentColor"
										stopOpacity="0"
									/>
								</linearGradient>
							</defs>
							<path
								d="M0 16 C 9 16.2, 18 16.3, 28 16 C 58 15, 86 7, 120 5"
								stroke={`url(#${uid}-r)`}
								strokeWidth="1.1"
								strokeLinecap="round"
								vectorEffect="non-scaling-stroke"
							/>
						</svg>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-2.5 border-t border-zinc-800/80 pr-2">
			<div className="grid grid-cols-[1fr_3rem_1fr] gap-3 w-full pr-1.5 select-none">
				<div className="truncate text-left">
					{nav.prev && (
						<div
							className={`group flex flex-col ${!isAdding ? "hover:cursor-pointer" : ""}`}
							onClick={() => {
								if (!isAdding) onAction(nav.prev!.action);
							}}
						>
							<label className="text-xs font-medium text-zinc-500 block pointer-events-none">
								<span className="inline-flex items-center gap-1">
									<span>←</span>
									<span>{nav.prev.label}</span>
								</span>
							</label>
							<span className="text-sm text-zinc-300/70 font-medium group-hover:text-zinc-300/85 group-hover:underline transition-colors duration-200">
								{nav.prev.name}
							</span>
						</div>
					)}
				</div>

				<div className="flex justify-center items-end pb-0.5">
					{nav.center && (
						<label className="text-xs font-semibold text-zinc-400/90 block">
							{nav.center}
						</label>
					)}
				</div>

				<div className="truncate text-right">
					{nav.next && (
						<div
							className={`group flex flex-col ${!isAdding ? "hover:cursor-pointer" : ""}`}
							onClick={() => {
								if (!isAdding) onAction(nav.next!.action);
							}}
						>
							<label className="text-xs font-medium text-zinc-500 block pointer-events-none">
								<span className="inline-flex items-center gap-1">
									<span>{nav.next.label}</span>
									<span>→</span>
								</span>
							</label>
							<span className="text-sm text-zinc-300/70 font-medium group-hover:text-zinc-300/85 group-hover:underline transition-colors duration-200">
								{nav.next.name}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
