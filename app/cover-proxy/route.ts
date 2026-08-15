import { NextRequest } from "next/server";

// Hardcover send no `access-control-allow-origin`, so the color canvas cannot read their pixels cross-origin.
//
const ALLOWED_HOSTS = new Set(["assets.hardcover.app"]);

export async function GET(request: NextRequest) {
	const raw = request.nextUrl.searchParams.get("url");
	if (!raw) return new Response("missing url", { status: 400 });

	let target: URL;
	try {
		target = new URL(raw);
	} catch {
		return new Response("malformed url", { status: 400 });
	}

	if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
		return new Response("host not allowed", { status: 403 });
	}

	const upstream = await fetch(target, { cache: "force-cache" });
	if (!upstream.ok) {
		return new Response("upstream fetch failed", { status: 502 });
	}

	return new Response(upstream.body, {
		headers: {
			"content-type":
				upstream.headers.get("content-type") ?? "image/jpeg",
			// cover art at a given url is immutable on both hosts
			"cache-control": "public, max-age=31536000, immutable",
		},
	});
}
