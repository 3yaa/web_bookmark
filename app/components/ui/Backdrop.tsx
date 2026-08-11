import Image from "next/image";

interface BackdropImageProps {
	src: string;
	width: number;
	height: number;
}

export const BackdropImage = ({ src, width, height }: BackdropImageProps) => (
	<div className="absolute -top-4 left-0 -right-21 h-[70%] -z-10 overflow-hidden select-none">
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
						"linear-gradient(to right, rgba(18,18,18,1) 0%, rgba(18,18,18,0.98) 10%, rgba(18,18,18,0.88) 20%, rgba(18,18,18,0.7) 30%, rgba(18,18,18,0.48) 40%, rgba(18,18,18,0.28) 50%, rgba(18,18,18,0.12) 62%, rgba(18,18,18,0.03) 75%, transparent 88%)",
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
