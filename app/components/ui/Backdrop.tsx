import Image from "next/image";

interface BackdropImageProps {
	src: string;
	width: number;
	height: number;
}

export const BackdropImage = ({ src, width, height }: BackdropImageProps) => (
	<div className="absolute -top-4 left-20 -right-21 h-[70%] -z-10 overflow-hidden select-none">
		<div className="relative h-full">
			<Image
				src={src}
				alt="Backdrop"
				width={width}
				height={height}
				className="object-cover"
				style={{
					objectPosition: "center -10px",
					filter: "brightness(0.40)",
				}}
			/>
			{/* HORIZONTAL */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to right, rgba(18,18,18,1) 0%, rgba(18,18,18,0) 40%, transparent 100%)",
				}}
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
