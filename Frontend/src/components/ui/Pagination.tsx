import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showThreshold = 5;

    if (totalPages <= showThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PageButton
            key={i}
            page={i}
            active={currentPage === i}
            onClick={() => onPageChange(i)}
          />
        );
      }
    } else {
      // Logic for many pages
      pages.push(
        <PageButton
          key={1}
          page={1}
          active={currentPage === 1}
          onClick={() => onPageChange(1)}
        />
      );

      if (currentPage > 3) {
        pages.push(<span key="dots-1" className="px-2 text-primary/60 mt-2"><MoreHorizontal className="h-4 w-4" /></span>);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === totalPages) continue;
        pages.push(
          <PageButton
            key={i}
            page={i}
            active={currentPage === i}
            onClick={() => onPageChange(i)}
          />
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="dots-2" className="px-2 text-primary/60 mt-2"><MoreHorizontal className="h-4 w-4" /></span>);
      }

      pages.push(
        <PageButton
          key={totalPages}
          page={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      );
    }

    return pages;
  };

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-8 h-8 p-0 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center gap-1">{renderPageNumbers()}</div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-8 h-8 p-0 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </nav>
  );
}

export default Pagination;

function PageButton({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "primary" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "min-w-[32px] h-8 p-0 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
          : "text-slate-500 hover:bg-slate-100/80"
      )}
    >
      {page}
    </Button>
  );
}


















