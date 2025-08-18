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