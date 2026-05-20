// STATUS

import { TIER_THRESHOLDS, TIERS } from "@/lib/tierConfig";

const statusConfig = {
	"Want to Read": {
		textStyle: "text-blue-500",
		bgStyle: "to-blue-500/10",
	},
	"Want to Watch": {
		textStyle: "text-blue-500",
		bgStyle: "to-blue-500/10",
	},
	Watching: {
		textStyle: "text-cyan-500/80",
		bgStyle: "to-cyan-600/10",
	},
	Playing: {
		textStyle: "text-blue-500/80",
		bgStyle: "to-blue-500/10",
	},
	Completed: {
		textStyle: "text-emerald-500/80",
		bgStyle: "to-emerald-500/10",
	},
	Dropped: {
		textStyle: "text-red-500/80",
		bgStyle: "to-red-500/10",
	},
} as const;

const createStatusOptions = <T extends keyof typeof statusConfig>(
	statuses: T[],
) =>
	statuses.map((status) => ({
		value: status,
		label: status,
		...statusConfig[status],
	}));

// status options
export const bookStatusOptions = createStatusOptions([
	"Want to Read",
	"Completed",
	"Dropped",
]);

export const movieStatusOptions = createStatusOptions([
	"Want to Watch",
	"Completed",
	"Dropped",
]);

export const showStatusOptions = createStatusOptions([
	"Watching",
	"Want to Watch",
	"Dropped",
	"Completed",
]);

export const gameStatusOptions = createStatusOptions([
	"Playing",
	"Completed",
	"Dropped",
]);

// TIERS
export const tierOptions = [
	{ label: "Select Tier", value: "-" },
	...TIERS.map((tier) => ({
		label: tier,
		value: tier,
		scoreLabel: TIER_THRESHOLDS[tier].min,
	})),
];
