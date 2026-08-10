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
import { AnimatePresence } from "framer-motion";

const normalizeTitle = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/, "");

export default function BookHub() {
  // GET DATA FROM DB
  const { items, add, update, refresh, remove, isProcessing } =
    useMediaData<BookProps>({
      endpoint: "books",
      requiredFieldsToPost: ["title", "status", "key"],
      statusOrder: { "Want to Read": 0, Completed: 1, Dropped: 2 },
      extraFieldsToUpdate: ["seriesTitle", "placeInSeries", "prequel", "sequel"],
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
    handleItemRefresh,
    handleScoreFinal,
    handleItemAdd,
  } = useManageMedia<BookProps>({
    onAdd: add,
    items: items,
    onRemove: remove,
    onUpdate: update,
    onRefresh: refresh,
  });

  // MANAGES ANY SORTS
  const sortedBooks = useSortMedia(
    filteredItems,
    sortConfig,
    DIFF_COLUMNS_BOOK,
  );

  const isInList = useCallback(
    (title: string) =>
      items.some(
        (book) => normalizeTitle(book.title) === normalizeTitle(title),
      ),
    [items],
  );

  // sequel/prequel navigation
  const showSequelPrequel = useCallback(
    (targetTitle: string) => {
      if (!targetTitle) return;
      const targetBook = items.find(
        (book) => normalizeTitle(book.title) === normalizeTitle(targetTitle),
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
          searchQuery={searchQuery}
          emptyListText="No books yet — add one!"
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
          <AddBook
            key="add"
            isOpen={activeModal === "addModal"}
            onClose={handleModalClose}
            existingBooks={items}
            onAddBook={handleItemAdd}
            titleFromAbove={titleToUse}
          />
        )}
      </AnimatePresence>
      {/* DETAILS MODAL */}
      <AnimatePresence>
        {activeModal === "detailsModal" && selectedItem && (
          <BookDetails
            key="details"
            book={selectedItem}
            onClose={handleModalClose}
            onUpdate={handleItemUpdates}
            onRefresh={handleItemRefresh}
            showSequelPrequel={showSequelPrequel}
            isInList={isInList}
          />
        )}
      </AnimatePresence>
      {/* SCORE BATTLER */}
      <AnimatePresence>
        {activeModal === "scoreBattlerModal" && selectedItem && tempScore && (
          <ScoreBattlerHub
            key="battler"
            mediaType="book"
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
      </AnimatePresence>
    </div>
  );
}
