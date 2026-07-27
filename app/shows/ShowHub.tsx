"use client";
import { ShowProps, DIFF_COLUMNS_SHOW } from "@/types/show";
import { useMediaData } from "@/hooks/useMediaData";
import { useManageMedia } from "@/hooks/useManageMedia";
import { useSortMedia } from "@/hooks/useSortMedia";
import { showStatusOptions } from "@/utils/dropDownDetails";
import { AddShow } from "./AddShow";
import { ShowDetails } from "./ShowDetailsHub";
import { DesktopListing } from "@/app/views/mediaListing/DesktopListing";
import { MobileListing } from "@/app/views/mediaListing/MobileListing";
import { AddButton } from "../components/ui/AddButton";
import { ScoreBattlerHub } from "../views/mediaDetails/shared/scoreBattler/ScoreBattlerHub";
import { AnimatePresence } from "framer-motion";
import { MovieProps } from "@/types/movie";

export default function ShowHub() {
	const { items, add, update, refresh, remove, isProcessing } =
		useMediaData<ShowProps>({
			endpoint: "shows",
			requiredFieldsToPost: ["title", "status", "tmdbId"],
			statusOrder: {
				Watching: 0,
				"Want to Watch": 1,
				Completed: 2,
				Dropped: 3,
			},
			extraFieldsToUpdate: ["curSeasonIndex", "curEpisode"],
		});

	// IN-CASE NEED MOVIE DATA
	const {
		items: movieItems,
		add: movieAdd,
		update: movieUpdate,
		remove: movieRemove,
	} = useMediaData<MovieProps>({
		endpoint: "movies",
		requiredFieldsToPost: ["title", "status", "imdbId"],
		statusOrder: { "Want to Watch": 0, Completed: 1, Dropped: 2 },
		extraFieldsToUpdate: [
			"seriesTitle",
			"placeInSeries",
			"prequel",
			"sequel",
		],
	});

	const { handleItemUpdates: handleMovieUpdates } =
		useManageMedia<MovieProps>({
			onAdd: movieAdd,
			items: movieItems,
			onRemove: movieRemove,
			onUpdate: movieUpdate,
		});

	const {
		filteredItems,
		sortConfig,
		statusFilter,
		searchQuery,
		selectedItem,
		titleToUse,
		activeModal,
		setActiveModal,
		isMenuButtonsVisible,
		isFilterPending,
		handleSortConfig,
		handleStatusFilterConfig,
		handleModalClose,
		handleItemClicked,
		handleSearchQueryChange,
		handleItemUpdates,
		handleItemRefresh,
		tempScore,
		handleScoreFinal,
		handleItemAdd,
	} = useManageMedia<ShowProps>({
		onAdd: add,
		items: items,
		onRemove: remove,
		onUpdate: update,
		onRefresh: refresh,
	});

	const sortedShows = useSortMedia(
		filteredItems,
		sortConfig,
		DIFF_COLUMNS_SHOW,
	);

	return (
		<div className="min-h-screen">
			<div className="lg:block hidden">
				<DesktopListing
					mediaItems={sortedShows}
					isProcessing={isProcessing}
					sortConfig={sortConfig}
					statusOptions={showStatusOptions.map(
						(status) => status.value,
					)}
					curStatusFilter={statusFilter}
					mediaType="show"
					differentColumns={DIFF_COLUMNS_SHOW}
					searchQuery={searchQuery}
					emptyListText="No shows yet — add one!"
					onItemClicked={handleItemClicked}
					onSortConfig={handleSortConfig}
					onSearchChange={handleSearchQueryChange}
					onStatusFilter={handleStatusFilterConfig}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileListing
					mediaItems={sortedShows}
					isProcessing={isProcessing || isFilterPending}
					sortConfig={sortConfig}
					statusOptions={showStatusOptions.map(
						(status) => status.value,
					)}
					curStatusFilter={statusFilter}
					mediaType="show"
					differentColumns={DIFF_COLUMNS_SHOW}
					emptyListText="No shows yet — add one!"
					onItemClicked={handleItemClicked}
					onSortConfig={handleSortConfig}
					onStatusFilter={handleStatusFilterConfig}
				/>
			</div>
			{/* ADD BUTTON */}
			<AddButton
				onClick={() => setActiveModal("addModal")}
				isVisible={isMenuButtonsVisible}
			/>
			{/* ADD MODAL */}
			<AnimatePresence>
				{activeModal === "addModal" && (
					<AddShow
						key="add"
						isOpen={activeModal === "addModal"}
						onClose={handleModalClose}
						existingShows={items}
						onAddShow={handleItemAdd}
						titleFromAbove={titleToUse}
					/>
				)}
			</AnimatePresence>
			{/* DETAILS MODAL */}
			<AnimatePresence>
				{activeModal === "detailsModal" && selectedItem && (
					<ShowDetails
						key="details"
						show={selectedItem}
						onClose={handleModalClose}
						onUpdate={handleItemUpdates}
						onRefresh={handleItemRefresh}
						existingShows={items}
						onAddWork={add}
						//
						existingMovies={movieItems}
						onMovieUpdate={handleMovieUpdates}
						onAddMovie={movieAdd}
					/>
				)}
			</AnimatePresence>
			{/* SCORE BATTLER */}
			<AnimatePresence>
				{activeModal === "scoreBattlerModal" &&
					selectedItem &&
					tempScore && (
						<ScoreBattlerHub
							key="battler"
							mediaType="show"
							items={items}
							initialScore={tempScore}
							onClose={() => {
								setActiveModal("detailsModal");
							}}
							selectedItem={selectedItem}
							onScoreFinal={handleScoreFinal}
							onOpponentUpdate={(id, score) =>
								handleItemUpdates(id, { score })
							}
						/>
					)}
			</AnimatePresence>
		</div>
	);
}
