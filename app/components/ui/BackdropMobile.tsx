import Image from "next/image";

interface BackdropImagePropsMobile {
	src: string;
	width: number;
	height: number;
	// only the first rows of the list want this
	priority?: boolean;
}

export const BackdropImageMobile = ({
	src,
	width,
	height,
	priority = false,
}: BackdropImagePropsMobile) => (
	<div className="absolute top-0 left-50 -z-10 overflow-hidden select-none md:h-30">
		<div className="relative w-full h-full">
			{/* IMAGE */}
			<Image
				src={src}
				alt="Backdrop"
				width={width}
				height={height}
				className="object-cover"
				style={{
					objectPosition: "center -7px",
					filter: "brightness(0.40)",
				}}
				// lazy past the first rows
				priority={priority}
			/>

			{/* HORIZONTAL GRADIENT */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"linear-gradient(to right, rgba(9,9,9,1) 0%, rgba(9,9,9,0) 30%, transparent 50%, rgba(9,9,9,0.2) 100%)",
				}}
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
