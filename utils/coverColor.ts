import { MediaCoverProps } from "@/types/media";
import { extractCoverPalette } from "./extractCoverPalette";

// tmdb and igdb hand back artwork with no colour attached (hardcover gives books
// theirs for free), so read the dominant swatch straight off the image. an empty
// colour is fine -- every consumer falls back to a neutral.
export async function buildCover(
	url: string | undefined | null,
): Promise<MediaCoverProps | undefined> {
	if (!url) return undefined;
	// pull the whole palette rather than just the top swatch -- buckets are
	// ordered by population so [0] is the same either way, and this leaves the
	// full set cached for the colour picker to open instantly
	const [color] = await extractCoverPalette(url);
	return { url, color: color ?? "" };
}
