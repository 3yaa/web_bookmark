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

export default function ShowHub() {
  const { items, add, update, remove, isProcessing } = useMediaData<ShowProps>({
    endpoint: "shows",
    requiredFieldsToPost: ["title", "status", "tmdbId"],
    statusOrder: { Watching: 0, "Want to Watch": 1, Completed: 2, Dropped: 3 },
    extraFieldsToUpdate: ["curSeasonIndex", "curEpisode"],
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
    tempScore,
    handleScoreFinal,
    handleItemAdd,
  } = useManageMedia<ShowProps>({
    onAdd: add,
    items: items,
    onRemove: remove,
    onUpdate: update,
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
          statusOptions={showStatusOptions.map((status) => status.value)}
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
          statusOptions={showStatusOptions.map((status) => status.value)}
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
      {activeModal === "addModal" && (
        <AddShow
          isOpen={activeModal === "addModal"}
          onClose={handleModalClose}
          existingShows={items}
          onAddShow={handleItemAdd}
          titleFromAbove={titleToUse}
        />
      )}
      {/* DETAILS MODAL */}
      {activeModal === "detailsModal" && selectedItem && (
        <ShowDetails
          show={selectedItem}
          onClose={handleModalClose}
          onUpdate={handleItemUpdates}
        />
      )}
      {/* SCORE BATTLER */}
      {activeModal === "scoreBattlerModal" && selectedItem && (
        <ScoreBattlerHub
          items={items}
          initialScore={tempScore}
          onClose={() => {
            setActiveModal("detailsModal");
          }}
          selectedItem={selectedItem}
          onScoreFinal={handleScoreFinal}
        />
      )}
    </div>
  );
}
