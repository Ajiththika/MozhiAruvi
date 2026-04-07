"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
  hideFooter?: boolean;
  pagination?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  title,
  description,
  onSearch,
  isLoading,
  hideFooter,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-sm transition-all duration-300">
      {(title || description || onSearch) && (
        <div className="flex flex-col gap-6 border-b border-border/40 px-8 py-6 md:flex-row md:items-center md:justify-between bg-surface-soft/30">
          <div>
            {title && (
              <h3 className="text-xl font-black text-text-primary tracking-tight uppercase">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 text-sm font-semibold text-text-secondary">
                {description}
              </p>
            )}
          </div>
          {onSearch && (
             <div className="relative w-full max-w-sm group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
                 <input
                     type="text"
                     onChange={(e) => onSearch(e.target.value)}
                     placeholder="Search across index..."
                     className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm font-bold text-text-primary placeholder:text-text-tertiary focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                 />
             </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft/60 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/60">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn("px-8 py-5", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-surface">
            {isLoading ? (
               <tr>
                 <td colSpan={columns.length} className="px-8 py-12 text-center text-text-secondary font-medium animate-pulse">
                    Synchronizing Data...
                 </td>
               </tr>
            ) : data.length === 0 ? (
               <tr>
                 <td colSpan={columns.length} className="px-8 py-12 text-center text-text-tertiary font-medium">
                    No records found in current frequency.
                 </td>
               </tr>
            ) : (
                 data.map((row, rowIndex) => (
                 <tr
                   key={rowIndex}
                   className="transition-colors hover:bg-surface-soft/80 group"
                 >
                   {columns.map((col, colIndex) => (
                     <td
                       key={colIndex}
                       className={cn(
                         "whitespace-nowrap px-8 py-5 text-sm font-bold text-text-primary",
                         col.className
                       )}
                     >
                       <div className="group-hover:translate-x-0.5 transition-transform duration-300">
                          {col.cell
                            ? col.cell(row)
                            : typeof col.accessorKey === "function"
                            ? col.accessorKey(row)
                            : (row[col.accessorKey as keyof T] as React.ReactNode)}
                       </div>
                     </td>
                   ))}
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {!hideFooter && !pagination && (
        <div className="flex items-center justify-between border-t border-border/40 px-8 py-5 bg-surface-soft/20">
           <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
               Total Sequence Records: <span className="text-primary">{data.length}</span>
           </span>
           <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Real-time Sync Active</span>
           </div>
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-center border-t border-border/40 px-6 py-4 bg-surface">
           {pagination}
        </div>
      )}
    </div>
  );
}
export default DataTable;














