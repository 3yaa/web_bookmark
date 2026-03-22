import React, { ReactNode } from "react";
import Image from "next/image";
import { ColumnConfig } from "./shared";
import { BaseMediaProps } from "@/types/media";
import {
  formatDateShort,
  getStatusBg,
  getStatusBorderColor,
  getStatusWaveColor,
} from "@/utils/formattingUtils";
import { ShowProps } from "@/types/show";
import { ShowProgressBarDesktop } from "../../shows/components/listingUtil/showProgress";

interface DesktopItemProps<T extends BaseMediaProps> {
  item: T;
  index: number;
  total: number;
  mediaType: string;
  onClick: (item: T) => void;
  differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
}

export const DesktopItem = React.memo(function DesktopItem<
  T extends BaseMediaProps,
>({
  item,
  index,
  total,
  mediaType,
  onClick,
  differentColumns,
}: DesktopItemProps<T>) {
  return (
    <div
      className={`group max-w-[99%] mx-auto grid md:grid-cols-[2rem_6rem_1fr_6rem_7rem_11rem_6.5rem_0.85fr] px-3 py-0.5 items-center bg-zinc-900/65 scale-100 hover:scale-101 hover:rounded-xl hover:bg-zinc-800/65 transition-all duration-200 shadow-sm border-l-4 rounded-md ${getStatusBorderColor(
        item.status,
      )} border-b border-b-zinc-700/20 backdrop-blur-sm group ${
        index === 0 ? "rounded-bl-none" : "rounded-l-none"
      } 
						${index === total - 1 && "rounded-bl-md"}  
							hover:cursor-pointer`}
      onClick={() => onClick(item)}
    >
      <span className="font-medium text-zinc-300 text-sm">{index + 1}</span>
      <div className="w-16 h-24">
        {(item.posterUrl ?? item.coverUrl) ? (
          <Image
            src={(item.posterUrl ?? item.coverUrl)!}
            alt={item.title || "Untitled"}
            width={1280}
            height={720}
            priority
            className={`w-full h-full rounded-sm ${mediaType === "game" ? "object-cover" : "object-fill"}`}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-sm border border-zinc-600/30"></div>
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1 relative">
        <span className="font-semibold text-zinc-400 text-sm group-hover:text-zinc-300 flex gap-1">
          {(item.seriesTitle ?? item.mainTitle) ? (
            <>
              <span className="block max-w-[88%] whitespace-nowrap text-ellipsis overflow-hidden shrink">
                {item.seriesTitle ?? item.mainTitle}
              </span>
              <span>᭡</span>
              {item.placeInSeries && <span>{item.placeInSeries}</span>}
            </>
          ) : (
            ""
          )}
        </span>
        <span className="font-semibold text-zinc-100/90 text-[15.5px] group-hover:text-zinc-300 transition-colors duration-200 truncate max-w-full">
          {item.title || "-"}
        </span>
        {mediaType === "show" ? (
          <ShowProgressBarDesktop show={item as unknown as ShowProps} />
        ) : (
          <div
            className={`absolute -bottom-2.5 left-0 w-full ${getStatusBg(
              item.status,
            )} h-0.75 rounded-md overflow-hidden`}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `${getStatusWaveColor(item.status)}`,
                animation: "wave 4s ease-in-out infinite",
                width: "200%",
              }}
            />
          </div>
        )}
      </div>
      <span className="flex items-center justify-center font-bold text-zinc-300 text-sm bg-linear-to-br from-zinc-800/80 to-zinc-900/90 mx-7.5 py-2 pb-1 rounded-lg shadow-lg shadow-black/20 border border-zinc-800/40">
        {item.score || "-"}
      </span>
      <span className="text-center font-medium text-zinc-400 text-sm truncate">
        {item.status === "Completed"
          ? formatDateShort(item.dateCompleted) || "?"
          : "-"}
      </span>
      {/* AUTHOR/STUDIO/DIRECTOR */}
      <span className="text-center font-medium text-zinc-300/95 text-sm truncate">
        {differentColumns[0].render(item) || "-"}
      </span>
      {/* RELEASE/PUBLISHED DATE */}
      <span className="text-center font-medium text-zinc-400 text-sm truncate pl-0.5">
        {differentColumns[1].render(item) || "-"}
      </span>
      <span className="text-zinc-300/95 text-sm line-clamp-2 whitespace-normal overflow-hidden pl-0.5 text-center font-semibold group-hover:underline">
        {item.note || "No notes"}
      </span>
    </div>
  );
}) as <T extends BaseMediaProps>(props: DesktopItemProps<T>) => ReactNode;
