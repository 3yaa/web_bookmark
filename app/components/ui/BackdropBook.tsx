import Image from "next/image";

interface BackdropImageBookProps {
  src: string;
  width: number;
  height: number;
}

export const BackdropImageBook = ({
  src,
  width,
  height,
}: BackdropImageBookProps) => (
  <div className="absolute -top-7 left-34 w-[80%] h-[70%] -z-10 overflow-hidden select-none">
    <div className="relative h-full">
      <Image
        src={src}
        alt="Backdrop"
        width={width}
        height={height}
        className="object-cover opacity-30"
        style={{ objectPosition: "center -190px" }}
      />
      {/* HORIZONTAL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(18,18,18,1) 0%, rgba(18,18,18,0.2) 30%, transparent 50%, rgba(18,18,18,0.2) 100%)",
        }}
      />
      {/* VERTICAL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(18,18,18,0.8) 50%, rgba(18,18,18,1) 75%, rgba(18,18,18,1) 100%)",
        }}
      />
    </div>
  </div>
);
