import {
	SlidersHorizontal,
	ChartNoAxesColumn,
	Settings2,
	ChevronDown,
	ChevronUp,
	Circle,
} from "lucide-react";
import { BaseMediaProps, MediaStatus, ColumnConfig } from "@/types/media";
import { useNav } from "../../components/NavContext";
import { useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Loading } from "../../components/ui/Loading";
import { MobileItem } from "./MobileItem";

interface MobileListingProps<T extends BaseMediaProps> {
	mediaItems: T[];
	isProcessing: boolean;
	sortConfig: { type: string; order: "asc" | "desc" } | null;
	statusOptions: MediaStatus[];
	curStatusFilter: MediaStatus | null;
	mediaType: string;
	differentColumns: [ColumnConfig<T>, ColumnConfig<T>];
	emptyListText: string;
	onItemClicked: (item: T) => void;
	onSortConfig: (sortKey: string) => void;
	onStatusFilter: (status: MediaStatus) => void;
}

export function MobileListing<T extends BaseMediaProps>({
	mediaItems,
	isProcessing,
	sortConfig,
	statusOptions,
	curStatusFilter,
	mediaType,
	differentColumns,
	emptyListText,
	onItemClicked,
	onSortConfig,
	onStatusFilter,
}: MobileListingProps<T>) {
	const { isNavOpen } = useNav();
	const parentRef = useRef<HTMLDivElement>(null);
	const [openSortOption, setOpenSortOption] = useState(false);
	const [openStatusOption, setOpenStatusOption] = useState(false);
	//
	const virtualizer = useWindowVirtualizer({
		count: mediaItems.length,
		estimateSize: () => 136,
		overscan: 5,
		measureElement: (element) =>
			element?.getBoundingClientRect().height ?? 136,
	});

	const sortOptions = [
		{ label: "Title", sortKey: "title" },
		{ label: "Score", sortKey: "score" },
		{
			label: differentColumns[0].label,
			sortKey: differentColumns[0].sortKey,
		},
		{
			label: differentColumns[1].label,
			sortKey: differentColumns[1].sortKey,
		},
		{ label: "Date Completed", sortKey: "dateCompleted" },
	];

	const handleItemClicked = (item: T) => {
		if (openSortOption || openStatusOption) {
			setOpenSortOption(false);
			setOpenStatusOption(false);
			return;
		}
		onItemClicked(item);
	};

	return (
		<div className="w-full mx-auto tracking-tight ">
			{/* HEADING */}
			<div className="sticky left-0 right-0 top-0 z-10 bg-zinc-900/35 backdrop-blur-xl shadow-lg border-b border-zinc-700/20 select-none flex justify-between items-center rounded-b-md px-3 will-change-transform">
				{/* STATUS FILTER */}
				<div
					className="relative py-3 px-5"
					onClick={() => {
						setOpenStatusOption(!openStatusOption);
						setOpenSortOption(false);
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
						? "text-zinc-200 rotate-90 scale-110"
						: "text-zinc-400 rotate-0 scale-100"
				}
              `}
						/>
					</div>

					{/* STATUS FILTER OPTIONS */}
					<div
						className={`
              fixed left-2 mt-2 min-w-44 bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/40 rounded-lg shadow-2xl overflow-hidden
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
                  flex items-center justify-between px-4 py-3 text-zinc-300 text-sm active:scale-98
									${index !== statusOptions.length - 1 ? "border-b border-zinc-800/60" : ""}
                  ${curStatusFilter === status ? "bg-zinc-800/40" : ""}
                `}
								style={{
									transitionDelay: openStatusOption
										? `${index * 30}ms`
										: "0ms",
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

				{/* STAT */}
				<div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
					<ChartNoAxesColumn className="w-4 h-4 text-slate-500" />
					<span>{mediaItems.length} Entries</span>
				</div>

				{/* SORT */}
				<div
					className="relative py-3 px-5"
					onClick={() => {
						setOpenSortOption(!openSortOption);
						setOpenStatusOption(false);
					}}
				>
					<div
						className={`
              relative z-20 transition-all duration-300 ease-out rounded-md
              ${openSortOption ? "bg-zinc-800/60 p-2 -m-2" : ""}
            `}
					>
						<SlidersHorizontal
							className={`
                w-5 h-5 transition-all duration-300 ease-out cursor-pointer
                ${
					openSortOption
						? "text-zinc-200 rotate-90 scale-110"
						: "text-zinc-400 rotate-0 scale-100"
				}
              `}
						/>
					</div>
					{/* SORT OPTIONS */}
					<div
						className={`
              fixed right-2 mt-2 min-w-48 bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/40 rounded-lg shadow-2xl overflow-hidden
              origin-top-right z-10
              transition-all duration-300 ease-out
              ${
					openSortOption
						? "opacity-100 scale-100 translate-y-0"
						: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
				}
            `}
					>
						{sortOptions.map((sort, index) => (
							<div
								key={sort.sortKey}
								className={`
                  flex items-center justify-between px-4 py-3 text-zinc-300 text-sm
                  transition-all duration-200 ease-out cursor-pointer
                  hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-98
                  ${index !== 4 ? "border-b border-zinc-800/60" : ""}
                  ${sortConfig?.type === sort.sortKey ? "bg-zinc-800/40" : ""}
                `}
								style={{
									transitionDelay: openSortOption
										? `${index * 30}ms`
										: "0ms",
								}}
								onClick={() => onSortConfig(sort.sortKey)}
							>
								<span className="font-medium">
									{sort.label}
								</span>
								<div
									className={`
                  transition-all duration-200 ease-out
                  ${
						sortConfig?.type === sort.sortKey
							? "scale-100 opacity-100"
							: "scale-0 opacity-0"
					}
                `}
								>
									{sortConfig?.type === sort.sortKey &&
										(sortConfig?.order === "desc" ? (
											<ChevronDown className="w-4 h-4 text-zinc-400" />
										) : (
											<ChevronUp className="w-4 h-4 text-zinc-400" />
										))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* LOADER */}
			{isProcessing && (
				<div className="relative bg-black/20 backdrop-blur-lg">
					<Loading
						customStyle="mt-72 h-12 w-12 border-zinc-500/40"
						text=""
					/>
				</div>
			)}
			{/* EMPTY */}
			{!isProcessing && mediaItems.length === 0 && (
				<div className="text-center py-12">
					<p className="text-zinc-500 italic text-lg">
						{emptyListText}
					</p>
				</div>
			)}
			{/* LISTING */}
			{!isProcessing && mediaItems.length > 0 && (
				<div ref={parentRef} className="w-full">
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
									ref={virtualizer.measureElement}
									data-index={virtualItem.index}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualItem.start}px)`,
									}}
								>
									<MobileItem
										item={item}
										isNavOpen={isNavOpen}
										mediaType={mediaType}
										differentColumns={differentColumns}
										onClick={handleItemClicked}
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
