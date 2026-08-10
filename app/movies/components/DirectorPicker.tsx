import { ModalBackdrop, ModalPanel } from "@/app/components/ui/ModalMotion";

interface DirectorPickerProps {
	names: string[];
	onPick: (name: string) => void;
	onClose: () => void;
}

export function DirectorPicker({ names, onPick, onClose }: DirectorPickerProps) {
	return (
		<ModalBackdrop
			className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 p-4"
			onClick={onClose}
		>
			<ModalPanel
				className="w-full max-w-64 rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-2xl shadow-black/80 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<p className="px-4 pt-3.5 pb-2 text-[0.625rem] uppercase tracking-[0.18em] text-zinc-400/60 font-semibold">
					Directors
				</p>
				<div className="pb-2">
					{names.map((name) => (
						<button
							key={name}
							type="button"
							onClick={() => onPick(name)}
							className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-300/85 hover:bg-zinc-800/60 hover:text-zinc-100 cursor-pointer transition-colors duration-200"
						>
							{name}
						</button>
					))}
				</div>
			</ModalPanel>
		</ModalBackdrop>
	);
}
