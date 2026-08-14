// mean text title
export const clearedFrom = (index: number) => -index - 1;

// cleared or not
export const activeLogoIndex = (index: number) =>
	index < 0 ? -index - 1 : index;

export const isLogoCleared = (index?: number) => (index ?? 0) < 0;

// next/prev from wherever the picker actually sits
export const stepLogoIndex = (
	index: number,
	dir: "next" | "prev",
	total: number,
) => {
	const from = activeLogoIndex(index);
	return dir === "next"
		? (from + 1) % total
		: from === 0
			? total - 1
			: from - 1;
};
