interface LoadingProps {
  customStyle: string; //border
  customBg?: string;
  text?: string;
}

export function Loading({
  customBg = "bg-[#121212]",
  customStyle,
  text,
}: LoadingProps) {
  return (
    <div
      className={`absolute inset-0 ${customBg} rounded-2xl flex items-center justify-center z-20`}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full border-b-2 ${customStyle}`}
        ></div>
        <span className="text-zinc-300 text-sm">{text}</span>
      </div>
    </div>
  );
}
