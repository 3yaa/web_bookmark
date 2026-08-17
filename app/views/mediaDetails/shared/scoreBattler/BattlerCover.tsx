import Image from "next/image";
import { isResizable } from "@/utils/image-loader";
import { useState } from "react";

interface BattlerCoverProps {
	src: string | null;
	alt: string;
	sizeClass: string;
	imgFit?: string;
	rounded?: string;
}

export function BattlerCover({
	src,
	alt,
	sizeClass,
	imgFit = "object-cover",
	rounded = "",
}: BattlerCoverProps) {
	const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
	const isLoaded = !!src && loadedSrc === src;

	return (
		<div className={`relative overflow-hidden ${sizeClass} ${rounded}`}>
			<div
				className={`absolute inset-0 bg-linear-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30 transition-opacity duration-300 ${
					isLoaded ? "opacity-0" : "opacity-100"
				} ${src && !isLoaded ? "animate-pulse" : ""}`}
			/>
			{src && (
				<Image
					src={src}
					alt={alt}
					width={248}
					height={372}
					sizes="(min-width: 768px) 248px, 400px"
					unoptimized={!isResizable(src)}
					onLoad={() => setLoadedSrc(src)}
					className={`relative ${sizeClass} ${imgFit} transition-opacity duration-300 ${
						isLoaded ? "opacity-100" : "opacity-0"
					}`}
				/>
			)}
		</div>
	);
}
