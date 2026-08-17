import Image from "next/image";

interface BackdropImagePropsMobile {
	src: string;
	// preflight caps the img at the strip, so these only set the ratio and a ceiling
	width: number;
	height: number;
	// only the first rows of the list want this
	priority?: boolean;
}

// same eased curve the desktop backdrop uses, left edge only
const EDGE_WASH = [
	"linear-gradient(to right",
	"rgba(9,9,9,1) 0%",
	"rgba(9,9,9,0.98) 3%",
	"rgba(9,9,9,0.88) 6%",
	"rgba(9,9,9,0.7) 8.5%",
	"rgba(9,9,9,0.48) 11.5%",
	"rgba(9,9,9,0.28) 14%",
	"rgba(9,9,9,0.12) 17.5%",
	"rgba(9,9,9,0.03) 21%",
	"transparent 25%",
	"transparent 50%",
	"rgba(9,9,9,0.2) 100%)",
].join(", ");

export const BackdropImageMobile = ({
	src,
	width,
	height,
	priority = false,
}: BackdropImagePropsMobile) => (
	<div className="absolute top-0 left-44 right-0 -z-10 overflow-hidden select-none md:h-30">
		<div className="relative w-full h-full">
			{/* IMAGE */}
			<Image
				src={src}
				alt="Backdrop"
				width={width}
				height={height}
				sizes="(min-width: 768px) 85vw, 62vw"
				className="object-cover w-full"
				style={{
					objectPosition: "center -7px",
					filter: "brightness(0.32) saturate(0.9)",
				}}
				// lazy past the first rows
				priority={priority}
			/>

			{/* HORIZONTAL GRADIENT */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{ background: EDGE_WASH }}
			/>

			{/* VERTICAL GRADIENT */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"linear-gradient(to bottom, transparent 50%, rgba(9,9,9,0.9) 70%, rgba(9,9,9,1) 75%, rgba(9,9,9,1) 100%)",
				}}
			/>
		</div>
	</div>
);
