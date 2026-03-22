"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  description?: string;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  title,
  description,
  onSearch,
  isLoading,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {(title || description || onSearch) && (
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {onSearch && (
             <div className="relative w-full max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                 <input
                     type="text"
                     onChange={(e) => onSearch(e.target.value)}
                     placeholder="Search..."
                     className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                 />
             </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn("px-6 py-4 font-bold tracking-wider", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-slate-800">
            {isLoading ? (
               <tr>
                 <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-600">
                    Loading data...
                 </td>
               </tr>
            ) : data.length === 0 ? (
               <tr>
                 <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-600">
                    No results found.
                 </td>
               </tr>
            ) : (
                data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200",
                        col.className
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessorKey === "function"
                        ? col.accessorKey(row)
                        : (row[col.accessorKey as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
         <span className="text-sm font-bold text-slate-500">
             Total records: <span className="text-slate-800 dark:text-slate-200">{data.length}</span>
         </span>
      </div>
    </div>
  );
}
