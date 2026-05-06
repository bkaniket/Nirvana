"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import "@/src/lib/ag-grid-setup";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Lease = {
  id: number;
  building_id: number;
  lease_name?: string;
  tenant_legal_name?: string;
  landlord_legal_name?: string;
  lease_status?: string;
  lease_type?: string;
  lease_agreement_date?: string;
  possession_date?: string;
  rent_commencement_date?: string;
  termination_date?: string;
  lease_rentable_area?: string;
  measure_units?: string;
  portfolio?: string;
  system_lease_id?: string;
  client_lease_id?: string;
  lease_version?: string;
  lease_source?: string;
};

type CustomColDef = ColDef & {
  exportFields?: string[];
};

export default function LeasesPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const gridRef = useRef<any>(null);

  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["tenant_legal_name"]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [permissions, setPermissions] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false,
  });

  useEffect(() => {
    setPermissions({
      create: hasPermission("LEASE", "create"),
      view: hasPermission("LEASE", "view"),
      edit: hasPermission("LEASE", "edit"),
      delete: hasPermission("LEASE", "delete"),
    });
  }, []);

  const { create: canCreate, view: canView } = permissions;

  // Reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset columns on modal open
  useEffect(() => {
    if (showExportModal) {
      setSelectedColumns(["tenant_legal_name"]);
    }
  }, [showExportModal]);

  // Redirect if no permission
  useEffect(() => {
    if (!hasPermission("LEASE", "view")) {
      router.push("/dashboard");
    }
  }, []);

  const myTheme = themeQuartz.withParams({
    backgroundColor: "#f8f9fa",
    foregroundColor: "#1f2937",
    headerBackgroundColor: "#dbeafe",
    headerTextColor: "#1e3a8a",
    borderColor: "#e5e7eb",
    spacing: 8,
    rowHoverColor: "#e0f2fe",
  });

 const columnDefs: CustomColDef[] = [
  {
    field: "lease_name",
    headerName: "Lease Name",
    filter: true,
    flex: 1,
    cellRenderer: (params: any) => (
      <span
        onClick={() => {
          if (canView) router.push(`/leases/${params.data.id}`);
        }}
        className="text-slate-900 hover:text-blue-600 hover:underline font-medium cursor-pointer transition"
      >
        {params.value || "-"}
      </span>
    ),
  },
  { field: "tenant_legal_name", headerName: "Tenant", filter: true, flex: 1 },
  { field: "landlord_legal_name", headerName: "Landlord", filter: true, flex: 1 },
  { field: "lease_type", headerName: "Lease Type", filter: true, flex: 1 },
  { field: "lease_status", headerName: "Status", filter: true, flex: 1 },
  {
    headerName: "Rent Area",
    field: "rent_area",
    exportFields: ["lease_rentable_area", "measure_units"],
    valueGetter: (params: any) =>
      `${params.data.lease_rentable_area || "-"} ${params.data.measure_units || ""}`,
    filter: true,
    flex: 1,
  },
  { field: "rent_commencement_date", headerName: "Commencement", filter: true, flex: 1 },
  { field: "termination_date", headerName: "Termination", filter: true, flex: 1 },

  { field: "lease_agreement_date", headerName: "Agreement Date", hide: true },
  { field: "possession_date", headerName: "Possession Date", hide: true },
  { field: "lease_rentable_area", headerName: "Rentable Area", hide: true },
  { field: "measure_units", headerName: "Units", hide: true },
  { field: "portfolio", headerName: "Portfolio", hide: true },
  { field: "system_lease_id", headerName: "System Lease ID", hide: true },
  { field: "client_lease_id", headerName: "Client Lease ID", hide: true },
  { field: "lease_version", headerName: "Version", hide: true },
  { field: "lease_source", headerName: "Source", hide: true },
];

  const allColumnFields = columnDefs
    .map((col) => col.field)
    .filter((field): field is string => Boolean(field));

  const allSelected =
    allColumnFields.length > 0 && selectedColumns.length === allColumnFields.length;
  const someSelected = selectedColumns.length > 0 && !allSelected;

  // Fetch leases
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (leases.length === 0) {
      setLoading(true);
    } else {
      setGridLoading(true);
    }

    fetch(`${BASE_URL}/leases?page=${page}&per_page=10&search=${debouncedSearch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setLeases(data?.data || []);
        setTotalPages(data?.last_page || 1);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => {
        setLoading(false);
        setGridLoading(false);
      });
  }, [page, debouncedSearch]);

  // Grid overlay
  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    if (gridLoading) {
      api.showLoadingOverlay();
    } else if (leases.length === 0) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }, [gridLoading, leases]);

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert("Select at least one column");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/leases/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          columns: selectedColumns,
          format: exportFormat,
          search: search,
        }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leases.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  function LeasesSkeleton() {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center px-6 py-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/30 shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-10 w-40 bg-gray-300/60 rounded-xl" />
            <div className="h-10 w-28 bg-gray-300/60 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-80 bg-gray-300/60 rounded-2xl" />
            <div className="h-11 w-36 bg-gray-300/60 rounded-xl" />
          </div>
        </div>
        <div className="rounded-3xl border border-white/30 bg-white/50 backdrop-blur-xl shadow-lg p-4 space-y-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-300/60 rounded" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-8 bg-gray-200/60 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <LeasesSkeleton />;

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 h-screen overflow-hidden">

      {/* ── Header ── */}
      <div className="relative flex justify-between items-center px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-xl shadow-slate-200/40 ring-1 ring-white/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 opacity-70" />

        <div className="relative flex justify-between items-center w-full">

          {/* Left: title + Create */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col mr-4">
              <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                Leases
              </h1>
              <p className="text-xs text-slate-500">
                Manage and monitor all lease records
              </p>
            </div>

            {canCreate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push("/leases/create")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Create</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  <p>Create lease</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Right: Search + Export */}
          <div className="flex items-center gap-3 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search leases..."
                className="w-80 h-12 pl-12 pr-4 bg-white text-black border border-gray-300 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v10m0 0l4-4m-4 4l-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Export</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="group relative flex flex-col rounded-3xl border-2 border-white/40 bg-white border border-gray-200 shadow-2xl shadow-slate-200/50 hover:shadow-3xl hover:shadow-blue-500/20 overflow-hidden ring-1 ring-white/30 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10 w-full h-[calc(100vh-320px)] min-h-[420px] max-h-[610px]">
          <AgGridReact
            ref={gridRef}
            theme={myTheme}
            rowData={leases}
            columnDefs={columnDefs}
            rowSelection="single"
            animateRows={true}
            pagination={false}
            rowHeight={52}
            headerHeight={56}
            suppressCellFocus={true}
            suppressRowClickSelection={false}
            overlayNoRowsTemplate="<div class='p-8 text-center'><span class='text-slate-500 text-lg font-medium'>No leases found</span></div>"
            className="
              [&_.ag-row]:cursor-default
              [&_.ag-theme-quartz]:bg-transparent
              [&_.ag-theme-quartz]:backdrop-blur-xl
              [&_.ag-theme-quartz]:border-white/30
              [&_.ag-header]:bg-white/85 [&_.ag-header]:backdrop-blur-xl [&_.ag-header]:border-b-white/50
              [&_.ag-header-cell]:font-semibold [&_.ag-header-cell]:text-slate-800 [&_.ag-header-cell:hover]:bg-blue-50/80
              [&_.ag-row-hover]:bg-gradient-to-r [&_.ag-row-hover]:from-blue-50/60 [&_.ag-row-hover]:to-indigo-50/60
              [&_.ag-row-selected]:bg-gradient-to-r [&_.ag-row-selected]:from-blue-500/10 [&_.ag-row-selected]:to-blue-600/10
              [&_.ag-cell]:backdrop-blur-sm [&_.ag-cell-focus]:ring-2 [&_.ag-cell-focus]:ring-blue-400/50
            "
          />
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-center gap-3 mt-3 pb-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="h-9 px-4 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          ← Prev
        </button>

        <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="h-9 px-4 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Next →
        </button>
      </div>

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-[420px] shadow-2xl space-y-5">

            {/* Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Export Leases
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Column Selection */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Columns
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => {
                      setSelectedColumns(e.target.checked ? allColumnFields : []);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 bg-white focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Select All</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                {columnDefs.map((col) => {
                  const field = col.field as string;
                  return (
                    <label
                      key={field}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(field)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 bg-white focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        onChange={(e) => {
                          const fields: string[] = (col as CustomColDef).exportFields
                            ? (col as CustomColDef).exportFields!
                            : field
                            ? [field]
                            : [];
                          setSelectedColumns((prev) => {
                            const set = new Set(prev);
                            if (e.target.checked) {
                              fields.forEach((f) => set.add(f));
                            } else {
                              fields.forEach((f) => set.delete(f));
                            }
                            return Array.from(set);
                          });
                        }}
                      />
                      <span className="group-hover:text-blue-600 transition-colors">
                        {col.headerName}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedColumns.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {selectedColumns.length} column{selectedColumns.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Format */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </p>
              <select
                className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setShowExportModal(false)}
                className="h-9 px-4 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumns.length === 0}
                className="h-9 px-5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}