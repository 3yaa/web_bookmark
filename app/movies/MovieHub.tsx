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

export default function MoviesHub() {
  const { items, add, update, remove, isProcessing } = useMediaData<MovieProps>(
    {
      endpoint: "movies",
      requiredFieldsToPost: ["title", "status", "imdbId"],
      statusOrder: { "Want to Watch": 0, Completed: 1, Dropped: 2 },
    },
  );

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
    tempScore,
    handleScoreFinal,
    handleItemAdd,
  } = useManageMedia<MovieProps>({
    onAdd: add,
    items: items,
    onRemove: remove,
    onUpdate: update,
  });

  const sortedMovies = useSortMedia(
    filteredItems,
    sortConfig,
    DIFF_COLUMNS_MOVIE,
  );

  // sequel/prequel navigation
  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (!targetTitle) return;
      const targetMovie = items.find(
        (movie) =>
          movie.title.toLowerCase().trim() === targetTitle.toLowerCase().trim(),
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
          statusOptions={movieStatusOptions.map((status) => status.value)}
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
          statusOptions={movieStatusOptions.map((status) => status.value)}
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
      {activeModal === "addModal" && (
        <AddMovie
          isOpen={activeModal === "addModal"}
          onClose={handleModalClose}
          existingMovies={items}
          onAddMovie={handleItemAdd}
          titleFromAbove={titleToUse}
        />
      )}
      {/* DETAILS MODAL */}
      {activeModal === "detailsModal" && selectedItem && (
        <MovieDetails
          movie={selectedItem}
          onClose={handleModalClose}
          onUpdate={handleItemUpdates}
          showSequelPrequel={showSequelPrequel}
        />
      )}
      {/* SCORE BATTLER */}
      {activeModal === "scoreBattlerModal" && selectedItem && tempScore && (
        <ScoreBattlerHub
          items={items}
          initialScore={tempScore}
          onClose={() => {
            setActiveModal("detailsModal");
          }}
          selectedItem={selectedItem}
          onScoreFinal={handleScoreFinal}
          onOpponentUpdate={(id, score) => handleItemUpdates(id, { score })}
        />
      )}
    </div>
  );
}
