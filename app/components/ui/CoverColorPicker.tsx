"use client";
import { useState } from "react";
import { Palette, Loader2 } from "lucide-react";
import { extractCoverPalette } from "@/utils/extractCoverPalette";

// original color
const defaultColorCache = new Map<string, string>();

interface CoverColorPickerProps {
	coverUrl?: string;
	currentColor?: string;
	onPick: (color: string) => void;
}

const norm = (c?: string) => c?.toLowerCase();

export function CoverColorPicker({
	coverUrl,
	currentColor,
	onPick,
}: CoverColorPickerProps) {
	const [open, setOpen] = useState(false);
	const [colors, setColors] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	// capture the cover's default colour once, cached by url across remounts
	const [defaultColor] = useState(() => {
		if (coverUrl && currentColor && !defaultColorCache.has(coverUrl)) {
			defaultColorCache.set(coverUrl, currentColor);
		}
		return (coverUrl && defaultColorCache.get(coverUrl)) || currentColor;
	});

	const toggle = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (open) {
			setOpen(false);
			return;
		}
		setOpen(true);
		if (colors.length === 0) {
			setLoading(true);
			setColors(await extractCoverPalette(coverUrl));
			setLoading(false);
		}
	};

	if (!coverUrl) return null;

	// default first, then extracted colours minus any that match the default
	const extras = colors.filter((c) => norm(c) !== norm(defaultColor));

	const swatch = (c: string, isDefault: boolean) => {
		const isActive = norm(c) === norm(currentColor);
		return (
			<button
				key={c + (isDefault ? "-d" : "")}
				onClick={() => onPick(c)}
				title={isDefault ? `${c} (default)` : c}
				className={`h-5 w-5 rounded-full transition-transform hover:scale-110 hover:cursor-pointer ${
					isActive ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 " : ""
				}${
					isDefault
						? "border border-white/40"
						: isActive
							? ""
							: "ring-1 ring-white/20"
				}`}
				style={{ backgroundColor: c }}
			/>
		);
	};

	return (
		<div className="relative" onClick={(e) => e.stopPropagation()}>
			<button
				onClick={toggle}
				title="Cover colors"
				className={`py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-emerald-600/20 hover:cursor-pointer transition-all group ${
					open ? "bg-emerald-600/20" : ""
				}`}
			>
				<Palette
					className={`w-5 h-5 transition-colors ${
						open
							? "text-emerald-400"
							: "text-gray-400 group-hover:text-emerald-400"
					}`}
				/>
			</button>
			{open && (
				<div className="absolute right-full top-1/2 -translate-y-1/2 mr-1.5 z-20 flex items-center gap-1.5 rounded-lg bg-zinc-900/95 backdrop-blur-md border border-zinc-800/60 px-2 py-1.5 shadow-xl">
					{defaultColor && swatch(defaultColor, true)}
					{loading ? (
						<Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
					) : (
						extras.map((c) => swatch(c, false))
					)}
					{!loading && !defaultColor && extras.length === 0 && (
						<span className="text-[0.7rem] text-zinc-400 px-1 whitespace-nowrap">
							No colors
						</span>
					)}
				</div>
			)}
		</div>
	);
}
