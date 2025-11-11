"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Book, Film, Tv, Gamepad2 } from "lucide-react";
import LightRays from "@/app/components/ui/LightRays";

const sections = [
  { name: "Books", href: "/books", icon: Book },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "Shows", href: "/shows", icon: Tv },
  { name: "Games", href: "/games", icon: Gamepad2 },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-black text-white overflow-hidden">
      {/* Ambient animated rays */}
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.5}
          lightSpread={1.2}
          rayLength={2}
          // pulsating
          fadeDistance={0.9}
          saturation={1.0}
          followMouse
          mouseInfluence={0.15}
          noiseAmount={0.05}
          distortion={0.08}
          className="w-full h-full"
        />
      </div>

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-24 text-center"
      >
        <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Mouthful
        </h1>
      </motion.header>

      {/* GRID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 w-full max-w-5xl"
      >
        {sections.map((section, i) => (
          <Link key={section.name} href={section.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.06, rotate: 0.5 }}
              className="group relative aspect-[2/3] rounded-2xl border border-zinc-800/70 
                bg-zinc-900/40 backdrop-blur-xl shadow-[0_0_20px_-8px_rgba(0,0,0,0.7)] 
                flex flex-col items-center justify-center cursor-pointer 
                overflow-hidden transition-all duration-300"
            >
              <section.icon className="w-12 h-12 text-zinc-400 group-hover:text-white transition-colors duration-300" />
              <span className="mt-4 text-lg font-medium text-zinc-300 group-hover:text-white transition-colors">
                {section.name}
              </span>
              {/* Subtle hover wash */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-300" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 to-transparent transition-opacity duration-300" />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* FOOTER */}
      <footer className="absolute z-10 bottom-4 text-zinc-600 text-sm tracking-wide">
        © {new Date().getFullYear()} Mouthful
      </footer>
    </main>
  );
}
