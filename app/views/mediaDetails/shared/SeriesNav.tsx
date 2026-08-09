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
	isInList?: (title: string) => boolean;
}

export function NotInListBadge() {
	return (
		<span
			title="Not in your list — opens the add flow"
			className="shrink-0 rounded-full border border-zinc-700/70 px-1 text-[0.6rem] leading-[1.15] font-semibold text-zinc-500/90"
		>
			+
		</span>
	);
}

export function SeriesNav({
	item,
	mediaType,
	isAdding,
	onAction,
	accentColor,
	isInList,
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

	const isMissing = (
		entry: { name?: string | null; action: { type: string } } | null,
	) =>
		!!entry?.name &&
		!!isInList &&
		entry.action.type === "seriesNav" &&
		!isInList(entry.name);
	const prevMissing = isMissing(nav.prev);
	const nextMissing = isMissing(nav.next);

	const nameStyle = (missing: boolean) =>
		`text-sm font-medium transition-colors duration-200 group-hover:underline group-hover:underline-offset-4 ${
			missing
				? "text-zinc-300/45 group-hover:text-zinc-300/70 group-hover:decoration-dotted group-hover:decoration-zinc-400/80"
				: "text-zinc-300/70 group-hover:text-zinc-300/85"
		}`;

	// show art if no series
	if (!nav.prev && !nav.center && !nav.next) {
		const acc = accentColor
			? `color-mix(in srgb, ${accentColor} 55%, #52525b)`
			: "#52525b";
		const half = (
			<>
				{/* swag + the shorter inner strand pinned just inside it */}
				<path
					d="M0 13 C 30 21.5, 60 25.6, 90 25.6"
					stroke="currentColor"
					strokeWidth="1.1"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>
				<path
					d="M13 14.6 C 38 20.8, 64 23.4, 90 23.4"
					stroke="currentColor"
					strokeWidth="1.1"
					strokeOpacity="0.45"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>
				{/* bead high on the descent */}
				<path
					d="M30 19.6 L30 21.4"
					stroke="currentColor"
					strokeWidth="0.9"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>
				{/* leaf hanging off the swag, with a hairline rib */}
				<path
					d="M52 23.1 C 48 24.3, 44.6 27.4, 43 30.8 C 46.6 30.1, 50.4 28.1, 52 23.1 Z"
					stroke="currentColor"
					strokeWidth="0.9"
					fill="currentColor"
					fillOpacity="0.18"
					strokeLinejoin="round"
					vectorEffect="non-scaling-stroke"
				/>
				<path
					d="M51.4 24.1 C 48.6 25.8, 45.8 28.2, 43.4 30.4"
					stroke="currentColor"
					strokeWidth="0.9"
					strokeOpacity="0.5"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>
				{/* heavier bead where the swag flattens out */}
				<path
					d="M74 25.1 L74 27.8"
					stroke="currentColor"
					strokeWidth="0.9"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>
				<g fill="currentColor">
					<circle cx="30" cy="22.4" r="0.9" />
					<circle cx="74" cy="28.9" r="1.1" />
					{/* pin where the strand meets the swag */}
					<circle cx="0.8" cy="13" r="1.5" />
				</g>
			</>
		);
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
								d="M0 5 C 34 7, 62 11.4, 92 12.8 C 102 13.2, 111 13.1, 120 13"
								stroke={`url(#${uid}-l)`}
								strokeWidth="1.1"
								strokeLinecap="round"
								vectorEffect="non-scaling-stroke"
							/>
						</svg>
					</div>
					{/* centre festoon + lozenge pendant */}
					<svg
						className="h-9 shrink-0"
						width={180}
						viewBox="0 0 180 36"
						fill="none"
						style={{ overflow: "visible" }}
					>
						{half}
						<g transform="translate(180,0) scale(-1,1)">{half}</g>
						{/* lozenge medallion hung from the swag */}
						<path
							d="M90 25.6 L94 29.6 L90 33.6 L86 29.6 Z"
							stroke="currentColor"
							strokeWidth="1.1"
							fill="currentColor"
							fillOpacity="0.16"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d="M90 33.6 L90 34.3"
							stroke="currentColor"
							strokeWidth="1"
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
						<g fill="currentColor">
							<path d="M90 27.9 L91.6 29.6 L90 31.3 L88.4 29.6 Z" />
							<circle cx="90" cy="35.1" r="0.85" />
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
								d="M0 13 C 9 13.1, 18 13.2, 28 12.8 C 58 11.4, 86 7, 120 5"
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
									{prevMissing && <NotInListBadge />}
								</span>
							</label>
							<span className={nameStyle(prevMissing)}>
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
									{nextMissing && <NotInListBadge />}
									<span>{nav.next.label}</span>
									<span>→</span>
								</span>
							</label>
							<span className={nameStyle(nextMissing)}>
								{nav.next.name}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
