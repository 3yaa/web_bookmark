import {
  Settings2,
  ChevronDown,
  ChevronUp,
  Circle,
  Search,
} from "lucide-react";
import { BaseMediaProps, MediaStatus } from "@/types/media";
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loading } from "../../components/ui/Loading";
import { ColumnConfig } from "./shared";
import { DesktopItem } from "./DesktopItem";

interface DesktopListingProps<T extends BaseMediaProps> {
  mediaItems: T[];
  isProcessing: boolean;
  // sort/filter
  sortConfig: { type: string; order: "asc" | "desc" } | null;
  statusOptions: MediaStatus[];
  curStatusFilter: MediaStatus | null;
  // [0]: author | [1]: dateReleased
  differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
  // search
  searchQuery: string;
  //
  mediaType: string;
  emptyListText: string;
  // callbacks
  onItemClicked: (item: T) => void;
  onSortConfig: (sortKey: string) => void;
  onSearchChange: (searchVal: string) => void;
  onStatusFilter: (Status: MediaStatus) => void;
}

export function DesktopListing<T extends BaseMediaProps>({
  mediaItems,
  isProcessing,
  sortConfig,
  statusOptions,
  curStatusFilter,
  differentColumns,
  searchQuery,
  mediaType,
  emptyListText,
  onItemClicked,
  onSortConfig,
  onSearchChange,
  onStatusFilter,
}: DesktopListingProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [openStatusOption, setOpenStatusOption] = useState(false);
  //
  const virtualizer = useVirtualizer({
    count: mediaItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 101,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 101,
  });
  // use / to open search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      //
      if (e.key === "/") {
        if (!searchOpen) {
          setSearchOpen(true);
          searchBarRef.current?.focus();
          e.preventDefault();
        }
      }
    };
    //
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [searchOpen]);
  // if click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        openStatusOption &&
        statusFilterRef.current &&
        !statusFilterRef.current.contains(e.target as Node)
      ) {
        setOpenStatusOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openStatusOption]);

  return (
    <div className="w-full md:w-[70%] lg:w-[65%] mx-auto flex flex-col h-screen">
      {/* STATUS FILTER */}
      <div
        className="fixed left-1 p-2 px-2.5 bg-linear-to-br from-zinc-900/80 to-zinc-950 border-zinc-700/50 shadow-lg shadow-black rounded-lg"
        ref={statusFilterRef}
        onClick={() => {
          setOpenStatusOption(!openStatusOption);
        }}
      >
        <div
          className={`
                    relative z-20 transition-all duration-300 ease-out rounded-md
                    ${openStatusOption ? "bg-zinc-800/60 p-2 -m-2" : ""}
                  `}
        >
          <Settings2
            className={`
                      w-5 h-5 transition-all duration-300 ease-out cursor-pointer
                      ${
                        openStatusOption
                          ? "text-zinc-300 rotate-90 scale-110"
                          : "text-zinc-400 rotate-0 scale-100"
                      }
                    `}
          />
        </div>
        {/* STATUS FILTER OPTIONS */}
        <div
          className={`
                    fixed left-0 mt-2 min-w-44 bg-linear-to-br from-zinc-900/95 to-zinc-950 backdrop-blur-xl
                    border border-zinc-800/40 rounded-lg shadow-2xl overflow-hidden
                    origin-top-left z-10
                    transition-all duration-300 ease-out
                    ${
                      openStatusOption
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }
                  `}
        >
          {statusOptions.map((status, index) => (
            <div
              key={status}
              className={`
                        flex items-center justify-between px-4 py-3 text-zinc-300 text-sm
                        transition-all duration-200 ease-out cursor-pointer
                        hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-98
                        ${index !== statusOptions.length - 1 ? "border-b border-zinc-800/80" : ""}
                        ${curStatusFilter === status ? "bg-zinc-800/40" : ""}
                      `}
              style={{
                transitionDelay: openStatusOption ? `${index * 30}ms` : "0ms",
              }}
              onClick={() => {
                onStatusFilter(status);
                setOpenStatusOption(false);
              }}
            >
              <span className="font-medium">{status}</span>
              <div
                className={`
                        transition-all duration-200 ease-out
                        ${
                          curStatusFilter === status
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-40"
                        }
                      `}
              >
                {curStatusFilter === status ? (
                  <div className="relative w-5 h-5">
                    <Circle className="w-5 h-5 text-blue-400 absolute" />
                    <div className="w-3 h-3 bg-blue-400/90 rounded-full absolute top-1 left-1 animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* SEARCH BUTTON/BAR */}
      <div className="fixed top-1 right-1 z-20">
        <div className="relative">
          {/* SEARCH BUTTON */}
          <div
            className={`flex items-center gap-2 bg-linear-to-bl from-zinc-900/80 to-zinc-950 border-zinc-700/50 shadow-lg shadow-black rounded-lg transition-all duration-300 ease-out ${
              searchOpen
                ? "w-72 px-3 py-2"
                : "w-9 h-9 px-0 py-0 cursor-pointer hover:bg-zinc-800/70"
            }`}
            onClick={() => {
              if (!searchOpen) {
                setSearchOpen(true);
                searchBarRef.current?.focus();
              }
            }}
          >
            <Search
              className={`w-4 h-4 text-zinc-400 shrink-0 transition-all duration-300 ${
                searchOpen ? "ml-0" : "ml-2.5"
              }`}
            />
            {/* SEARCH BAR */}
            <input
              type="text"
              ref={searchBarRef}
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              onBlur={() => !searchQuery && setSearchOpen(false)}
              placeholder={"Search " + mediaType + "s..."}
              className={`bg-transparent text-sm text-zinc-100 font-medium placeholder-zinc-500 focus:outline-none flex-1 transition-all duration-300 ${
                searchOpen
                  ? "w-full opacity-100 pointer-events-auto"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
            />
            {searchOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                  setSearchOpen(false);
                }}
                className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors hover:cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      {/* HEADING */}
      <div className="sticky top-0 z-10 grid md:grid-cols-[2rem_6rem_1fr_6rem_7rem_11rem_6.5rem_0.85fr] bg-zinc-800/70 backdrop-blur-3xl rounded-lg rounded-t-none px-5 py-2.5 shadow-lg border border-zinc-900 select-none">
        <span className="font-semibold text-zinc-300 text-sm">#</span>
        <span className="font-semibold text-zinc-300 text-sm">Cover</span>
        {/* TITLE */}
        <div
          className="flex justify-start items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("title")}
        >
          <span className="font-semibold text-zinc-300 text-sm">Title</span>
          {sortConfig?.type === "title" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* SCORE */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("score")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "score" ? "ml-4" : ""
            }`}
          >
            Score
          </span>
          {sortConfig?.type === "score" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* DATE COMPLETED */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig("dateCompleted")}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === "dateCompleted" ? "ml-4" : ""
            }`}
          >
            Completed
          </span>
          {sortConfig?.type === "dateCompleted" &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* AUTHOR/DIRECTOR/STUDIO */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig(differentColumns[0].sortKey)}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === differentColumns[0].sortKey ? "ml-4" : ""
            }`}
          >
            {differentColumns[0].label}
          </span>
          {sortConfig?.type === differentColumns[0].sortKey &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        {/* DATE PUBLISHED/RELEASED */}
        <div
          className="flex justify-center items-center gap-1 hover:cursor-pointer"
          onClick={() => onSortConfig(differentColumns[1].sortKey)}
        >
          <span
            className={`text-center font-semibold text-zinc-300 text-sm ${
              sortConfig?.type === differentColumns[1].sortKey ? "ml-4" : ""
            }`}
          >
            {differentColumns[1].label}
          </span>
          {sortConfig?.type === differentColumns[1].sortKey &&
            (sortConfig?.order === "desc" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
        <span className="text-center font-semibold text-zinc-300 text-sm pl-0.5">
          Notes
        </span>
      </div>
      {/* LOADER */}
      {isProcessing && (
        <div className="relative bg-black/20 backdrop-blur-lg">
          <Loading customStyle="mt-72 h-12 w-12 border-gray-400" text="" />
        </div>
      )}
      {/* NO MEDIA */}
      {!isProcessing && mediaItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 italic text-lg">{emptyListText}</p>
        </div>
      )}
      {/* LISTING */}
      {!isProcessing && mediaItems.length > 0 && (
        <div ref={parentRef} className="w-full overflow-auto flex-1">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = mediaItems[virtualItem.index];
              return (
                <div
                  key={item.id}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <DesktopItem
                    item={item}
                    index={virtualItem.index}
                    total={mediaItems.length}
                    mediaType={mediaType}
                    onClick={onItemClicked}
                    differentColumns={differentColumns}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
