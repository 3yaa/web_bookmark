import { MediaStatus } from "@/types/media";

// FORMATTING NUMBER TIMESTAMP INTO DATES

export const formatDateShort = (value?: string | Date | null): string => {
  if (!value) return "-";
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

// STATUS BORDER COLORS

//for listing
export const getStatusBorderColor = (status: MediaStatus) => {
  switch (status) {
    case "Completed":
      return "border-emerald-500/50";
    case "Want to Read":
      return "border-blue-500/50";
    case "Dropped":
      return "border-red-500/40";
    default:
      return "border-zinc-600/40";
  }
};

//everything else
export const getStatusBorderGradient = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      return "from-emerald-500/50";
    case "Want to Read":
      return "from-blue-500/50";
    case "Dropped":
      return "from-red-500/40";
    default:
      return "from-zinc-600/40";
  }
};

export const getGameStatusBorderGradient = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      return "from-emerald-500/50";
    case "Playing":
      return "from-blue-500/50";
    case "Dropped":
      return "from-red-500/40";
    default:
      return "from-zinc-600/40";
  }
};

export const getTvStatusBorderGradient = (status: Partial<MediaStatus>) => {
  switch (status) {
    case "Completed":
      return "from-emerald-500/50";
    case "Want to Watch":
      return "from-blue-500/50";
    case "Dropped":
      return "from-red-500/40";
    default:
      return "from-zinc-600/40";
  }
};

// STATUS TEXT COLORS
export const getStatusTextColor = (status: MediaStatus) => {
  switch (status) {
    case "Completed":
      return "text-emerald-500/80";
    case "Want to Watch":
      return "text-blue-500/85";
    case "Dropped":
      return "text-red-500/75";
    default:
      return "text-zinc-600";
  }
};
