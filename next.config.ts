import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "https://mouthful-server.tailffb772.ts.net/:path*",
			},
		];
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			// HARDCOVER
			{
				protocol: "https",
				hostname: "assets.hardcover.app",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "books.google.com",
				port: "",
				pathname: "/books/content**",
			},
			// TMDB
			{
				protocol: "https",
				hostname: "image.tmdb.org",
				port: "",
				pathname: "/t/p/**",
			},
			// IGDB
			{
				protocol: "https",
				hostname: "images.igdb.com",
				port: "",
				pathname: "/igdb/image/upload/**",
			},
			// STEAMGRIDDB
			{
				protocol: "https",
				hostname: "*.steamgriddb.com",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
