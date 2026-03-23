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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {(title || description || onSearch) && (
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {description}
              </p>
            )}
          </div>
          {onSearch && (
             <div className="relative w-full max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input
                     type="text"
                     onChange={(e) => onSearch(e.target.value)}
                     placeholder="Search..."
                     className="w-full rounded-md border border-gray-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                 />
             </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn("px-6 py-4 font-semibold", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
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
                  className="transition-colors hover:bg-slate-50"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800",
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

      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
         <span className="text-sm font-semibold text-slate-500">
             Total records: <span className="text-slate-900">{data.length}</span>
         </span>
      </div>
    </div>
  );
}
