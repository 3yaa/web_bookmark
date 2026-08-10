"use client";
import { ShowProps, DIFF_COLUMNS_SHOW } from "@/types/show";
import { useCallback, useState } from "react";
import { Score } from "@/lib/tierConfig";
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

	// MOVIE SCORE BATTLER
	const [movieBattle, setMovieBattle] = useState<{
		item: MovieProps;
		score: Score;
	} | null>(null);

	const handleMovieUpdates = useCallback(
		(
			movieId: number,
			updates?: Partial<MovieProps>,
			shouldDelete?: boolean,
		) => {
			if (shouldDelete) {
				movieRemove(movieId);
				return;
			}
			if (!updates) return;
			const target = movieItems.find((m) => m.id === movieId);
			// go through the ringer
			if (updates.score && target && !target.score) {
				setMovieBattle({ item: target, score: updates.score });
				return;
			}
			movieUpdate(movieId, updates, true);
		},
		[movieItems, movieUpdate, movieRemove],
	);

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

	// adding a movie from a show's actor modal -- routes through the cross
	// media battler instead of the raw data hook, which skips scoring entirely
	const handleMovieAdd = useCallback(
		async (movie: MovieProps) => {
			const newItem = await movieAdd(movie);
			// TEMP DIAGNOSTIC -- remove once the add-with-score path is settled
			console.log(
				"[cross-add] sent score:",
				movie.score,
				"| got back:",
				newItem?.score,
			);
			if (!newItem?.score) return false;
			setMovieBattle({ item: newItem, score: newItem.score });
			return true;
		},
		[movieAdd],
	);

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
					searchQuery={searchQuery}
					emptyListText="No shows yet — add one!"
					onItemClicked={handleItemClicked}
					onSortConfig={handleSortConfig}
					onStatusFilter={handleStatusFilterConfig}
					onSearchChange={handleSearchQueryChange}
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
						onAddWork={handleItemAdd}
						//
						existingMovies={movieItems}
						onMovieUpdate={handleMovieUpdates}
						onAddMovie={handleMovieAdd}
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
			{/* SCORE BATTLER -- cross media (a movie opened from an actor) */}
			<AnimatePresence>
				{movieBattle && (
					<ScoreBattlerHub
						key="movie-battler"
						mediaType="movie"
						items={movieItems}
						initialScore={movieBattle.score}
						selectedItem={movieBattle.item}
						onClose={() => setMovieBattle(null)}
						onScoreFinal={(score) => {
							movieUpdate(movieBattle.item.id, { score }, true);
							setMovieBattle(null);
						}}
						onOpponentUpdate={(id, score) =>
							movieUpdate(id, { score }, true)
						}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
