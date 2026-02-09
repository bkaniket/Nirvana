"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/src/lib/ag-grid-setup";

type Building = {
  id: number;
  building_name: string;
  address_1: string;
  city?: string;
  country?: string;
  building_status?: string;
  ownership_type?: string;
  managed_by?: string;
};

export default function BuildingsPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const [permissions, setPermissions] = useState({
  create: false,
  view: false,
  edit: false,
  delete: false,
});

useEffect(() => {
  setPermissions({
    create: hasPermission("BUILDING", "create"),
    view: hasPermission("BUILDING", "view"),
    edit: hasPermission("BUILDING", "edit"),
    delete: hasPermission("BUILDING", "delete"),
  });
}, []);
const { create: canCreate, view: canView, edit: canEdit, delete: canDelete } = permissions;

  const columnDefs: ColDef[] = [
    { field: "sio", headerName: "SIO", filter: true },
    { field: "clli", headerName: "CLLI", filter: true },
    { field: "building_name", headerName: "Name",  filter: true },
    { field: "city", headerName: "City" , filter: true},
    { field: "country", headerName: "Country", filter: true },
    { field: "building_status", headerName: "Status" },
    { field: "ownership_type", headerName: "Ownership", filter: true },
    { field: "managed_by", headerName: "Managed By", filter: true }
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/buildings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => { setBuildings(data); console.log(data); })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredBuildings = buildings.filter((b) =>
    b.building_name.toLowerCase().includes(search.toLowerCase())
  );
  function BuildingsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
        </div>
        <div className="h-10 w-64 bg-gray-300 rounded" />
      </div>

      {/* Table */}
      <div className="h-[600px] bg-gray-300 rounded" />
    </div>
  );
}

if(loading){
return <BuildingsSkeleton />;
}

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Left: CRUD */}
        <div className="flex gap-2">
          {canCreate && (
            <button
              className="px-4 py-2 bg-blue-300 text-white rounded"
              onClick={() => router.push("/buildings/create")}
            >
              ➕ Create
            </button>
          )}

          <button className="px-4 py-2 bg-yellow-300 text-white rounded">
            ✏️ Edit
          </button>

          <button className="px-4 py-2 bg-red-300 text-white rounded">
            🗑 Delete
          </button>
        </div>

        {/* Right: Search & Export */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search building..."
            className="border px-3 py-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="px-4 py-2 bg-green-600 text-white rounded">
            ⬇ Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={filteredBuildings}
          columnDefs={columnDefs}
          rowSelection="single"
          animateRows
          onRowClicked={(event) => {
            if (canView) {
              router.push(`/buildings/${event.data.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
