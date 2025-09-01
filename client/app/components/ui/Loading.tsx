interface LoadingProps {
  borderColor: string; //border
  text: string;
}

export function Loading({ borderColor, text }: LoadingProps) {
  return (
    <div className="absolute inset-0 bg-zinc-900 rounded-2xl flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${borderColor}`}
        ></div>
        <span className="text-zinc-300 text-sm">{text}</span>
      </div>
    </div>
  );
}
