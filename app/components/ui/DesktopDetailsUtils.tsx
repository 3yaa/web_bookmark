import { LucideIcon } from "lucide-react";

// STATUS / SCORE / NOTES / PROGRESS captions
export const FIELD_LABEL =
	"block select-none text-[0.7rem] uppercase tracking-widest font-medium text-zinc-500";

// the scored button (once a score exists) and the notes panel
export const FIELD_PLATE = "rounded-lg neu-raised";

// hover-revealed +/- controls on the score row
export const SCORE_SUB_BTN =
	"flex justify-center items-center w-8 h-8 rounded-lg neu-carved enabled:hover:neu-carved-hi enabled:active:scale-95 transition-all duration-150 hover:cursor-pointer disabled:neu-carved-off disabled:opacity-45 disabled:cursor-default";

// 
export const coverWave = (color: string) => {
	const lifted = `color-mix(in srgb, white 22%, ${color})`;
	return `linear-gradient(90deg, transparent 20%, color-mix(in srgb, ${lifted} 55%, transparent) 50%, transparent 80%)`;
};

// feathers the header wash on all four sides so it has no visible edge
export const HEADER_WASH_MASK = [
	"linear-gradient(to right, transparent 0px, black 72px, black calc(100% - 96px), transparent 100%)",
	"linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)",
].join(", ");

// ─── action-row buttons ───────────────────────────────────────────────

// solid -- the add and reload rows, which are always visible
const SOLID_TONE = {
	green: "hover:bg-green-600/20 hover:text-green-500",
	blue: "hover:bg-blue-600/20 hover:text-blue-400",
	red: "hover:bg-red-600/50 hover:text-red-300",
	purple: "hover:bg-purple-600/25 hover:text-purple-400",
} as const;

// ghost -- the settled row, invisible until the card is hovered
const GHOST_TONE = {
	emerald: "hover:bg-emerald-800/20 hover:text-emerald-400",
	blue: "hover:bg-blue-800/20 hover:text-blue-400",
	orange: "hover:bg-orange-700/20 hover:text-orange-400",
	red: "hover:bg-red-700/20 hover:text-red-500",
} as const;

type SolidProps = {
	variant?: "solid";
	tone: keyof typeof SOLID_TONE;
	// the pills padding
	pad?: "p-1.5" | "p-1.5 px-2.5" | "py-1.5 px-2" | "py-1.5 px-5";
};

type GhostProps = {
	variant: "ghost";
	tone: keyof typeof GHOST_TONE;
	pad?: never;
};

type ActionBtnProps = (SolidProps | GhostProps) & {
	icon: LucideIcon;
	onClick: () => void;
	title: string;
};

export function ActionBtn({
	icon: Icon,
	onClick,
	title,
	...rest
}: ActionBtnProps) {
	const ghost = rest.variant === "ghost";
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={`rounded-lg transition-all hover:cursor-pointer ${
				ghost
					? `p-1.5 duration-200 bg-zinc-800/0 text-black/0 ${GHOST_TONE[rest.tone]}`
					: `${rest.pad ?? "p-1.5"} bg-zinc-800/50 text-gray-400 ${SOLID_TONE[rest.tone]}`
			}`}
		>
			<Icon className={ghost ? "w-4 h-4" : "w-5 h-5"} />
		</button>
	);
}
