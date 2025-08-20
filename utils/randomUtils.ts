import { MediaStatus } from "@/types/media";
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

export const getStatusBorder = (status: MediaStatus) => {
	switch (status) {
	  case "Completed":
		return "border-emerald-500/60";
	  case "Want to Read":
		return "border-blue-500/60";
	  default:
		return "border-zinc-600/40";
	}
  };