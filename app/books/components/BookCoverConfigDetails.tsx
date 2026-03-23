import Image from "next/image";

interface BookCoverConfigProps {
  coverUrl?: string;
  title: string;
  coverUrls?: string[];
  coverIndex?: number;
  className?: string;
  onLoad?: () => void;
  height?: number;
  width?: number;
}

export function BookCoverConfig({
  coverUrl,
  title,
  coverUrls,
  coverIndex,
  onLoad,
  className,
  width,
  height,
}: BookCoverConfigProps) {
  return (
    <>
      {coverIndex !== undefined &&
      coverUrls !== undefined &&
      coverUrls[coverIndex] ? (
        <Image
          src={coverUrls[coverIndex]}
          alt={title || "Untitled"}
          width={width}
          height={height}
          className={className}
          onLoad={onLoad}
        />
      ) : coverUrl && coverUrl.trim() !== "" ? (
        <Image
          src={coverUrl}
          alt={title || "Untitled"}
          width={width}
          height={height}
          className={className}
          onLoad={onLoad}
        />
      ) : (
        <div className="h-64 bg-linear-to-br from-zinc-700 to-zinc-800" />
      )}
    </>
  );
}
