// FOR GAME/MOVIE/BOOK
import { BaseMediaProps, SeriesMediaProps } from "@/types/media";
import { GameProps } from "@/types/game";
import { BookProps } from "@/types/book";

interface SeriesNavProps {
	item: BaseMediaProps;
	mediaType: string;
	isAdding: boolean;
	onAction: (action: { type: string; payload?: unknown }) => void;
}

export function SeriesNav({
	item,
	mediaType,
	isAdding,
	onAction,
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
