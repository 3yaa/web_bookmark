"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type ConfirmTone = "emerald" | "blue" | "orange" | "red";

const CONFIRM_TONE: Record<
	ConfirmTone,
	{ chip: string; btn: string; hover: string }
> = {
	emerald: {
		chip: "text-emerald-400/90 bg-emerald-800/30",
		btn: "text-emerald-300 bg-emerald-800/40 active:bg-emerald-800/60",
		hover: "hover:bg-emerald-700/50",
	},
	blue: {
		chip: "text-blue-400/90 bg-blue-800/30",
		btn: "text-blue-300 bg-blue-800/40 active:bg-blue-800/60",
		hover: "hover:bg-blue-700/50",
	},
	orange: {
		chip: "text-orange-400/90 bg-orange-700/30",
		btn: "text-orange-300 bg-orange-700/40 active:bg-orange-700/60",
		hover: "hover:bg-orange-600/50",
	},
	red: {
		chip: "text-red-400/90 bg-red-700/30",
		btn: "text-red-300 bg-red-700/40 active:bg-red-700/60",
		hover: "hover:bg-red-600/50",
	},
};

const EXIT_MS = 200;

interface ConfirmPromptProps {
	isOpen: boolean;
	title: string;
	confirmLabel?: string;
	cancelLabel?: string;
	tone?: ConfirmTone;
	icon?: LucideIcon;
	// "bottom" mobile, "center" desktop
	placement?: "bottom" | "center";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmPrompt({
	isOpen,
	title,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	tone = "red",
	icon,
	placement = "bottom",
	onConfirm,
	onCancel,
}: ConfirmPromptProps) {
	// in the DOM vs. animated in -- it has to render before it can move
	const [mounted, setMounted] = useState(false);
	const [shown, setShown] = useState(false);

	// keep the last real content so it doesn't blank out on the way out
	const content = useRef({ title, confirmLabel, cancelLabel, tone, icon });
	if (isOpen) {
		content.current = { title, confirmLabel, cancelLabel, tone, icon };
	}

	useEffect(() => {
		if (isOpen) {
			setMounted(true);
			let inner = 0;
			const outer = requestAnimationFrame(() => {
				inner = requestAnimationFrame(() => setShown(true));
			});
			return () => {
				cancelAnimationFrame(outer);
				cancelAnimationFrame(inner);
			};
		}
		setShown(false);
		const t = setTimeout(() => setMounted(false), EXIT_MS);
		return () => clearTimeout(t);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
			if (e.key === "Enter") onConfirm();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onCancel, onConfirm]);

	if (!mounted) return null;

	const c = content.current;
	const Icon = c.icon;
	const toneStyle = CONFIRM_TONE[c.tone ?? "red"];
	const isCenter = placement === "center";

	return (
		<div
			role="dialog"
			aria-modal="true"
			className={`fixed inset-0 z-50 flex justify-center ${
				isCenter ? "items-center" : "items-end"
			}`}
		>
			{/* BACKDROP */}
			<div
				onClick={onCancel}
				className={`absolute inset-0 transition-opacity duration-200 ease-out ${
					isCenter
						? "bg-black/50 backdrop-blur-[3px]"
						: "bg-black/60 backdrop-blur-[2px]"
				} ${shown ? "opacity-100" : "opacity-0"}`}
			/>
			{/* PROMPT */}
			<div
				className={`relative will-change-transform transition-all duration-200 ease-out shadow-2xl shadow-black/60 ${
					isCenter
						? `w-full max-w-xs mx-4 p-5 rounded-2xl bg-[#141414] border border-zinc-800/60 ${
								shown
									? "opacity-100 scale-100"
									: "opacity-0 scale-95"
							}`
						: `w-full max-w-sm mx-3 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800/80 ${
								shown
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-6"
							}`
				}`}
				style={
					isCenter
						? undefined
						: {
								marginBottom:
									"calc(0.75rem + env(safe-area-inset-bottom))",
							}
				}
			>
				{/* TITLE */}
				<div className="flex items-center justify-center gap-2.5 px-1">
					{Icon && (
						<span
							className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-xl ${toneStyle.chip}`}
						>
							<Icon className="w-4 h-4" strokeWidth={1.75} />
						</span>
					)}
					<h2 className="min-w-0 text-zinc-100 text-[0.95rem] font-semibold leading-5 select-none">
						{c.title}
					</h2>
				</div>
				{/* CANCEL | CONFIRM */}
				<div className="mt-4 flex items-center gap-2">
					<button
						type="button"
						onClick={onCancel}
						className={`flex-1 h-10 rounded-xl neu-carved text-zinc-300/90 text-sm font-semibold transition-all duration-150 ${
							isCenter
								? "cursor-pointer hover:text-zinc-100 hover:brightness-125"
								: "active:scale-[0.98]"
						}`}
					>
						{c.cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-150 ${toneStyle.btn} ${
							isCenter
								? `cursor-pointer ${toneStyle.hover}`
								: "active:scale-[0.98]"
						}`}
					>
						{c.confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
