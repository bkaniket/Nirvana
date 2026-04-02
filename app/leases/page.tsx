"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!hasPermission("LEASE", "view")) {
      router.push("/dashboard");
    }
  }, [router]);

  const myTheme = themeQuartz.withParams({
    backgroundColor: "#f8fafc",
    foregroundColor: "#1f2937",
    headerBackgroundColor: "#e0f2fe",
    headerTextColor: "#1e3a8a",
    borderColor: "#e5e7eb",
    spacing: 8,
    rowHoverColor: "#eef6ff",
  });

  const columnDefs: ColDef[] = [
    {
      field: "tenant_legal_name",
      headerName: "Tenant",
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => {
        return (
          <span
            onClick={() => router.push(`/leases/${params.data.id}`)}
           className="text-slate-900 hover:text-blue-600 hover:underline font-medium cursor-pointer transition"
          >
            {params.value || "-"}
          </span>
        );
      },
    },
    { field: "landlord_legal_name", headerName: "Landlord", filter: true, flex: 1 },
    { field: "lease_type", headerName: "Lease Type", filter: true, flex: 1 },
    { field: "lease_status", headerName: "Status", filter: true, flex: 1 },
    {
      headerName: "Rent Area",
      valueGetter: (params) =>
        `${params.data.lease_rentable_area || "-"} ${params.data.measure_units || ""}`,
      filter: true,
      flex: 1,
    },
    { field: "rent_commencement_date", headerName: "Commencement", filter: true, flex: 1 },
    { field: "termination_date", headerName: "Termination", filter: true, flex: 1 },
  ];

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/leases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setLeases(data);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [BASE_URL, router]);

  const filteredLeases = useMemo(() => {
    return leases.filter(
      (l) =>
        l.tenant_legal_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.landlord_legal_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.lease_status?.toLowerCase().includes(search.toLowerCase()) ||
        l.lease_type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [leases, search]);

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
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by tenant, landlord, status, or lease type..."
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
            {filteredLeases.length} leases
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
                theme={myTheme}
                rowData={filteredLeases}
                columnDefs={columnDefs}
                rowSelection="single"
                animateRows
                pagination
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50, 100]}
                rowHeight={52}
                headerHeight={56}
                suppressCellFocus
                suppressRowClickSelection={false}
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
    </div>
  );
}