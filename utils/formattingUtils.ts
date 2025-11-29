// FORMATTING NUMBER TIMESTAMP INTO DATES

import { MediaStatus } from "@/types/media";

export const formatDateShort = (value?: string | Date | null): string => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
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
      return "border-indigo-600/50";
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
      return "from-indigo-600/50";
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
      return "text-indigo-500/80";
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
      return "bg-indigo-600/50";
    // book
    case "Want to Read":
      return "bg-blue-500/50";
    // game
    case "Playing":
      return "bg-blue-500/50";
    default:
      return "bg-zinc-600/40";
  }
};
