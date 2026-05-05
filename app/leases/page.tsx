"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";

import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import type { CSSProperties } from "react";
import "@/src/lib/ag-grid-setup";

type Lease = {
  id: number;
  building_id: number;
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

  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const canCreate = hasPermission("LEASE", "create");
  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");
  const canDelete = hasPermission("LEASE", "delete");

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [gridLoading, setGridLoading] = useState(false);
  const gridRef = useRef<any>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
  if (showExportModal) {
    setSelectedColumns([]);
  }
}, [showExportModal]);

  useEffect(() => {
    if (!hasPermission("LEASE", "view")) {
      router.push("/dashboard");
    }
  }, [router]);

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

  const myTheme = themeQuartz.withParams({
    backgroundColor: "#f8fafc",
    foregroundColor: "#1f2937",
    headerBackgroundColor: "#e0f2fe",
    headerTextColor: "#1e3a8a",
    borderColor: "#e5e7eb",
    spacing: 8,
    rowHoverColor: "#eef6ff",
  });

 const columnDefs: CustomColDef[] = [
  {
    field: "lease_name",
    headerName: "Lease Name",
    filter: true,
    flex: 1,
    cellRenderer: (params: any) => (
      <span
        onClick={() => router.push(`/leases/${params.data.id}`)}
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

  // ✅ Virtual column
  {
    headerName: "Rent Area",
    field: "rent_area",
    exportFields: ["lease_rentable_area", "measure_units"],
    valueGetter: (params) =>
      `${params.data.lease_rentable_area || "-"} ${params.data.measure_units || ""}`,
    filter: true,
    flex: 1,
  },

  { field: "rent_commencement_date", headerName: "Commencement", filter: true, flex: 1 },
  { field: "termination_date", headerName: "Termination", filter: true, flex: 1 },

  // ✅ Hidden but available for export
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ Only show full loader on first load
    if (leases.length === 0) {
      setLoading(true);
    } else {
      setGridLoading(true); // 🔥 only grid reload
    }

    fetch(`${BASE_URL}/leases?page=${page}&per_page=10&search=${debouncedSearch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
        setGridLoading(false); // ✅ stop grid loader
      });
  }, [BASE_URL, router, page, debouncedSearch]);

  useEffect(() => {
    const api = gridRef.current?.api;

    if (!api) return; // ✅ prevents crash

    if (gridLoading) {
      api.showLoadingOverlay();
    } else if (leases.length === 0) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }, [gridLoading, leases]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white px-6 py-4 shadow-xl shadow-slate-200/40 ring-1 ring-white/40">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 opacity-70" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-3 w-52 rounded bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-10 w-24 rounded-full bg-slate-200" />
              <div className="h-10 w-24 rounded-full bg-slate-200" />
              <div className="h-10 w-24 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-10 w-72 rounded-xl bg-slate-100" />
            <div className="h-9 w-28 rounded-full bg-slate-100" />
          </div>
          <div className="h-[530px] w-full rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white px-6 py-4 shadow-xl shadow-slate-200/40 ring-1 ring-white/40">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 opacity-70" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leases</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, edit, and monitor all lease records</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <button
                onClick={() => router.push("/leases/create")}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition duration-300 hover:scale-[1.03] hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 active:scale-95 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create
              </button>
            )}

            {canEdit && (
              <button className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500 via-yellow-500 to-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-yellow-500/20 transition duration-300 hover:scale-[1.03] hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-600 active:scale-95 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L7 16l.293-2.707A4 4 0 018.464 10.536L15.232 3.768"
                  />
                </svg>
                Edit
              </button>
            )}

            {canDelete && (
              <button className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition duration-300 hover:scale-[1.03] hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-95 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-7 3h10" />
                </svg>
                Delete
              </button>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 via-green-600 to-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/20 transition duration-300 hover:scale-[1.03]"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by tenant, landlord, client lease id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {leases.length} leases
          </div>
        </div>

        {/* 🔥 Fixed Premium Glass Table - CORRECT NESTING */}
        <div
          style={
            {
              height: "530px",
              width: "100%",
              "--ag-odd-row-background-color": "#ffffff",
              "--ag-even-row-background-color": "#f8fafc",
            } as CSSProperties
          }
          className="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="group relative h-full w-full rounded-3xl border border-white/40 bg-white shadow-2xl shadow-slate-200/50 hover:shadow-blue-500/20 overflow-hidden ring-1 ring-white/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full w-full">
              <AgGridReact
                ref={gridRef}
                theme={myTheme}
                rowData={leases}
                columnDefs={columnDefs}
                rowSelection="single"
                animateRows
                pagination={false}
                rowHeight={52}
                headerHeight={56}
                suppressCellFocus
                suppressRowClickSelection={false}
                loadingOverlayComponentParams={{ loadingMessage: "Loading leases..." }}
                overlayLoadingTemplate={
                  "<div class='p-6 text-center text-slate-500'>Loading...</div>"
                }
                overlayNoRowsTemplate="<div class='p-8 text-center'><span class='text-slate-500 text-lg font-medium'>No leases found</span></div>"
                // onRowClicked={(event) => {
                //   if (canView) {
                //     router.push(`/leases/${event.data.id}`);
                //   }
                // }}
                className="
  [&_.ag-root-wrapper]:h-full
  [&_.ag-root-wrapper]:w-full
  [&_.ag-root-wrapper]:border-0

  [&_.ag-header]:rounded-t-3xl
  [&_.ag-header]:overflow-hidden

  [&_.ag-root]:rounded-3xl
  [&_.ag-root]:overflow-hidden

[&_.ag-header]:bg-white/80
[&_.ag-header]:backdrop-blur-xl
[&_.ag-header]:border-b
[&_.ag-header]:border-slate-200

[&_.ag-row-hover]:cursor-pointer

  [&_.ag-row]:cursor-default
"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>

        <span>Page {page} of {totalPages}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] space-y-4 shadow-xl">

            <h2 className="text-lg font-semibold">Export Leases</h2>

            {/* Column Selection */}
            <div>
              <p className="font-medium mb-2">Select Columns</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {columnDefs.map((col) => (
                  <label key={col.field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={col.field}
onChange={(e) => {
  const fields: string[] = col.exportFields
    ? col.exportFields
    : col.field
    ? [col.field]
    : [];

  setSelectedColumns((prev) => {
    const set = new Set(prev); // 🔥 dedupe base

    if (e.target.checked) {
      fields.forEach((f) => set.add(f));
    } else {
      fields.forEach((f) => set.delete(f));
    }

    return Array.from(set);
  });
}}
                    />
                    {col.headerName}
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <p className="font-medium mb-2">Select Format</p>
              <select
                className="w-full border rounded-lg p-2"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>

                <option value="pdf">PDF</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-500 text-white rounded"
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