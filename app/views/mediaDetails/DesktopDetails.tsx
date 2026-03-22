import Image from "next/image";
import { Loading } from "@/app/components/ui/Loading";
import { BaseMediaProps } from "@/types/media";
import {
  formatDateShort,
  getStatusBorderGradient,
  getStatusDetailWaveColor,
} from "@/utils/formattingUtils";
import {
  Trash2,
  Plus,
  X,
  ChevronsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BackdropImage } from "@/app/components/ui/Backdrop";
import { ColumnConfig } from "../listView/shared";
import { Dropdown, Option } from "@/app/components/ui/Dropdown";
import { scoreOptions } from "@/utils/dropDownDetails";
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { BookCoverChange } from "@/app/books/components/detailsUtil/BookCoverChange";
import { BackdropImageBook } from "@/app/components/ui/BackdropBook";
import { SeriesNav } from "./shared/SeriesNav";
import { EditProgress } from "@/app/shows/components/detailsUtil/EditProgress";

interface DesktopDetailsProps<T extends BaseMediaProps> {
  item: T;
  localNote: string;
  statusOptions: Option[];
  mediaType: string;
  isLoading?: { isTrue: boolean; style: string; text: string };
  isAdding: boolean;
  onAdd: () => void;
  onClose: () => void;
  onSeriesNav?: (dir: "left" | "right") => void;
  differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
  onAction: (action: { type: string; payload?: unknown }) => void;
  // only for book
  coverUrls?: string[];
  coverIndex?: number;
  // only for game
  backdropUrls?: string[];
  backdropIndex?: number;
  // only for show
  editingMode?: { season: boolean; episode: boolean };
  inputValues?: { season: number | ""; episode: number | "" };
}

export function DesktopDetails<T extends BaseMediaProps>({
  item,
  localNote,
  statusOptions,
  mediaType,
  isLoading,
  isAdding,
  onAdd,
  onClose,
  onSeriesNav,
  onAction,
  coverUrls,
  coverIndex,
  backdropUrls,
  backdropIndex,
  editingMode,
  inputValues,
  differentColumns,
}: DesktopDetailsProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent new line
      onAction({ type: "saveNote" });
      e.currentTarget.blur(); // remove focus
    }
  };
  // only for game/book
  const handleCoverChange = (e: React.MouseEvent<HTMLElement>) => {
    //detects which side of the div was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const elementWidth = rect.width;
    const isRightSide = clickX > elementWidth / 2;

    onAction({
      type: "changeCover",
      payload: isRightSide ? "next" : "prev",
    });
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-black/50 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div
        className="fixed inset-0"
        onClick={() => {
          onAction({ type: "closeModal" });
        }}
      />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-linear-to-b ${getStatusBorderGradient(
          item.status,
        )} p-1.5 py-2 lg:min-w-215 lg:max-w-215`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-linear-to-br bg-[#121212] backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          {isLoading?.isTrue && (
            <Loading customStyle={isLoading.style} text={isLoading.text} />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl overflow-hidden`}>
            {/* ACTION BUTTONS */}
            {isAdding ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                {/* NAV DIFFERENT SERIES */}
                {onSeriesNav && (
                  <div className="flex gap-1 bg-zinc-800/50 rounded-lg">
                    {/* LEFT BUTTON */}
                    <button
                      className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                      hover:cursor-pointer transition-all group"
                      onClick={() => onSeriesNav("left")}
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </button>
                    {/* RIGHT BUTTON */}
                    <button
                      className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-yellow-600/60
                      hover:cursor-pointer transition-all group"
                      onClick={() => onSeriesNav("right")}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </button>
                  </div>
                )}
                {/* ADD */}
                <button
                  className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
                  onClick={onAdd}
                  title={"Add " + mediaType}
                >
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
                </button>
                {/* NEED YEAR | SHOW MORE BOOKS*/}
                <button
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer transition-all group"
                  onClick={() => {
                    onAction({
                      type:
                        mediaType === "book" ? "moreBooks" : "needYearField",
                    });
                  }}
                  title={
                    mediaType === "book"
                      ? "See More Options"
                      : "Search with year"
                  }
                >
                  <ChevronsUp className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>
                {/* CLOSE BUTTON */}
                <button
                  className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                    hover:cursor-pointer transition-all group"
                  onClick={onClose}
                  title={"Close"}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/0 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group z-10"
                onClick={() => {
                  onAction({ type: "delete" });
                }}
                title={"Delete " + mediaType}
              >
                <Trash2 className="w-4 h-4 text-gray-400/5 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}

            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div
                className={`flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg select-none ${
                  coverUrls ? "hover:cursor-pointer" : ""
                }`}
                // FO BOOK ONLY
                onClick={
                  mediaType === "book" && coverUrls && coverUrls.length > 1
                    ? handleCoverChange
                    : undefined
                }
                title={
                  mediaType === "book" && coverUrls && coverIndex !== undefined
                    ? `${coverIndex + 1}/${coverUrls?.length}`
                    : ""
                }
              >
                {mediaType !== "book" ? (
                  (item.posterUrl ?? item.coverUrl) ? (
                    <>
                      <Image
                        src={(item.posterUrl ?? item.coverUrl)!}
                        alt={item.title || "Untitled"}
                        width={1280}
                        height={720}
                        className={`min-w-62 min-h-93 ${mediaType === "game" ? "object-cover" : "object-fill"}`}
                      />
                    </>
                  ) : (
                    <div className="min-w-62 min-h-93 bg-linear-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                  )
                ) : (
                  <BookCoverChange
                    coverUrl={item.coverUrl}
                    title={item.title}
                    coverUrls={coverUrls}
                    coverIndex={coverIndex}
                    className={"min-w-62 min-h-93 object-cover"}
                    height={372}
                    width={248}
                  />
                )}
                {/* gradient overlay */}
                <div
                  className="absolute inset-0 left-8.5 top-7 max-w-62 max-h-93"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.5) 100%)",
                  }}
                />
              </div>

              {/* RIGHT SIDE -- DETAILS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62 relative">
                {/* BACKDROP */}
                {mediaType === "book"
                  ? item.coverUrl && (
                      <BackdropImageBook
                        src={item.coverUrl}
                        width={1280}
                        height={720}
                      />
                    )
                  : (() => {
                      const backdropUrl =
                        mediaType === "game" &&
                        isAdding &&
                        backdropIndex !== undefined
                          ? backdropUrls?.[backdropIndex]
                          : item.backdropUrl;
                      return (
                        backdropUrl && (
                          <BackdropImage
                            src={backdropUrl}
                            width={mediaType === "game" ? 1920 : 1280}
                            height={mediaType === "game" ? 1080 : 720}
                          />
                        )
                      );
                    })()}
                {/* game backdrop cycling overlay */}
                {mediaType === "game" &&
                  isAdding &&
                  backdropUrls &&
                  backdropUrls.length > 1 && (
                    <div
                      className="absolute top-0 -left-8 -right-8 h-40 hover:cursor-pointer z-5"
                      onClick={handleCoverChange}
                      title={`${backdropIndex}/${backdropUrls.length}`}
                    />
                  )}
                {/*  */}
                <div
                  className={`flex flex-col ${
                    item.seriesTitle ? "justify-center" : "justify-center mt-12"
                  } flex-1`}
                >
                  {/* SERIES TITLE */}
                  {(() => {
                    const seriesLabel =
                      mediaType === "game"
                        ? item.dlcIndex !== 0
                          ? item.mainTitle
                          : null
                        : item.seriesTitle;

                    return (
                      seriesLabel && (
                        <span className="font-semibold text-zinc-100/80 text-xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-0">
                          {seriesLabel}
                        </span>
                      )
                    );
                  })()}
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
                      {item.title || "Untitled"}
                    </div>
                    {/* STATUS WAVE */}
                    <div className="w-full bg-zinc-800 rounded-full h-0.75 overflow-hidden">
                      <div
                        className={`bg-zinc-900 h-0.75 transition-all duration-500 ease-out rounded-full relative overflow-hidden`}
                        style={{ width: "100%" }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: getStatusDetailWaveColor(item.status),
                            animation: "wave 6s ease-in-out infinite",
                            width: "200%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* AUTHOR/STUDIO/DIRECTOR AND DATES */}
                  <div className="flex justify-start items-center gap-2 w-full mb-3">
                    <span className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 leading-6">
                      {differentColumns[0].render(item) ||
                        "Unknown " + differentColumns[0].label}
                    </span>
                    <div className="font-medium text-zinc-200/70 text-md leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {differentColumns[1].render(item) || "Unknown"}
                    </span>
                    {item.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200/70 text-md leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDateShort(item.dateCompleted)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div></div>
                  {/* STATUS AND SCORE */}
                  <div className="flex justify-start gap-4 mb-2.5 max-w-[94%]">
                    <div className="flex-[0.77] lg:min-w-41.25">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={item.status}
                        onChange={(value) => {
                          onAction({
                            type: "changeStatus",
                            payload: value as
                              | "Completed"
                              | "Want to Watch"
                              | "Dropped",
                          });
                        }}
                        options={statusOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropDuration={0.24}
                      />
                    </div>
                    <div className="flex-[0.865] lg:min-w-48.75">
                      <label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
                        Score
                      </label>
                      <Dropdown
                        value={item.score?.toString() || "-"}
                        onChange={(value) => {
                          onAction({
                            type: "changeScore",
                            payload: Number(value),
                          });
                        }}
                        options={scoreOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={(() => {
                          const option = statusOptions.find(
                            (opt) => opt.value === item.status,
                          );
                          return option
                            ? [option.textStyle, option.bgStyle].filter(
                                (s): s is string => s !== undefined,
                              )
                            : [];
                        })()}
                        dropDuration={0.4}
                      />
                    </div>
                  </div>
                  {/* SHOW PROGRESS (season/episode) */}
                  {mediaType === "show" && editingMode && inputValues && (
                    <EditProgress
                      item={item}
                      editingMode={editingMode}
                      inputValues={inputValues}
                      onAction={onAction}
                    />
                  )}
                  {/* NOTES */}
                  <div className="space-y-1 mb-2 max-w-[94%]">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Notes
                    </label>
                    <div className="bg-zinc-800/30 rounded-lg pl-3 pt-3 pr-1 pb-1.5 max-h-21.5 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200 shadow-lg shadow-black/20">
                      <AutoTextarea
                        value={localNote}
                        onChange={(e) => {
                          onAction({
                            type: "changeNote",
                            payload: e.target.value,
                          });
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          onAction({ type: "saveNote" });
                        }}
                        placeholder={
                          "Add your thoughts about this " + mediaType + "..."
                        }
                        className="text-gray-300/90 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
                {/* PREQUEL AND SEQUEL */}
                {mediaType !== "show" && (
                  <SeriesNav
                    item={item}
                    mediaType={mediaType}
                    isAdding={isAdding}
                    onAction={onAction}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
