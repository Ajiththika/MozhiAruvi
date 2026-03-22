"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
        pages.push(<span key="dots-1" className="px-2 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>);
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
        pages.push(<span key="dots-2" className="px-2 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>);
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
    <nav className={cn("flex items-center justify-center gap-2 py-8", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">{renderPageNumbers()}</div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

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
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2 text-sm font-bold transition-all",
        active
          ? "bg-mozhi-primary text-white shadow-lg shadow-mozhi-primary/20"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300"
      )}
    >
      {page}
    </button>
  );
}
