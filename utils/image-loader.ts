type ImageLoaderProps = { src: string; width: number; quality?: number };

// TMDB accepts any of these tokens on any image path
const TMDB_WIDTHS = [45, 92, 154, 185, 300, 342, 500, 780, 1280];

// IGDB presets
const IGDB_PRESETS: Array<[number, string]> = [
	[90, "t_cover_small"],
	[264, "t_cover_big"],
	[540, "t_720p"],
	[810, "t_1080p"],
];

// smallest variant that still covers the requested width, else the largest
const atLeast = (ladder: number[], width: number) =>
	ladder.find((w) => w >= width) ?? ladder[ladder.length - 1];

// hosts verified to answer with `access-control-allow-origin: *`.
export const corsMode = (src: string): "anonymous" | undefined =>
	src.includes("image.tmdb.org") || src.includes("images.igdb.com")
		? "anonymous"
		: undefined;

export default function mouthfulImageLoader({
	src,
	width,
}: ImageLoaderProps): string {
	// public/ assets and any already-relative path are served as authored
	if (src.startsWith("/")) return src;

	if (src.includes("image.tmdb.org")) {
		// svg logos carry no raster size
		if (src.toLowerCase().endsWith(".svg")) return src;
		return src.replace(
			/\/t\/p\/(w\d+|h\d+|original)\//,
			`/t/p/w${atLeast(TMDB_WIDTHS, width)}/`,
		);
	}

	if (src.includes("images.igdb.com")) {
		const preset =
			IGDB_PRESETS.find(([w]) => w >= width) ??
			IGDB_PRESETS[IGDB_PRESETS.length - 1];
		return src.replace(/\/t_[a-z0-9_]+\//, `/${preset[1]}/`);
	}

	// hardcover, google books and steamgriddb expose no size api -- pass through
	return src;
}
