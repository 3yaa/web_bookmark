import Image from "next/image";

interface BackdropDesktopProps {
	src: string;
	is_book?: boolean;
}

export const BackdropDesktop = ({ src, is_book }: BackdropDesktopProps) => (
	<div className="relative overflow-hidden select-none h-full">
		<Image
			src={src}
			alt="Backdrop"
			width={1280}
			height={720}
			className="absolute opacity-70"
			style={{
				objectPosition: is_book ? "center -40px" : "center -16px",
			}}
		/>
		{/* HORIZONTAL */}
		<div
			className="absolute inset-0"
			style={{
				background:
					"linear-gradient(to right, rgba(18,18,18,1) 0%, rgba(18,18,18,0.6) 15%, rgba(18,18,18,0) 30%, rgba(18,18,18,0) 70%, rgba(18,18,18,1) 100%)",
			}}
		/>
		{/* VERTICAL */}
		<div
			className="absolute inset-0"
			style={{
				background:
					"linear-gradient(to bottom, rgba(18,18,18,0.4) 0%, rgba(18,18,18,0.3) 20%, rgba(18,18,18,0) 50%, rgba(18,18,18,0.4) 80%, rgba(18,18,18,0.8) 100%)",
			}}
		/>
	</div>
);
