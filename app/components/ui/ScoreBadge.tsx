interface ScoreBadgeProps {
	score?: number;
	seed?: string | number;
}

function h(seed: string | number, salt: number): number {
	const s = String(seed) + salt;
	let v = 2166136261;
	for (let i = 0; i < s.length; i++) {
		v ^= s.charCodeAt(i);
		v = Math.imul(v, 16777619);
	}
	return ((v >>> 0) % 1000) / 1000;
}

function accentFromScore(score: number | undefined): string {
	if (score == null) return "#606060";
	if (score >= 9) return "#e8b84b";
	if (score >= 7) return "#60a5fa";
	if (score >= 5) return "#a1a1aa";
	if (score >= 3) return "#94a3b8";
	return "#f87171";
}

export function ScoreBadge({ score, seed = 0 }: ScoreBadgeProps) {
	const display = score != null ? String(score) : "–";
	const accent = accentFromScore(score);
	const fontSize = display.length >= 3 ? 14 : 17;
	const r = (salt: number) => h(seed, salt);

	const aTop = 20 + r(2) * 4;
	const aBot = 20 + r(3) * 4;
	const aLft = 20 + r(4) * 4;
	const aRgt = 20 + r(5) * 4;
	const circleR = 15 + r(6) * 1.5;
	const gap = 1.8;
	const outerR = Math.max(aTop, aBot, aLft, aRgt) + 2.5;
	const dashed = r(7) > 0.5;

	// diagonal mini-arms: angle nudged ±4° from true 45°
	const diagAngles = [45, 135, 225, 315].map(
		(base, i) => base + (r(10 + i) * 8 - 4),
	);
	const diagLen = diagAngles.map((_, i) => 5 + r(20 + i) * 4);

	const xy = (deg: number, rad: number) => ({
		x: Math.cos((deg * Math.PI) / 180) * rad,
		y: Math.sin((deg * Math.PI) / 180) * rad,
	});

	// midpoint ticks along each main arm
	const midTicks = [
		{ x1: -1.8, y1: -(circleR + gap + aTop) / 2, x2: 1.8, y2: -(circleR + gap + aTop) / 2 },
		{ x1: -1.8, y1:  (circleR + gap + aBot) / 2, x2: 1.8, y2:  (circleR + gap + aBot) / 2 },
		{ x1: -(circleR + gap + aLft) / 2, y1: -1.8, x2: -(circleR + gap + aLft) / 2, y2: 1.8 },
		{ x1:  (circleR + gap + aRgt) / 2, y1: -1.8, x2:  (circleR + gap + aRgt) / 2, y2: 1.8 },
	];

	const lc = "#3a3a4a"; // main line color
	const tc = "#2e2e3e"; // tick color
	const dc = "#252532"; // dim detail color

	return (
		<svg
			width="66"
			height="66"
			viewBox="-30 -30 60 60"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Outer ring */}
			<circle cx="0" cy="0" r={outerR} fill="none" stroke={lc} strokeWidth="0.55" strokeDasharray={dashed ? "2.8 2.1" : undefined} opacity="0.65" />
			{/* Second ring just inside outer */}
			<circle cx="0" cy="0" r={outerR - 3.5} fill="none" stroke={dc} strokeWidth="0.4" strokeDasharray="1.6 2.6" opacity="0.6" />

			{/* Main arms */}
			<line x1="0" y1={-aTop} x2="0" y2={-(circleR + gap)} stroke={lc} strokeWidth="1" strokeLinecap="round" />
			<line x1="0" y1={circleR + gap} x2="0" y2={aBot} stroke={lc} strokeWidth="1" strokeLinecap="round" />
			<line x1={-aLft} y1="0" x2={-(circleR + gap)} y2="0" stroke={lc} strokeWidth="1" strokeLinecap="round" />
			<line x1={circleR + gap} y1="0" x2={aRgt} y2="0" stroke={lc} strokeWidth="1" strokeLinecap="round" />

			{/* End ticks on main arms */}
			<line x1="-3.5" y1={-aTop} x2="3.5" y2={-aTop} stroke={tc} strokeWidth="0.8" strokeLinecap="round" />
			<line x1="-3.5" y1={aBot} x2="3.5" y2={aBot} stroke={tc} strokeWidth="0.8" strokeLinecap="round" />
			<line x1={-aLft} y1="-3.5" x2={-aLft} y2="3.5" stroke={tc} strokeWidth="0.8" strokeLinecap="round" />
			<line x1={aRgt} y1="-3.5" x2={aRgt} y2="3.5" stroke={tc} strokeWidth="0.8" strokeLinecap="round" />

			{/* Midpoint ticks on main arms */}
			{midTicks.map((t, i) => (
				<line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={dc} strokeWidth="0.55" strokeLinecap="round" opacity="0.7" />
			))}

			{/* Diagonal mini-arms with their own end ticks */}
			{diagAngles.map((deg, i) => {
				const inner = xy(deg, circleR + gap);
				const outer = xy(deg, circleR + gap + diagLen[i]);
				const perp = xy(deg + 90, 2.2);
				return (
					<g key={i}>
						<line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={tc} strokeWidth="0.8" strokeLinecap="round" />
						<line
							x1={outer.x - perp.x} y1={outer.y - perp.y}
							x2={outer.x + perp.x} y2={outer.y + perp.y}
							stroke={dc} strokeWidth="0.65" strokeLinecap="round"
						/>
					</g>
				);
			})}

			{/* Inner circle */}
			<circle cx="0" cy="0" r={circleR} fill="#07070b" stroke={accent} strokeWidth="1.1" />
			{/* Inner dashed ring */}
			<circle cx="0" cy="0" r={circleR - 3.5} fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="2.2 2.8" opacity="0.28" />

			{/* Score */}
			<text
				x="0"
				y="0"
				textAnchor="middle"
				dominantBaseline="central"
				fill={accent}
				fontSize={fontSize}
				fontWeight="700"
				fontFamily="system-ui, -apple-system, sans-serif"
				letterSpacing="-0.5"
			>
				{display}
			</text>
		</svg>
	);
}
