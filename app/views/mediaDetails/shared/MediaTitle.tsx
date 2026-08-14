"use client";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

// sizing for logo
const SIZES = {
	lg: { ink: 6000, minWidth: 140, maxWidth: 360, maxHeight: 100 },
	sm: { ink: 1850, minWidth: 78, maxWidth: 205, maxHeight: 58 },
};
const MAX_LINES = 3;
// stand-ins for the frame before the measurement lands -- a mid-range banner
const ASSUMED_COVERAGE = 0.38;

type Metric = { ratio: number; coverage: number; lines: number };

//
const TITLE_FILL =
	"bg-linear-to-b from-zinc-100 via-zinc-100/90 to-zinc-400/90 bg-clip-text text-transparent [background-repeat:repeat-y]";
const TITLE_RELIEF =
	"[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_8px_rgba(0,0,0,0.45))]";
const TITLE_BASE = `font-display uppercase ${TITLE_FILL} ${TITLE_RELIEF} text-balance break-words font-bold`;
//

export const TITLE_TEXT = {
	lg: `${TITLE_BASE} text-center max-w-full text-[2.4rem] leading-[1.1] [background-size:100%_1.1em] tracking-[0.03em]`,
	lgScreen: `${TITLE_BASE} text-center max-w-full text-[2rem] leading-[1.2] [background-size:100%_1.2em] tracking-[0.08em] [text-indent:0.16em]`,
	sm: `${TITLE_BASE} text-[1.7rem] leading-[1.12] [background-size:100%_1.12em] font-medium tracking-[0.06em] min-w-0`,
};

//
const SERIES_HALO =
	"[text-shadow:0_0_3px_rgba(0,0,0,0.95),0_1px_4px_rgba(0,0,0,0.8),0_0_14px_rgba(0,0,0,0.5)]";
const SERIES_BASE = `font-display uppercase font-normal ${SERIES_HALO} text-balance break-words`;
//

export const SERIES_TEXT = {
	lg: `${SERIES_BASE} text-center max-w-full mb-0.5 text-[0.95rem] leading-[1.5] tracking-[0.25em] text-zinc-200/80`,
	lgScreen: `${SERIES_BASE} text-center max-w-full mb-0.5 text-[0.85rem] leading-[1.5] tracking-[0.28em] text-zinc-200/80`,
	sm: `${SERIES_BASE} -mt-2.5 text-[0.7rem] leading-[1.4] tracking-[0.26em] text-zinc-400/75`,
};

// measured once per url and reused -- cache for relook
const metrics = new Map<string, Metric>();

// how much of the image is painted, and over how many lines of type
function inkStatsOf(img: HTMLImageElement): Omit<Metric, "ratio"> | null {
	// downscale first 
	const w = 128;
	const h = Math.max(
		1,
		Math.round((w * img.naturalHeight) / img.naturalWidth),
	);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;
	ctx.drawImage(img, 0, 0, w, h);

	// cross-origin pixels would taint the canvas
	let data: Uint8ClampedArray;
	try {
		data = ctx.getImageData(0, 0, w, h).data;
	} catch {
		return null;
	}

	const INK_ALPHA = 40;
	// columns that barely clip a serif would otherwise vote on the line count
	const MIN_INK_ROWS = Math.max(2, Math.round(h * 0.1));

	let ink = 0;
	// runs of ink down each column: a column crossing AVENGERS and DOOMSDAY
	// breaks into two, one crossing a single word stays whole. taking the median
	// tolerates the descenders and flourishes that bridge the gap in places
	const runsPerColumn: number[] = [];
	for (let x = 0; x < w; x++) {
		let runs = 0;
		let inked = 0;
		let wasInk = false;
		for (let y = 0; y < h; y++) {
			const alpha = data[(y * w + x) * 4 + 3];
			ink += alpha / 255;
			const isInk = alpha > INK_ALPHA;
			if (isInk) {
				inked += 1;
				if (!wasInk) runs += 1;
			}
			wasInk = isInk;
		}
		if (inked >= MIN_INK_ROWS) runsPerColumn.push(runs);
	}

	const coverage = ink / (w * h);
	// a fully opaque rectangle means no alpha channel to read -- treat it as
	// unmeasurable rather than shrinking it to nothing
	if (!(coverage > 0 && coverage < 0.97)) return null;

	runsPerColumn.sort((a, b) => a - b);
	const median = runsPerColumn[Math.floor(runsPerColumn.length / 2)] ?? 1;
	return { coverage, lines: Math.min(Math.max(median, 1), MAX_LINES) };
}

const widthFor = (
	{ ratio, coverage, lines }: Metric,
	size: keyof typeof SIZES,
) => {
	const { ink, minWidth, maxWidth, maxHeight } = SIZES[size];
	// inkPerLine = w * (w / ratio) * coverage / lines, solved for w
	const ideal = Math.sqrt((ink * lines * ratio) / coverage);
	const ceiling = Math.min(maxWidth, maxHeight * ratio);
	return Math.round(Math.min(Math.max(ideal, minWidth), ceiling));
};

// A title breaks at its subtitle colon before anywhere else: "MISTBORN:" over
// "THE FINAL EMPIRE", not the mid-phrase split an even balance would pick.
// Split on the first colon only, and only when there is something either side.
function titleParts(title: string): string[] {
	const at = title.indexOf(":");
	if (at <= 0 || at >= title.length - 1) return [title];
	return [title.slice(0, at + 1), title.slice(at + 1).trim()];
}

function widestLine(el: HTMLElement): number | null {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const rects: DOMRect[] = [];
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		// the separator between parts would pad the end of a line
		if (!node.textContent?.trim()) continue;
		const textRange = document.createRange();
		textRange.selectNodeContents(node);
		rects.push(...Array.from(textRange.getClientRects()));
	}
	if (!rects.length) return null;

	const lines: { top: number; left: number; right: number }[] = [];
	for (const rect of rects
		.filter((r) => r.width > 0)
		.sort((a, b) => a.top - b.top)) {
		const line = lines[lines.length - 1];
		// same line if it starts within half a row of the one before it
		if (line && rect.top - line.top < rect.height * 0.5) {
			line.left = Math.min(line.left, rect.left);
			line.right = Math.max(line.right, rect.right);
		} else {
			lines.push({ top: rect.top, left: rect.left, right: rect.right });
		}
	}
	if (!lines.length) return null;
	return Math.ceil(Math.max(...lines.map((l) => l.right - l.left)));
}

function StatusWave({
	color,
	width,
	isBook,
	isLogo,
}: {
	color: string;
	width?: number;
	isBook: boolean;
	isLogo?: boolean;
}) {
	const spacing = isLogo
		? "mt-3 -mb-1"
		: isBook
			? "mt-1.5 mb-1"
			: "mt-1 mb-1";

	return (
		<div
			className={`bg-zinc-800 rounded-full h-0.75 overflow-hidden mx-auto max-w-full ${spacing}`}
			style={{ width: width ?? "100%" }}
		>
			<div className="bg-zinc-900 h-0.75 w-full rounded-full relative overflow-hidden">
				<div
					className="absolute inset-0"
					style={{
						background: color,
						animation: "wave 6s ease-in-out infinite",
						width: "200%",
					}}
				/>
			</div>
		</div>
	);
}

interface MediaTitleProps {
	title: string;
	logoUrl?: string | null;
	isBook: boolean;
	size: keyof typeof SIZES;
	textClass: string;
	className?: string;
	underlineColor?: string;
}

export function MediaTitle({
	title,
	logoUrl,
	size,
	textClass,
	className = "",
	underlineColor,
	isBook,
}: MediaTitleProps) {
	const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
	const [, setMeasuredAt] = useState(0);

	const showsText = !logoUrl || brokenUrl === logoUrl;
	const textRef = useRef<HTMLDivElement | null>(null);
	// longest rendered line
	const [lineWidth, setLineWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		const el = textRef.current;
		if (!showsText || !el) return;

		const measure = () => {
			const widest = widestLine(el);
			if (widest !== null) setLineWidth(widest);
		};
		measure();

		// the display face swaps in after first paint and the fluid root
		// rescales the type with the viewport -- both move the line ends
		document.fonts?.ready.then(measure).catch(() => {});
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [showsText, title, textClass]);

	if (showsText) {
		return (
			<div className={`flex flex-col max-w-full ${className}`}>
				<div ref={textRef} className={textClass}>
					{/* inline-block keeps each part whole: they share a line
					    when they fit, split at the colon when they don't, and a
					    part too wide on its own still wraps inside itself */}
					{titleParts(title || "Untitled").map((part, i) => (
						<Fragment key={i}>
							{i > 0 && " "}
							<span className="inline-block max-w-full">
								{part}
							</span>
						</Fragment>
					))}
				</div>
				{underlineColor && (
					<StatusWave
						color={underlineColor}
						width={lineWidth}
						isBook={isBook}
					/>
				)}
			</div>
		);
	}

	const measured = metrics.get(logoUrl);
	const { maxWidth, maxHeight } = SIZES[size];
	// Before the measurement lands, cap by height and let width follow the
	// artwork. Guessing a ratio is what let a near-square mark render at banner
	// width: the height clamp is spent as `maxHeight * ratio` worth of width, so
	// a guess of 3.5 handed a 1.2:1 logo three times the headroom it was owed.
	const sizing = measured
		? { width: widthFor(measured, size), height: "auto", maxHeight }
		: { height: maxHeight, width: "auto", maxWidth };

	return (
		<div className={`w-fit max-w-full ${className}`}>
			<Image
				src={logoUrl}
				alt={title || "Untitled"}
				width={500}
				height={200}
				// next/image refuses to optimise svg without dangerouslyAllowSVG
				unoptimized={logoUrl.toLowerCase().endsWith(".svg")}
				onLoad={(e) => {
					if (metrics.has(logoUrl)) return;
					const img = e.currentTarget;
					if (!img.naturalWidth || !img.naturalHeight) return;
					// same element, already decoded -- no second fetch, and the
					// optimiser keeps it same-origin so the canvas reads back
					metrics.set(logoUrl, {
						ratio: img.naturalWidth / img.naturalHeight,
						...(inkStatsOf(img) ?? {
							coverage: ASSUMED_COVERAGE,
							lines: 1,
						}),
					});
					setMeasuredAt(Date.now());
				}}
				// copy to clipboard for logo
				onClick={() => {
					navigator.clipboard?.writeText(title).catch(() => {});
				}}
				onError={() => setBrokenUrl(logoUrl)}
				// height auto -- the ratio is the artwork's, never imposed
				style={sizing}
				className="block max-w-full object-contain cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
			/>
			{underlineColor && (
				<StatusWave color={underlineColor} isBook={isBook} isLogo />
			)}
		</div>
	);
}
