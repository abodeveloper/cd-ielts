import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";

interface CardListProps<TData> {
  data: TData[]; // Array of items to display (already paginated by backend)
  renderCard: (item: TData, index: number) => React.ReactNode; // Custom render function for cards
  pagination?: boolean; // Enable/disable pagination
  pageSize?: number; // Items per page (for display purposes)
  totalCount?: number; // Total number of items (from backend)
  totalPages?: number; // Total number of pages (from backend)
  currentPage?: number; // Current page number
  onPageChange?: (page: number) => void; // Callback for page changes
  isLoading?: boolean; // Loading state
  onCardClick?: (item: TData) => void; // Optional click handler for cards
  columnsPerRow?: number; // Maximum number of cards per row on desktop/large screens
}

export function CardList<TData>({
  data = [], // Default to empty array to prevent undefined issues
  renderCard,
  pagination = false,
  pageSize = 10,
  totalCount = data.length,
  totalPages = Math.ceil(totalCount / pageSize),
  currentPage = 1,
  onPageChange,
  isLoading = false,
  onCardClick,
  columnsPerRow = 3, // Default to 3 cards per row on desktop
}: CardListProps<TData>) {
  // Calculate start and end indices for display purposes (not for slicing data)
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  // Since pagination is handled by the backend, use the data as-is
  const paginatedData = data;

  // Calculate responsive grid column classes based on columnsPerRow
  const gridClass = React.useMemo(() => {
    let classes = "grid-cols-1"; // Mobile: 1 column
    if (columnsPerRow >= 2) {
      classes += ` sm:grid-cols-2`; // Tablet: 2 columns
    }
    if (columnsPerRow >= 3) {
      classes += ` md:grid-cols-${Math.min(3, columnsPerRow)}`; // Medium: up to 3 columns
    }
    if (columnsPerRow >= 3) {
      classes += ` lg:grid-cols-${columnsPerRow}`; // Desktop: full columnsPerRow
    }
    return classes;
  }, [columnsPerRow]);

  return (
    <div>
      {/* Card Grid */}
      <div className={`grid ${gridClass} gap-6`}>
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center min-h-[350px]">
            <LoadingSpinner message="Loading data ..." />
          </div>
        ) : paginatedData.length ? (
          paginatedData.map((item, index) => (
            <div
              key={index} // Use index as key; replace with item.id if available
              className={onCardClick ? "cursor-pointer hover:opacity-90" : ""}
              onClick={() => onCardClick?.(item)}
            >
              {renderCard(item, start + index)}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24">No data.</div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between py-4">
          {/* Items range display */}
          <div className="text-sm flex items-center w-[200px]">
            {`${start}-${end} / ${totalCount}`} items
          </div>

          <Pagination className="flex items-center justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange?.(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange?.(Math.min(currentPage + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
