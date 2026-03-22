import Image from "next/image";
import React, { ReactNode } from "react";
import { BaseMediaProps } from "@/types/media";
import { ColumnConfig } from "./shared";
import { BackdropImageMobile } from "../../components/ui/BackdropMobile";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import { ShowProgressBarMobile } from "../../shows/components/listing/showProgress";
import { ShowProps } from "@/types/show";
import { GameProps } from "@/types/game";

interface MediaMobileItemProps<T extends BaseMediaProps> {
  item: T;
  isNavOpen: boolean;
  mediaType: string;
  differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
  onClick: (item: T) => void;
}

export const MediaMobileItem = React.memo(function MediaMobileItem<
  T extends BaseMediaProps,
>({
  item,
  isNavOpen,
  mediaType,
  differentColumns,
  onClick,
}: MediaMobileItemProps<T>) {
  const seriesSection =
    mediaType === "game"
      ? (() => {
          const game = item as unknown as GameProps;
          return {
            placement: game.dlcIndex !== 0 ? String(game.dlcIndex) : undefined,
            prequel: game.dlcs?.[game.dlcIndex - 1]?.name, //prev
            sequel: game.dlcs?.[game.dlcIndex + 1]?.name, //next
          };
        })()
      : {
          placement: item.placeInSeries,
          prequel: item.prequel,
          sequel: item.sequel,
        };

  return (
    <div
      className={`relative mx-auto flex bg-zinc-950 backdrop-blur-2xl shadow-sm rounded-md border-b border-b-zinc-700/20 ${
        isNavOpen ? "pointer-events-none" : ""
      }`}
      onClick={() => onClick(item)}
    >
      <div
        className="w-30 overflow-hidden rounded-md shadow-sm shadow-black/40"
        style={{ aspectRatio: mediaType === "game" ? "3/4" : "0.677" }}
      >
        {(item.posterUrl ?? item.coverUrl) ? (
          <Image
            src={(item.posterUrl ?? item.coverUrl)!}
            alt={item.title || "Untitled"}
            width={300}
            height={450}
            priority
            className="object-fill w-full h-full rounded-md border border-zinc-700/40"
          />
        ) : (
          <div
            className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-800 rounded-md border border-zinc-600/30"
            style={{ aspectRatio: mediaType === "game" ? "3/4" : "0.677" }}
          ></div>
        )}
      </div>
      <div className="px-3 pt-3 flex flex-col w-full min-w-0">
        {/* BACKDROP */}
        {item.backdropUrl && (
          <BackdropImageMobile
            src={item.backdropUrl}
            width={1280}
            height={720}
          />
        )}
        {/* TITLE/SCORE */}
        <div className="flex justify-between items-start">
          <span className="text-zinc-200 font-semibold text-base leading-tight max-w-52 truncate">
            {item.title || "-"}
          </span>
          <span className="text-zinc-400 text-sm font-bold bg-zinc-900/60 px-2.5 py-1 rounded-md shadow-xl shadow-black/80 -mt-1.5">
            {item.score || "-"}
          </span>
        </div>
        {/* STUDIO/RELEASE DATE */}
        <div className="text-zinc-500 text-xs font-medium flex space-x-1 pt-1">
          {/* AUTHOR/STUDIO/DIRECTOR */}
          <span className="truncate max-w-35">
            {differentColumns[0].render(item) || "-"},
          </span>
          {/* RELEASE/PUBLISHED DATE */}
          <span>{differentColumns[1].render(item) || "-"}</span>
        </div>
        {/* DATE COMPLETE AND STATUS BAR */}
        {mediaType === "show" ? (
          <ShowProgressBarMobile show={item as unknown as ShowProps} />
        ) : (
          <>
            <div className={`${item.dateCompleted ? "-mt-1.5" : "pt-2.5"}`}>
              <span className="flex justify-end text-zinc-500 text-[0.65rem] font-medium">
                {formatDateShort(item.dateCompleted)}
              </span>
            </div>
            <div className="mt-1.5 w-full rounded-md h-1.5 overflow-hidden">
              <div
                className={`${getStatusBg(
                  item.status,
                )} h-1.5 transition-all duration-500 ease-out rounded-md`}
              />
            </div>
          </>
        )}
        {/* PREQUEL/SEQUEL */}
        {mediaType !== "show" && (
          <div
            className={`${
              seriesSection.placement
                ? "grid grid-cols-[1fr_2rem_1fr] mt-1"
                : "mt-3"
            }`}
          >
            {/* PREQUEL */}
            <div className="truncate text-left">
              {seriesSection.prequel && (
                <div
                  className="flex gap-1 items-center text-[0.60rem] text-zinc-400/80"
                  style={{
                    maxWidth: seriesSection.sequel
                      ? `${Math.min(Math.min(seriesSection.prequel.length, seriesSection.sequel.length) * 0.38, 7.38)}rem`
                      : "auto",
                  }}
                >
                  <span>←</span>
                  <span className="truncate">{seriesSection.prequel}</span>
                </div>
              )}
            </div>
            {/* PLACEMENT */}
            <div className="flex justify-center items-end">
              {seriesSection.placement && (
                <label className="text-[0.65rem] font-medium text-zinc-400/85">
                  {seriesSection.placement}
                </label>
              )}
            </div>
            {/* SEQUEL */}
            <div className="text-right flex justify-end">
              {seriesSection.sequel && (
                <div
                  className={`flex gap-1 items-center text-[0.60rem] text-zinc-400/80`}
                  style={{
                    maxWidth: seriesSection.prequel
                      ? `${Math.min(
                          Math.min(
                            seriesSection.prequel.length,
                            seriesSection.sequel.length,
                          ) * 0.38,
                          7.38,
                        )}rem`
                      : "auto",
                  }}
                >
                  <span className="truncate">{seriesSection.sequel}</span>
                  <span>→</span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* NOTES */}
        <p
          className={`text-zinc-500 text-sm line-clamp-2 overflow-hidden leading-snug font-medium flex items-center justify-center text-center min-h-8 w-full wrap-break-word ${mediaType === "show" && "mt-1.5"}`}
        >
          <span className="line-clamp-2">{item.note || "No notes"}</span>
        </p>
      </div>
    </div>
  );
}) as <T extends BaseMediaProps>(props: MediaMobileItemProps<T>) => ReactNode;
