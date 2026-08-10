// FOR GAME/MOVIE/BOOK
import Image from "next/image";
import { BaseMediaProps, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import { BookProps } from "@/types/book";

interface SeriesNavProps {
	item: BaseMediaProps;
	mediaType: string;
	isAdding: boolean;
	onAction: (action: { type: string; payload?: unknown }) => void;
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
	isInList,
}: SeriesNavProps) {
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
		return (
			<div className="-mt-2">
				<div
					className="flex justify-center select-none"
					aria-hidden="true"
				>
					<div className="relative w-full h-14 -mb-2.5 left-[-2.5%]">
						<div
							className="absolute inset-x-0 -top-2.5 -bottom-4 pointer-events-none"
							style={{
								WebkitMaskImage:
									"linear-gradient(to bottom, transparent 0%, #000 10%)",
								maskImage:
									"linear-gradient(to bottom, transparent 0%, #000 10%)",
							}}
						>
							<Image
								src="/non-series-placeholder.png"
								alt=""
								fill
								sizes="(min-width: 1024px) 860px, 100vw"
								className="object-cover"
								style={{
									opacity: 0.7,
									objectPosition: "center 37%",
									filter: "grayscale(0.7)",
									transform: "scaleY(-1)",
								}}
							/>
						</div>
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
