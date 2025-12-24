// FORMATTING NUMBER TIMESTAMP INTO DATES

import { MediaStatus } from "@/types/media";

export const formatDateShort = (value?: string | Date | null): string => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDate = (value?: string | Date | null): string => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// LISTING BORDER COLOR
export const getStatusBorderColor = (status: MediaStatus) => {
  switch (status) {
    case "Completed":
      return "border-emerald-500/50";
    case "Dropped":
      return "border-red-500/40";
    // movie && show
    case "Want to Watch":
      return "border-blue-500/50";
    // show
    case "Watching":
      return "border-cyan-500/50";
    // book
    case "Want to Read":
      return "border-blue-500/50";
    // game
    case "Playing":
      return "border-blue-500/50";
    default:
      return "border-zinc-600/40";
  }
};

// DETAILS BORDER GRADIENT
export const getStatusBorderGradient = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      return "from-emerald-500/50";
    case "Dropped":
      return "from-red-500/40";
    // movie && show
    case "Want to Watch":
      return "from-blue-500/50";
    // show
    case "Watching":
      return "from-cyan-600/45";
    // book
    case "Want to Read":
      return "from-blue-500/50";
    // game
    case "Playing":
      return "from-blue-500/50";
    default:
      return "from-zinc-600/40";
  }
};

// SHOWDETAILS USED FOR EP/SEASON
export const getStatusTextColor = (status: MediaStatus) => {
  switch (status) {
    case "Completed":
      return "text-emerald-500/80";
    case "Watching":
      return "text-cyan-600/85";
    case "Want to Watch":
      return "text-blue-500/85";
    case "Dropped":
      return "text-red-500/75";
    default:
      return "text-zinc-500";
  }
};

export const getStatusBg = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/50";
    case "Dropped":
      return "bg-red-500/40";
    // movie && show
    case "Want to Watch":
      return "bg-blue-600/60";
    // show
    case "Watching":
      return "bg-cyan-500/30";
    // book
    case "Want to Read":
      return "bg-blue-600/50";
    // game
    case "Playing":
      return "bg-blue-600/50";
    default:
      return "bg-zinc-600/40";
  }
};

export const getStatusWaveColor = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      // cyan-700: rgb(14, 116, 144)
      return "linear-gradient(90deg, transparent 20%, rgba(14, 116, 144, 0.45) 50%, transparent 80%)";
    case "Dropped":
      // yellow-400: rgb(250, 204, 21)
      return "linear-gradient(90deg, transparent 20%, rgba(250, 204, 21, 0.35) 50%, transparent 80%)";
    case "Want to Watch":
      // rose-600: rgb(225, 29, 72)
      return "linear-gradient(90deg, transparent 20%, rgba(225, 29, 72, 0.35) 50%, transparent 80%)";
    case "Watching":
      // rose-400: rgb(251, 113, 133), orange-300: rgb(253, 186, 116)
      return "linear-gradient(90deg, transparent 20%, rgba(225, 29, 72, 0.35) 50%, transparent 80%)";
    case "Want to Read":
      // rose-600: rgb(225, 29, 72)
      return "linear-gradient(90deg, transparent 20%, rgba(225, 29, 72, 0.35) 50%, transparent 80%)";
    case "Playing":
      // orange-400: rgb(251, 146, 60), amber-300: rgb(252, 211, 77)
      return "linear-gradient(90deg, transparent 20%, rgba(225, 29, 72, 0.35) 50%, transparent 80%)";
    default:
      // amber-300: rgb(252, 211, 77)
      return "linear-gradient(90deg, transparent 20%, rgba(252, 211, 77, 0.5) 50%, transparent 80%)";
  }
};

export const getStatusDetailWaveColor = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      // emerald-500: rgb(16, 185, 129)
      return "linear-gradient(90deg, transparent 20%, rgba(16, 185, 129, 0.5) 50%, transparent 80%)";
    case "Dropped":
      // red-500: rgb(239, 68, 68)
      return "linear-gradient(90deg, transparent 20%, rgba(239, 68, 68, 0.4) 50%, transparent 80%)";
    case "Want to Watch":
      // blue-500: rgb(59, 130, 246)
      return "linear-gradient(90deg, transparent 20%, rgba(59, 130, 246, 0.5) 50%, transparent 80%)";
    case "Watching":
      // cyan-600: rgb(8, 145, 178)
      return "linear-gradient(90deg, transparent 20%, rgba(8, 145, 178, 0.45) 50%, transparent 80%)";
    case "Want to Read":
      // blue-500: rgb(59, 130, 246)
      return "linear-gradient(90deg, transparent 20%, rgba(59, 130, 246, 0.5) 50%, transparent 80%)";
    case "Playing":
      // blue-500: rgb(59, 130, 246)
      return "linear-gradient(90deg, transparent 20%, rgba(59, 130, 246, 0.5) 50%, transparent 80%)";
    default:
      // zinc-600: rgb(82, 82, 91)
      return "linear-gradient(90deg, transparent 20%, rgba(82, 82, 91, 0.4) 50%, transparent 80%)";
  }
};
