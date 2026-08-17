import Image from "next/image";

interface BackdropImageProps {
	src: string;
	width: number;
	height: number;
}

// mirrored edge
const EDGE_WASH = [
	"linear-gradient(to right",
	"rgba(18,18,18,1) 0%",
	"rgba(18,18,18,0.98) 3%",
	"rgba(18,18,18,0.88) 6%",
	"rgba(18,18,18,0.7) 8.5%",
	"rgba(18,18,18,0.48) 11.5%",
	"rgba(18,18,18,0.28) 14%",
	"rgba(18,18,18,0.12) 17.5%",
	"rgba(18,18,18,0.03) 21%",
	"transparent 25%",
	"transparent 75%",
	"rgba(18,18,18,0.03) 79%",
	"rgba(18,18,18,0.12) 82.5%",
	"rgba(18,18,18,0.28) 86%",
	"rgba(18,18,18,0.48) 88.5%",
	"rgba(18,18,18,0.7) 91.5%",
	"rgba(18,18,18,0.88) 94%",
	"rgba(18,18,18,0.98) 97%",
	"rgba(18,18,18,1) 100%)",
].join(", ");

export const BackdropImage = ({ src, width, height }: BackdropImageProps) => (
	<div className="absolute -top-4 -left-10.5 -right-10.5 h-[70%] -z-10 overflow-hidden select-none">
		<div className="relative h-full">
			<Image
				src={src}
				alt="Backdrop"
				width={width}
				height={height}
				sizes="40vw"
				className="object-cover w-full"
				style={{
					objectPosition: "center -10px",
					filter: "brightness(0.40)",
				}}
			/>
			{/* HORIZONTAL */}
			<div
				className="absolute inset-0"
				style={{ background: EDGE_WASH }}
			/>
			{/* VERTICAL */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom, transparent 0%, rgba(18,18,18,0.1) 50%, rgba(18,18,18,0.9) 75%, rgba(18,18,18,1) 100%)",
				}}
			/>
		</div>
	</div>
);
