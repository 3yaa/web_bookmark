import imageLoader, { corsMode } from "@/utils/image-loader";

const cache = new Map<string, string[]>();

export async function extractCoverPalette(
	url: string | undefined,
	max = 6,
): Promise<string[]> {
	if (!url) return [];
	// keyed by max too -- a small request must not satisfy a later larger one
	const key = `${url}|${max}`;
	const cached = cache.get(key);
	if (cached) return cached;
	try {
		const colors = await run(url, max);
		cache.set(key, colors);
		return colors;
	} catch {
		return [];
	}
}

function run(url: string, max: number): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const cors = corsMode(url);
		if (cors) {
			// tmdb and igdb serve cors
			img.crossOrigin = cors;
			img.src = imageLoader({ src: url, width: 96 });
		} else {
			// hardcover and google books send no cors header
			img.src = `/cover-proxy?url=${encodeURIComponent(url)}`;
		}
		img.onload = () => {
			try {
				const w = 64;
				const h = Math.max(
					1,
					Math.round((img.height / img.width || 1.5) * w),
				);
				const canvas = document.createElement("canvas");
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext("2d", {
					willReadFrequently: true,
				});
				if (!ctx) return reject(new Error("no 2d context"));
				ctx.drawImage(img, 0, 0, w, h);
				const { data } = ctx.getImageData(0, 0, w, h);
				resolve(quantize(data, max));
			} catch (e) {
				reject(e);
			}
		};
		img.onerror = () => reject(new Error("cover load failed"));
	});
}

type RGB = { r: number; g: number; b: number };

function quantize(data: Uint8ClampedArray, max: number): string[] {
	// bucket colours by their top 4 bits per channel, tracking population + an
	// average so each swatch is a true colour rather than the bucket corner
	const buckets = new Map<
		number,
		{ n: number; r: number; g: number; b: number }
	>();
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 125) continue; // skip transparent
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
		const bkt = buckets.get(key);
		if (bkt) {
			bkt.n++;
			bkt.r += r;
			bkt.g += g;
			bkt.b += b;
		} else {
			buckets.set(key, { n: 1, r, g, b });
		}
	}

	const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
	const picked: RGB[] = [];
	for (const bkt of sorted) {
		const c: RGB = {
			r: Math.round(bkt.r / bkt.n),
			g: Math.round(bkt.g / bkt.n),
			b: Math.round(bkt.b / bkt.n),
		};
		// drop near-duplicates so the row shows distinct choices
		if (picked.some((p) => dist(p, c) < 48)) continue;
		picked.push(c);
		if (picked.length >= max) break;
	}
	return picked.map(toHex);
}

function dist(a: RGB, b: RGB): number {
	return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function toHex({ r, g, b }: RGB): string {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
