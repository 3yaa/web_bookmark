import { MediaStatus } from "@/types/media";

// 


// FORMATTING NUMBER TIMESTAMP INTO DATES

export const formatDateShort = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric'
	});
};

export const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric'
	});
};

// STATUS BORDER COLORS

export const getStatusBorderColor = (status: MediaStatus) => {
	switch (status) {
	  case "Completed":
		return "border-emerald-500/60";
	  case "Want to Read":
		return "border-blue-500/60";
	  default:
		return "border-zinc-600/40";
	}
  };

export const getStatusBorderGradient = (status: MediaStatus) => {
switch (status) {
	case "Completed":
	return "from-emerald-500/60";
	case "Want to Read":
	return "from-blue-500/60";
	default:
	return "from-zinc-600/40";
}
};