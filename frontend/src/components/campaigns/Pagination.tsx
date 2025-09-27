import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1 && !hasMore) return null;

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Page Info */}
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="glass-card border-white/20 bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "glass-card border-white/20 bg-white/10"
              }
            >
              {page === "..." ? <MoreHorizontal className="h-4 w-4" /> : page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="glass-card border-white/20 bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <Button
            variant="secondary"
            onClick={onLoadMore}
            disabled={isLoading}
            className="interactive-scale"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
};
