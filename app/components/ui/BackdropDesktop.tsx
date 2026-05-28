import Image from "next/image";

interface BackdropDesktopProps {
	src: string;
	is_book?: boolean;
}

const maskH =
	"linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.2) 11%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.72) 26%, rgba(0,0,0,0.92) 34%, black 42%, black 58%, rgba(0,0,0,0.92) 66%, rgba(0,0,0,0.72) 74%, rgba(0,0,0,0.45) 82%, rgba(0,0,0,0.2) 89%, rgba(0,0,0,0.05) 95%, transparent 100%)";

const maskV =
	"linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, black 18%, black 82%, rgba(0,0,0,0.2) 100%)";

export const BackdropDesktop = ({ src, is_book }: BackdropDesktopProps) => (
	<div
		className="relative overflow-hidden select-none h-full"
		style={{
			maskImage: `${maskH}, ${maskV}`,
			WebkitMaskImage: `${maskH}, ${maskV}`,
			maskComposite: "intersect",
			WebkitMaskComposite: "source-in",
		}}
	>
		<Image
			src={src}
			alt="Backdrop"
			width={1280}
			height={720}
			className="absolute"
			style={{
				objectPosition: is_book ? "center -40px" : "center -16px",
				filter: "brightness(0.40)",
			}}
			priority
		/>
	</div>
);
