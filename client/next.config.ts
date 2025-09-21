import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // OPEN LIBRARY
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        port: "",
        pathname: "/b/olid/**",
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
