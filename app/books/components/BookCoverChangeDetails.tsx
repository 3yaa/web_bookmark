import Image from "next/image";

interface BookCoverChangeProps {
  coverUrl?: string;
  title: string;
  coverUrls?: string[];
  coverIndex?: number;
  className?: string;
  onLoad?: () => void;
  height?: number;
  width?: number;
}

export function BookCoverChange({
  coverUrl,
  title,
  coverUrls,
  coverIndex,
  onLoad,
  className,
  width,
  height,
}: BookCoverChangeProps) {
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
