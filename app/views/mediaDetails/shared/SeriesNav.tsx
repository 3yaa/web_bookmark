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
	// tints the no-series art -- picked off the poster, nothing is stored
	accentColor?: string;
}

const ART_SRC = "/non-series-placeholder.png";

// optimizer's url instead of pulling the full-size png a second time.
const ART_MASK_SRC = `/_next/image?url=${encodeURIComponent(ART_SRC)}&w=1080&q=75`;

const ART_MASK = {
	maskImage: `url(${ART_MASK_SRC})`,
	WebkitMaskImage: `url(${ART_MASK_SRC})`,
	maskSize: "cover",
	WebkitMaskSize: "cover",
	maskPosition: "center 37%",
	WebkitMaskPosition: "center 37%",
	maskRepeat: "no-repeat",
	WebkitMaskRepeat: "no-repeat",
} as React.CSSProperties;

const tint = (pct: number, into = "transparent") =>
	`color-mix(in srgb, var(--c) ${pct}%, ${into})`;

const TOP_FADE = "linear-gradient(to bottom, transparent 0%, #000 10%)";

// the depth the series row occupies, feathered in from above so the softened
// zone has no edge of its own
const FROST_FADE = "linear-gradient(to bottom, transparent 0%, #000 52%)";
const FROST = "blur(5px) saturate(0.9) brightness(0.72)";

function SeriesArt({
	accentColor,
	// when the series row rides on top, the art steps back rather than the type
	// stepping up -- scrims and shadows on the row read as clutter
	behindText,
}: {
	accentColor?: string;
	behindText?: boolean;
}) {
	const tinted = !!accentColor;
	// the frosted zone carries legibility, so the art keeps its strength
	const opacity = behindText ? (tinted ? 0.85 : 0.65) : tinted ? 0.92 : 0.7;
	return (
		<div className="flex justify-center select-none" aria-hidden="true">
			<div className="relative w-full h-14 -mb-2.5 left-[-2.5%]">
				<div
					className="absolute inset-x-0 -top-2.5 -bottom-4 pointer-events-none"
					style={{
						WebkitMaskImage: TOP_FADE,
						maskImage: TOP_FADE,
					}}
				>
					<div
						className="absolute inset-0"
						style={
							{
								transform: "scaleY(-1)",
								// keeps the blend layers off the modal
								isolation: "isolate",
								opacity,
								"--c": accentColor,
							} as React.CSSProperties
						}
					>
						{/* AURA -- light spilling off the cloud */}
						{tinted && (
							<div
								className="absolute inset-0"
								style={{
									backgroundImage: `radial-gradient(58% 78% at 50% 62%, ${tint(
										34,
									)} 0%, ${tint(12)} 45%, transparent 74%)`,
								}}
							/>
						)}
						{/* SHAPE + SHADING */}
						<Image
							src={ART_SRC}
							alt=""
							fill
							sizes="(min-width: 1024px) 860px, 100vw"
							className="object-cover"
							style={{
								objectPosition: "center 37%",
								filter: tinted
									? "grayscale(1) brightness(1.08) contrast(1.06)"
									: "grayscale(0.7)",
							}}
						/>
						{/* PAINT */}
						{tinted && (
							<div
								className="absolute inset-0"
								style={{
									backgroundImage: `linear-gradient(to bottom, ${tint(
										100,
									)} 0%, ${tint(92)} 45%, ${tint(78)} 100%)`,
									mixBlendMode: "multiply",
									...ART_MASK,
								}}
							/>
						)}
						{/* SHEEN */}
						{tinted && (
							<div
								className="absolute inset-0"
								style={{
									backgroundImage:
										"linear-gradient(to bottom, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 45%, transparent 78%)",
									mixBlendMode: "plus-lighter",
									...ART_MASK,
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
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
	accentColor,
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
				<SeriesArt accentColor={accentColor} />
			</div>
		);
	}

	return (
		<div className="-mt-2 relative">
			{/* same band as the no-series state -- the row rides on top of it
			    instead of sitting under a rule */}
			<SeriesArt accentColor={accentColor} behindText />
			{/* the art carries on behind the row, just out of focus -- what made
			    the type hard to read was the strokes crossing it, not the
			    brightness, so this softens them in place instead of veiling the
			    art or dressing up the text */}
			<div
				className="absolute inset-x-0 top-1/4 -bottom-4 pointer-events-none"
				style={{
					backdropFilter: FROST,
					WebkitBackdropFilter: FROST,
					maskImage: FROST_FADE,
					WebkitMaskImage: FROST_FADE,
				}}
			/>
			<div className="absolute inset-0 flex items-end pr-2">
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

					{/* the position sits over the densest part of the art, so it
					    runs brighter than the labels flanking it */}
					<div className="flex justify-center items-end pb-0.5">
						{nav.center && (
							<label className="text-xs font-semibold text-zinc-400 tabular-nums block">
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
		</div>
	);
}
