import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://mouthful-api.onrender.com/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      // OPEN LIBRARY
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        port: "",
        pathname: "/b/olid/**",
      },
      {
        protocol: "https",
        hostname: "ia600505.us.archive.org",
        port: "",
        pathname: "/view_archive.php?archive=/**",
      },
      // GOOGLE BOOKS
      {
        protocol: "http",
        hostname: "books.google.com",
        port: "",
        pathname: "/books/content**",
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
    ],
  },
};

export default nextConfig;
