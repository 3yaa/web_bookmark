"use client";
import { useCallback } from "react";
import { BookProps } from "@/types/book";
import { DIFF_COLUMNS_BOOK } from "@/types/book";
import { useMediaData } from "@/hooks/useMediaData";
import { useManageMedia } from "@/hooks/useManageMedia";
import { useSortMedia } from "@/hooks/useSortMedia";
import { bookStatusOptions } from "@/utils/dropDownDetails";
import { AddBook } from "./AddBook";
import { BookDetails } from "./BookDetailsHub";
import { DesktopListing } from "@/app/views/mediaListing/DesktopListing";
import { MobileListing } from "@/app/views/mediaListing/MobileListing";
import { AddButton } from "../components/ui/AddButton";
import { ScoreBattlerHub } from "../views/mediaDetails/shared/scoreBattler/ScoreBattlerHub";

export default function BookHub() {
  // GET DATA FROM DB
  const { items, add, update, remove, isProcessing } = useMediaData<BookProps>({
    endpoint: "books",
    requiredFieldsToPost: ["title", "status", "key"],
    statusOrder: { "Want to Read": 0, Completed: 1, Dropped: 2 },
  });

  // MANAGEMENT OF STATES
  const {
    tempScore,
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
    handleScoreFinal,
    handleItemAdd,
  } = useManageMedia<BookProps>({
    onAdd: add,
    items: items,
    onRemove: remove,
    onUpdate: update,
  });

  // MANAGES ANY SORTS
  const sortedBooks = useSortMedia(
    filteredItems,
    sortConfig,
    DIFF_COLUMNS_BOOK,
  );

  // sequel/prequel navigation
  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (!targetTitle) return;
      const targetBook = items.find(
        (book) => book.title.toLowerCase() === targetTitle.toLowerCase(),
      );
      if (targetBook) {
        setSelectedItem(targetBook);
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
          mediaItems={sortedBooks}
          isProcessing={isProcessing}
          sortConfig={sortConfig}
          statusOptions={bookStatusOptions.map((status) => status.value)}
          curStatusFilter={statusFilter}
          mediaType="book"
          differentColumns={DIFF_COLUMNS_BOOK}
          searchQuery={searchQuery}
          emptyListText="No books yet — add one!"
          onItemClicked={handleItemClicked}
          onSortConfig={handleSortConfig}
          onSearchChange={handleSearchQueryChange}
          onStatusFilter={handleStatusFilterConfig}
        />
      </div>
      <div className="block lg:hidden">
        <MobileListing
          mediaItems={sortedBooks}
          isProcessing={isProcessing || isFilterPending}
          sortConfig={sortConfig}
          statusOptions={bookStatusOptions.map((status) => status.value)}
          curStatusFilter={statusFilter}
          mediaType="book"
          differentColumns={DIFF_COLUMNS_BOOK}
          emptyListText="No books yet — add one!"
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
        <AddBook
          isOpen={activeModal === "addModal"}
          onClose={handleModalClose}
          existingBooks={items}
          onAddBook={handleItemAdd}
          titleFromAbove={titleToUse}
        />
      )}
      {/* DETAILS MODAL */}
      {activeModal === "detailsModal" && selectedItem && (
        <BookDetails
          book={selectedItem}
          onClose={handleModalClose}
          onUpdate={handleItemUpdates}
          showSequelPrequel={showSequelPrequel}
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
