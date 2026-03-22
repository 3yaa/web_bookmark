import Image from "next/image";

interface BookCoverChangeProps {
  coverUrl?: string;
  title: string;
  coverUrls?: string[];
  coverIndex?: number;
}

export function BookCoverChange({
  coverUrl,
  title,
  coverUrls,
  coverIndex,
}: BookCoverChangeProps) {
  return (
    <>
      {coverIndex !== undefined &&
      coverUrls !== undefined &&
      coverUrls[coverIndex] ? (
        <Image
          src={coverUrls[coverIndex]}
          alt={title || "Untitled"}
          width={248}
          height={372}
          className="min-w-62 min-h-93 object-cover"
        />
      ) : coverUrl && coverUrl.trim() !== "" ? (
        <Image
          src={coverUrl}
          alt={title || "Untitled"}
          width={248}
          height={372}
          className="min-w-62 min-h-93 object-cover"
        />
      ) : (
        <div className="min-w-62 min-h-93 bg-linear-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
      )}
    </>
  );
}
