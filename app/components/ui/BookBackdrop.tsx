interface BookBackdropDesktopProps {
	color?: string;
	title?: string;
}

// same edge fade as the image backdrop so it sits cleanly in the grid slot
const maskH =
	"linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.2) 11%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.72) 26%, rgba(0,0,0,0.92) 34%, black 42%, black 58%, rgba(0,0,0,0.92) 66%, rgba(0,0,0,0.72) 74%, rgba(0,0,0,0.45) 82%, rgba(0,0,0,0.2) 89%, rgba(0,0,0,0.05) 95%, transparent 100%)";

const maskV =
	"linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, black 18%, black 82%, rgba(0,0,0,0.2) 100%)";

// details header fades: dissolve into the card (left + bottom) so there's no
// hard seam where the tinted base meets the lighter card background
const detailsMaskH =
	"linear-gradient(to right, transparent 0%, black 40%, black 100%)";

// long multi-stop ease that reaches fully transparent at the very bottom of the
// band, so the fade lands at the same depth as the movie/show backdrop
const detailsMaskV =
	"linear-gradient(to bottom, black 0%, black 44%, rgba(0,0,0,0.62) 64%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.09) 92%, transparent 100%)";

// dark anchor everything is mixed into so light cover colors never blow out
const INK = "#0a0a0b";

// fine paper/cloth grain for an authentic, tactile feel
const GRAIN =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const mix = (pct: number, into = "transparent") =>
	`color-mix(in srgb, var(--c) ${pct}%, ${into})`;

// the shared colour treatment: overhead light + page fore-edge + aura over a
// tinted ink base. auraAt/baseAt move the glow so it reads well per layout.
const colorFill = (auraAt: string, baseAt: string) =>
	[
		// soft overhead light for a little dimension
		"radial-gradient(120% 75% at 50% -12%, rgba(255,255,255,0.05) 0%, transparent 55%)",
		// fore-edge: thin vertical page striations, the "spine of a book" tell
		`repeating-linear-gradient(90deg, ${mix(20)} 0px, ${mix(20)} 1px, transparent 1px, transparent 5px)`,
		// ambient aura glowing out
		`radial-gradient(135% 115% at ${auraAt}, ${mix(46)} 0%, ${mix(18)} 40%, transparent 70%)`,
		// tinted base so the whole panel carries the book's hue while staying dark
		`radial-gradient(130% 125% at ${baseAt}, ${mix(14, INK)} 0%, ${mix(6, INK)} 55%, #09090b 100%)`,
	].join(", ");

const Grain = () => (
	<div
		className="absolute inset-0 opacity-[0.55] mix-blend-soft-light"
		style={{ backgroundImage: GRAIN }}
	/>
);

// decorative hairline with a small center diamond, framing the title
const Rule = ({ c }: { c: string }) => (
	<div className="flex items-center gap-1.5 w-2/5 opacity-60 group-hover:opacity-85 transition-opacity duration-600 ease-out">
		<div
			className="h-px flex-1"
			style={{ background: `linear-gradient(90deg, transparent, ${c})` }}
		/>
		<div className="w-1 h-1 rotate-45" style={{ background: c }} />
		<div
			className="h-px flex-1"
			style={{ background: `linear-gradient(90deg, ${c}, transparent)` }}
		/>
	</div>
);

const resolve = (color?: string) =>
	color && color.trim() !== "" ? color : "#52525b"; // neutral zinc fallback

// LISTING — a self-contained strip masked into the row's backdrop column
export const BookBackdropDesktop = ({
	color,
	title,
}: BookBackdropDesktopProps) => (
	<div
		className="relative overflow-hidden select-none h-full"
		style={
			{
				"--c": resolve(color),
				maskImage: `${maskH}, ${maskV}`,
				WebkitMaskImage: `${maskH}, ${maskV}`,
				maskComposite: "intersect",
				WebkitMaskComposite: "source-in",
			} as React.CSSProperties
		}
	>
		<div
			className="absolute inset-0"
			style={{ backgroundImage: colorFill("50% 38%", "50% 30%") }}
		/>
		{/* TITLE — foil-stamped cover type framed by hairline rules */}
		{title && (
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8">
				<Rule c={mix(55)} />
				<span
					className="font-serif font-bold uppercase text-center tracking-tight leading-[0.9] text-transparent opacity-[0.24] group-hover:opacity-[0.36] transition-opacity duration-600 ease-out"
					style={{
						fontSize: "clamp(1.35rem, 2.6vw, 2.5rem)",
						backgroundImage: `linear-gradient(175deg, ${mix(58, "#ffffff")} 0%, ${mix(88)} 48%, ${mix(40, INK)} 100%)`,
						WebkitBackgroundClip: "text",
						backgroundClip: "text",
						filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))",
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{title}
				</span>
				<Rule c={mix(55)} />
			</div>
		)}
		<Grain />
	</div>
);

// DETAILS — atmospheric header wash behind the modal's real title/metadata,
// fading into the card (#121212) the same way the movie/show backdrop does
export const BookBackdropDetails = ({ color }: { color?: string }) => (
	<div
		className="absolute -top-4 left-20 -right-21 h-[70%] -z-10 overflow-hidden select-none"
		style={
			{
				"--c": resolve(color),
				maskImage: `${detailsMaskH}, ${detailsMaskV}`,
				WebkitMaskImage: `${detailsMaskH}, ${detailsMaskV}`,
				maskComposite: "intersect",
				WebkitMaskComposite: "source-in",
			} as React.CSSProperties
		}
	>
		<div
			className="absolute inset-0"
			style={{ backgroundImage: colorFill("68% 24%", "62% 18%") }}
		/>
		<Grain />
	</div>
);
