import Image from "next/image";

interface BackdropImagePropsMobile {
  src: string;
  width: number;
  height: number;
}

export const BackdropImageMobile = ({
  src,
  width,
  height,
}: BackdropImagePropsMobile) => (
  <div className="absolute top-0 left-50 -z-10 overflow-hidden select-none">
    <div className="relative w-full h-full">
      {/* IMAGE */}
      <Image
        src={src}
        alt="Backdrop"
        width={width}
        height={height}
        className="object-cover opacity-35"
        style={{ objectPosition: "center -7px" }}
        loading="lazy"
      />

      {/* HORIZONTAL GRADIENT */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(9,9,9,1) 10%, rgba(9,9,9,0.2) 30%, transparent 50%, rgba(9,9,9,0.2) 100%)",
        }}
      />

      {/* VERTICAL GRADIENT */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 10%, rgba(9,9,9,0.8) 50%, rgba(9,9,9,1) 75%, rgba(9,9,9,1) 100%)",
        }}
      />
    </div>
  </div>
);
