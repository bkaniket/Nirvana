"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
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

  // 🔐 Permissions
  const canCreate = hasPermission("LEASE", "create");
  const canView   = hasPermission("LEASE", "view");
  const canEdit   = hasPermission("LEASE", "edit");
  const canDelete = hasPermission("LEASE", "delete");

  useEffect(() => {
  if (!hasPermission("LEASE", "view")) {
    router.push("/dashboard");
  }
}, []);
  const myTheme = themeQuartz.withParams({
  backgroundColor: "#f8f9fa",        // off-white grid
  foregroundColor: "#1f2937",
  headerBackgroundColor: "#dbeafe",  // light blue header
  headerTextColor: "#1e3a8a",
  borderColor: "#e5e7eb",
  spacing: 8,
  rowHoverColor: "#e0f2fe",
});
const columnDefs: ColDef[] = [
  { field: "tenant_legal_name", headerName: "Tenant", filter: true },
  { field: "landlord_legal_name", headerName: "Landlord", filter: true },
  { field: "lease_type", headerName: "Lease Type", filter: true },
  { field: "lease_status", headerName: "Status", filter: true },
  { 
    headerName: "Rent Area",
    valueGetter: (params) =>
      `${params.data.lease_rentable_area || "-"} ${params.data.measure_units || ""}`,
    filter: true
  },
  { field: "rent_commencement_date", headerName: "Commencement", filter: true },
  { field: "termination_date", headerName: "Termination", filter: true },
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
        console.log("Leases:", data);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredLeases = leases.filter(
    (l) =>
      l.tenant_legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.landlord_legal_name?.toLowerCase().includes(search.toLowerCase())
  );
  if (loading) {
  return (   <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Left buttons skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
        </div>

        {/* Right search skeleton */}
        <div className="h-10 w-64 bg-gray-300 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="h-[530px] w-full bg-gray-300 rounded" />
    </div>
  );
}

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Left: CRUD */}
        <div className="flex gap-2">
          {canCreate && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => router.push("/leases/create")}
            >
              ➕ Create
            </button>
          )}

          {canEdit && (
            <button className="px-4 py-2 bg-yellow-500 text-white rounded">
              ✏️ Edit
            </button>
          )}

          {canDelete && (
            <button className="px-4 py-2 bg-red-600 text-white rounded">
              🗑 Delete
            </button>
          )}
        </div>

        
      </div>

      {/* Table */}
<div
  style={{
    height: "530px",
    width: "100%",
    "--ag-odd-row-background-color": "#ffffff",
    "--ag-even-row-background-color": "#f3f4f6",
  } as React.CSSProperties}
>
  <AgGridReact
    theme={myTheme}
    rowData={filteredLeases}
    columnDefs={columnDefs}
    rowSelection="single"
    animateRows
    onRowClicked={(event) => {
      if (canView) {
        router.push(`/leases/${event.data.id}`);
      }
    }}
  />
</div>
    </div>
  );
}
