"use client";
import { useCallback } from "react";
import { MovieProps } from "@/types/movie";
import { DIFF_COLUMNS_MOVIE } from "@/types/movie";
import { useMediaData } from "@/hooks/useMediaData";
import { useManageMedia } from "@/hooks/useManageMedia";
import { useSortMedia } from "@/hooks/useSortMedia";
import { movieStatusOptions } from "@/utils/dropDownDetails";
import { AddMovie } from "./AddMovie";
import { MovieDetails } from "./MovieDetailsHub";
import { DesktopListing } from "@/app/views/mediaListing/DesktopListing";
import { MobileListing } from "@/app/views/mediaListing/MobileListing";
import { AddButton } from "../components/ui/AddButton";
import { ScoreBattlerHub } from "../views/mediaDetails/shared/scoreBattler/ScoreBattlerHub";
import { AnimatePresence } from "framer-motion";
import { ShowProps } from "@/types/show";

export default function MoviesHub() {
	const { items, add, update, refresh, remove, isProcessing } =
		useMediaData<MovieProps>({
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

	// IN-CASE NEED SHOW DATA
	const {
		items: showItems,
		add: showAdd,
		update: showUpdate,
		remove: showRemove,
	} = useMediaData<ShowProps>({
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

	const { handleItemUpdates: handleShowUpdates } = useManageMedia<ShowProps>({
		onAdd: showAdd,
		items: showItems,
		onRemove: showRemove,
		onUpdate: showUpdate,
	});

	const {
		filteredItems,
		sortConfig,
		statusFilter,
		searchQuery,
		selectedItem,
		setSelectedItem,
		titleToUse,
		setTitleToUse,
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
	} = useManageMedia<MovieProps>({
		onAdd: add,
		items: items,
		onRemove: remove,
		onUpdate: update,
		onRefresh: refresh,
	});

	const sortedMovies = useSortMedia(
		filteredItems,
		sortConfig,
		DIFF_COLUMNS_MOVIE,
	);

	const handleBackfillTmdbId = useCallback(
		(movieId: number, tmdbId: string) => {
			refresh(movieId, { tmdbId } as Partial<MovieProps>, true);
		},
		[refresh],
	);

	const isInList = useCallback(
		(title: string) =>
			items.some(
				(movie) =>
					movie.title.toLowerCase().trim() ===
					title.toLowerCase().trim(),
			),
		[items],
	);

	// sequel/prequel navigation
	const showSequelPrequel = useCallback(
		(targetTitle: string) => {
			if (!targetTitle) return;
			const targetMovie = items.find(
				(movie) =>
					movie.title.toLowerCase().trim() ===
					targetTitle.toLowerCase().trim(),
			);
			if (targetMovie) {
				setSelectedItem(targetMovie);
			} else {
				setTitleToUse(targetTitle);
				setActiveModal("addModal");
			}
		},
		[items, setSelectedItem, setTitleToUse, setActiveModal],
	);

	return (
		<div className="min-h-screen">
			<div className="lg:block hidden">
				<DesktopListing
					mediaItems={sortedMovies}
					isProcessing={isProcessing}
					sortConfig={sortConfig}
					statusOptions={movieStatusOptions.map(
						(status) => status.value,
					)}
					curStatusFilter={statusFilter}
					mediaType="movie"
					differentColumns={DIFF_COLUMNS_MOVIE}
					searchQuery={searchQuery}
					emptyListText="No movies yet — add one!"
					onItemClicked={handleItemClicked}
					onSortConfig={handleSortConfig}
					onSearchChange={handleSearchQueryChange}
					onStatusFilter={handleStatusFilterConfig}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileListing
					mediaItems={sortedMovies}
					isProcessing={isProcessing || isFilterPending}
					sortConfig={sortConfig}
					statusOptions={movieStatusOptions.map(
						(status) => status.value,
					)}
					curStatusFilter={statusFilter}
					mediaType="movie"
					differentColumns={DIFF_COLUMNS_MOVIE}
					emptyListText="No movies yet — add one!"
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
					<AddMovie
						key="add"
						isOpen={activeModal === "addModal"}
						onClose={handleModalClose}
						existingMovies={items}
						onAddMovie={handleItemAdd}
						titleFromAbove={titleToUse}
					/>
				)}
			</AnimatePresence>
			{/* DETAILS MODAL */}
			<AnimatePresence>
				{activeModal === "detailsModal" && selectedItem && (
					<MovieDetails
						key="details"
						movie={selectedItem}
						onClose={handleModalClose}
						onUpdate={handleItemUpdates}
						onRefresh={handleItemRefresh}
						onBackfillTmdbId={handleBackfillTmdbId}
						showSequelPrequel={showSequelPrequel}
						isInList={isInList}
						existingMovies={items}
						onAddWork={add}
						//
						existingShows={showItems}
						onShowUpdate={handleShowUpdates}
						onAddShow={showAdd}
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
							mediaType="movie"
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
