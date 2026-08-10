import { useLayoutEffect, useRef, useState } from "react";
interface DirectorNamesProps {
	names: string[];
	onPick: (name: string) => void;
	onMore: () => void;
	width?: string;
}

export function DirectorNames({
	names,
	onPick,
	onMore,
	width = "max-w-60",
}: DirectorNamesProps) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const probeRef = useRef<HTMLSpanElement>(null);
	const dotsRef = useRef<HTMLButtonElement>(null);
	const [shownCount, setShownCount] = useState(names.length);

	// keyed on the joined string so a fresh array identity each render does not
	// re-run this and flip the result mid-life
	const key = names.join("|");

	useLayoutEffect(() => {
		const container = containerRef.current;
		const probe = probeRef.current;
		if (!container || !probe) return;

		const measure = () => {
			const full = container.clientWidth;
			// everything fits -- no dots, no dropping
			probe.textContent = names.join(", ");
			if (probe.scrollWidth <= full) {
				setShownCount(names.length);
				return;
			}
			// make dots room
			const reserved = (dotsRef.current?.offsetWidth ?? 16) + 4;
			const available = full - reserved;
			let count = names.length - 1;
			while (count > 1) {
				probe.textContent = names.slice(0, count).join(", ");
				if (probe.scrollWidth <= available) break;
				count--;
			}
			setShownCount(count);
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(container);
		return () => observer.disconnect();
		// `key` stands in for `names` 
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	const shown = names.slice(0, shownCount);
	const hasMore = shownCount < names.length;

	return (
		<span
			ref={containerRef}
			className={`relative inline-flex items-center gap-1 ${width}`}
		>
			<span
				ref={probeRef}
				aria-hidden
				className="absolute left-0 top-0 invisible whitespace-nowrap pointer-events-none"
			/>
			<span className="min-w-0 overflow-hidden whitespace-nowrap">
				{shown.map((name, i) => (
					<span key={name}>
						{i > 0 && ", "}
						<span
							className="hover:text-zinc-200 hover:underline hover:underline-offset-4 hover:cursor-pointer transition-colors duration-200"
							onClick={() => onPick(name)}
							title="See their films"
						>
							{name}
						</span>
					</span>
				))}
			</span>
			{hasMore && (
				<button
					ref={dotsRef}
					type="button"
					onClick={onMore}
					title="All directors"
					aria-hidden={!hasMore}
					className={`shrink-0 leading-none transition-colors duration-200 ${
						hasMore
							? "text-zinc-500 hover:text-zinc-200 cursor-pointer"
							: "invisible pointer-events-none"
					}`}
				>
					…
				</button>
			)}
		</span>
	);
}
