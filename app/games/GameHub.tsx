"use client";
import { useCallback, useState } from "react";
import { GameProps, IGDBInitProps, DIFF_COLUMNS_GAME } from "@/types/game";
import { useMediaData } from "@/hooks/useMediaData";
import { useManageMedia } from "@/hooks/useManageMedia";
import { useSortMedia } from "@/hooks/useSortMedia";
import { gameStatusOptions } from "@/utils/dropDownDetails";
import { AddGame } from "./AddGame";
import { GameDetails } from "./GameDetailsHub";
import { DesktopListing } from "@/app/views/mediaListing/DesktopListing";
import { MobileListing } from "@/app/views/mediaListing/MobileListing";
import { AddButton } from "../components/ui/AddButton";
import { ScoreBattlerHub } from "../views/mediaDetails/shared/scoreBattler/ScoreBattlerHub";

export default function GameList() {
  const { items, add, update, remove, isProcessing } = useMediaData<GameProps>({
    endpoint: "games",
    requiredFieldsToPost: ["title", "status", "igdbId"],
    statusOrder: { Playing: 0, Completed: 1, Dropped: 2 },
  });

  const {
    filteredItems,
    sortConfig,
    statusFilter,
    searchQuery,
    selectedItem,
    setSelectedItem,
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
  } = useManageMedia<GameProps>({
    onAdd: add,
    items: items,
    onRemove: remove,
    onUpdate: update,
  });

  const sortedGames = useSortMedia(
    filteredItems,
    sortConfig,
    DIFF_COLUMNS_GAME,
  );

  // for when searching for dlcs within details
  const [titleToAdd, setTitleToAdd] = useState<{
    dlcIndex: number;
    mainTitle: string;
    dlcs: IGDBInitProps[];
  } | null>(null);

  const showDlc = useCallback(
    (targetIgdbId: number, dlcIndex: number) => {
      if (!targetIgdbId) return;
      const targetGame = items.find((game) => game.igdbId === targetIgdbId);
      if (targetGame) {
        setSelectedItem(targetGame);
      } else if (selectedItem?.dlcs) {
        const mainTitle =
          dlcIndex === 1 ? selectedItem.title : selectedItem.mainTitle;
        setTitleToAdd({
          dlcIndex,
          mainTitle: mainTitle || "",
          dlcs: selectedItem.dlcs,
        });
        setActiveModal("addModal");
      }
    },
    [items, selectedItem, setSelectedItem, setActiveModal],
  );

  // override generic close to also clear titleToAdd
  const handleGameModalClose = useCallback(() => {
    handleModalClose();
    setTitleToAdd(null);
  }, [handleModalClose]);

  return (
    <div className="min-h-screen">
      <div className="lg:block hidden">
        <DesktopListing
          mediaItems={sortedGames}
          isProcessing={isProcessing}
          sortConfig={sortConfig}
          statusOptions={gameStatusOptions.map((status) => status.value)}
          curStatusFilter={statusFilter}
          mediaType="game"
          differentColumns={DIFF_COLUMNS_GAME}
          searchQuery={searchQuery}
          emptyListText="No games yet — add one!"
          onItemClicked={handleItemClicked}
          onSortConfig={handleSortConfig}
          onSearchChange={handleSearchQueryChange}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      <div className="block lg:hidden">
        <MobileListing
          mediaItems={sortedGames}
          isProcessing={isProcessing || isFilterPending}
          sortConfig={sortConfig}
          statusOptions={gameStatusOptions.map((status) => status.value)}
          curStatusFilter={statusFilter}
          mediaType="game"
          differentColumns={DIFF_COLUMNS_GAME}
          emptyListText="No games yet — add one!"
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
        <AddGame
          isOpen={activeModal === "addModal"}
          onClose={handleGameModalClose}
          existingGames={items}
          onAddGame={handleItemAdd}
          titleFromAbove={titleToAdd}
        />
      )}
      {/* DETAILS MODAL */}
      {activeModal === "detailsModal" && selectedItem && (
        <GameDetails
          game={selectedItem}
          onClose={handleGameModalClose}
          onUpdate={handleItemUpdates}
          showDlc={showDlc}
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
          mediaType="game"
        />
      )}
    </div>
  );
}
