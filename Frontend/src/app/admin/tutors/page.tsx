"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Loader2, AlertCircle, ShieldCheck, GraduationCap, Globe, Mail, IdCard, XCircle, AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllTutors, BaseUser, warnUser, activateUser, deactivateUser } from "@/services/adminService";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";

export default function AdminTutorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "tutors", currentPage],
    queryFn: () => getAllTutors(currentPage, 6),
    staleTime: 5 * 60 * 1000,
  });

  const tutors = data?.tutors || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  const handleWarn = async (id: string) => {
    setActioning(id);
    try {
      await warnUser(id);
      refetch();
    } catch (err: any) {
      console.error("Failed to issue warning.");
    } finally {
      setActioning(null);
    }
  };

  const handleToggleBlock = async (id: string, currentlyActive: boolean) => {
    setActioning(id);
    try {
      if (currentlyActive) {
        await deactivateUser(id);
      } else {
        await activateUser(id);
      }
      refetch();
    } catch (err: any) {
      console.error("Failed to update account status.");
    } finally {
      setActioning(null);
    }
  };

  const columns: ColumnDef<BaseUser>[] = [
    {
      header: "Mentor Identity",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 font-black text-emerald-600 text-lg shadow-inner uppercase tracking-tighter shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-800 text-sm tracking-tight truncate">{row.name}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase truncate">
               <Mail className="h-3 w-3 shrink-0" /> {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <div className="flex flex-col gap-2">
          <span className={cn(
            "inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm w-fit",
            row.isActive 
              ? "text-emerald-500 bg-emerald-50 border-emerald-100 shadow-emerald-500/5" 
              : "text-red-500 bg-red-50 border-red-100 shadow-red-500/5"
          )}>
            {row.isActive ? <ShieldCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {row.isActive ? "Verified Active" : "Blocked / Inactive"}
          </span>
          {row.warnings && row.warnings > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 w-fit">
               <AlertTriangle className="h-3 w-3" /> {row.warnings} Total Warnings issued
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: "specialization",
      cell: (row) => (
        <div className="flex flex-col">
           <span className="text-xs font-bold text-gray-700">{row.specialization || "General Mentor"}</span>
           <span className="text-[10px] text-gray-400 font-medium italic truncate max-w-[150px]">{row.experience || "Native Speaker"}</span>
        </div>
      )
    },
    {
       header: "Administrative Logic",
       accessorKey: "_id",
       className: "text-right",
       cell: (row) => (
          <div className="flex items-center justify-end gap-3 px-2">
             <Button
               onClick={() => handleWarn(row._id)}
               disabled={actioning === row._id}
               variant="outline"
               size="sm"
               className="h-9 px-4 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 text-[10px] font-black uppercase tracking-widest gap-2"
             >
                <AlertTriangle className="h-3.5 w-3.5" />
                Warn
             </Button>
             <Button
               onClick={() => handleToggleBlock(row._id, row.isActive)}
               disabled={actioning === row._id}
               variant={row.isActive ? "danger" : "secondary"}
               size="sm"
               className={cn(
                 "h-9 px-5 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg transition-all",
                 row.isActive 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
               )}
             >
                {row.isActive ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {row.isActive ? "Block Access" : "Activate Portal"}
             </Button>
          </div>
       )
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-10 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-gray-100 pb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <span className="h-2 w-12 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Directory Control</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">Verified Mentors</h1>
           <p className="text-lg text-gray-500 font-medium max-w-xl">Comprehensive archive of authenticated teachers and language experts across the Mozhi Aruvi network.</p>
        </div>
        <Button
          onClick={() => refetch()}
          isLoading={isLoading}
          variant="outline"
          size="lg"
          className="uppercase tracking-widest text-[10px] font-black px-10 border-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
        >
          Audit Repository
        </Button>
      </div>

      {isError && (
        <div className="flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50/50 p-8 text-sm text-red-600">
          <AlertCircle className="h-6 w-6 shrink-0" /> <span className="font-bold">{error?.message || "Could not load mentors directory."}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white rounded-[3rem] border border-dashed border-gray-100 shadow-sm">
          <div className="h-16 w-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-xl ring-4 ring-emerald-500/5" />
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Requesting secure data from node...</p>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
           <DataTable title={`Expert Directory Intelligence (${totalItems} active entries)`} columns={columns} data={tutors} />
           <div className="pt-10 border-t border-gray-50">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
           </div>
        </div>
      )}
    </div>
  );
}
