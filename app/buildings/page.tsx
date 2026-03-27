"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import "@/src/lib/ag-grid-setup";

type Building = {
  id: number;
  sio: string;
  building_name: string;
  address_1: string;
  city?: string;
  zip_code?: string;
  country?: string;
  state?: string;
  clli?: string;
  ownership_type?: string;
  building_type?: string;
  building_rentable_area?: string;
  building_measure_units?: string;
  
purchase_price?: string;
currency_type?: string;
latitude?: string;
longitude?: string;
geocode_latitude?: string;
geocode_longitude?: string;
  building_status?: string;
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
const myTheme = themeQuartz.withParams({
  // 🌿 Main grid background (off-white)
  backgroundColor: "#f8f9fa",

  // 📝 Text color
  foregroundColor: "#1f2937",

  // 🔷 Header background (light blue)
  headerBackgroundColor: "#dbeafe",

  // 🔹 Header text color
  headerTextColor: "#1e3a8a",

  // 🔲 Borders
  borderColor: "#e5e7eb",

  // 📏 Spacing
  spacing: 8,

  // 🔄 Alternate row color
  rowHoverColor: "#e0f2fe",
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
    // { field: "sio", headerName: "SIO", filter: true },
    { field: "building_name", headerName: "Name",  filter: true },
    { field: "address_1", headerName: "Address", filter: true },
    { field: "city", headerName: "City" , filter: true},
    { field: "state", headerName: "State" , filter: true},
    { field: "zip_code", headerName: "Zip Code", filter: true },
    { field: "country", headerName: "Country", filter: true },
    // { field: "clli", headerName: "CLLI", filter: true },
    { field: "ownership_type", headerName: "Ownership", filter: true },
    { field: "building_type", headerName: "Building Type", filter: true },
    { field: "building_rentable_area", headerName: "Rentable Area", filter: true },
    { field: "purchase_price", headerName: "Purchase Price", filter: true },
    { field: "currency_type", headerName: "Currency Type", filter: true },
    { field: "latitude", headerName: "Latitude", filter: true },
    { field: "longitude", headerName: "Longitude", filter: true },
    { field: "geocode_latitude", headerName: "Geocode Latitude", filter: true },
    { field: "geocode_longitude", headerName: "Geocode Longitude", filter: true },

  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  useEffect(() => {
  if (!hasPermission("BUILDING", "view")) {
    router.push("/dashboard");
  }
}, []);
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
    <div className="space-y-6 animate-pulse">

      {/* Header Skeleton */}
      <div className="flex justify-between items-center 
      px-6 py-4 rounded-2xl 
      bg-white/50 backdrop-blur-xl border border-white/30 shadow-md">

        <div className="flex items-center gap-4">
          <div className="h-10 w-40 bg-gray-300/60 rounded-xl" />
          <div className="h-10 w-28 bg-gray-300/60 rounded-full" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 w-80 bg-gray-300/60 rounded-2xl" />
          <div className="h-11 w-36 bg-gray-300/60 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl border border-white/30 
      bg-white/50 backdrop-blur-xl shadow-lg p-4 space-y-4">

        {/* Header Row */}
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-300/60 rounded" />
          ))}
        </div>

        {/* Rows */}
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

if(loading){
return <BuildingsSkeleton />;
}

  return (
    <div className="space-y-6">
      {/* Header */}
     <div className="relative flex justify-between items-center 
px-6 py-4 rounded-2xl 
bg-white border border-gray-200 border border-white/40 
shadow-xl shadow-slate-200/40 
ring-1 ring-white/40 overflow-hidden">

  {/* Glow Effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 opacity-70" />

  <div className="relative flex justify-between items-center w-full">
  
        {/* Left: CRUD */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col mr-4">
  <h1 className="text-lg font-semibold tracking-tight text-slate-800 tracking-tight">
    Buildings
  </h1>
  <p className="text-xs text-slate-500">
    Manage and monitor all properties
  </p>
</div>
          {canCreate && (
            <button
  onClick={() => router.push("/buildings/create")}
  className="flex items-center px-5 py-2.5 
  bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 
  text-white font-semibold text-sm rounded-full 
  shadow-lg hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 
  focus:outline-none focus:ring-2 focus:ring-blue-300 
  active:scale-95 transform hover:scale-105 
  transition duration-300 ease-in-out"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 mr-2 animate-pulse"
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

          {/* <button className="px-4 py-2 bg-yellow-300 text-white rounded">
            ✏️ Edit
          </button>

          <button className="px-4 py-2 bg-red-300 text-white rounded">
            🗑 Delete
          </button> */}
        </div>

        {/* Right: Search + Export */}
  <div className="flex items-center gap-3 z-10">

{/* Search */}
    <div className="relative">
      <input
        type="text"
        placeholder="Search buildings..."
        className="w-80 h-12 pl-12 pr-4 
bg-white text-black
border border-gray-300
rounded-2xl shadow-md
focus:outline-none focus:ring-2 focus:ring-blue-400
placeholder-gray-500
transition-all duration-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

          <button
  className="relative w-36 h-10 flex items-center border border-green-500 
  bg-green-500 rounded-lg group overflow-hidden"
>
  <span
    className="text-white font-semibold ml-6 
    transform group-hover:translate-x-16 transition-all duration-300"
  >
    Export
  </span>

  <span
    className="absolute right-0 h-full w-10 bg-green-600 
    flex items-center justify-center 
    group-hover:w-full transition-all duration-300"
  >
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
</button>

        </div>
      </div>
</div>




      {/* Table */}
   {/* Premium Glass Table */}
<div className="group relative rounded-3xl border-2 border-white/40 bg-white border border-gray-200 shadow-2xl shadow-slate-200/50 hover:shadow-3xl hover:shadow-blue-500/20 overflow-hidden ring-1 ring-white/30 transition-all duration-500">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
  
  <div className="relative z-10 h-[580px] w-full">
    <AgGridReact
      theme={myTheme}
      rowData={filteredBuildings}
      columnDefs={columnDefs}
      rowSelection="single"
      animateRows={true}
      
      paginationPageSizeSelector={[10, 25, 50, 100]}
      paginationPageSize={10}
      
      rowHeight={52}
      headerHeight={56}
      
      suppressCellFocus={true}
      suppressRowClickSelection={false}
      
      overlayNoRowsTemplate="<div class='p-8 text-center'><span class='text-slate-500 text-lg font-medium'>No buildings found</span></div>"
      
      className="
        [&_.ag-theme-quartz]:bg-transparent 
        [&_.ag-theme-quartz]:backdrop-blur-xl
        [&_.ag-theme-quartz]:border-white/30
        
        /* Pagination */
        [&_.ag-paginator]:bg-white/80 [&_.ag-paginator]:backdrop-blur-xl [&_.ag-paginator]:border-t-white/40
        [&_.ag-paginator-button]:bg-white/90 [&_.ag-paginator-button:hover]:bg-white/100 [&_.ag-paginator-button]:backdrop-blur-md [&_.ag-paginator-button]:shadow-md [&_.ag-paginator-button:hover]:shadow-lg
        [&_.ag-select-list]:bg-white/95 [&_.ag-select-list]:backdrop-blur-2xl [&_.ag-select-list]:border-white/50 [&_.ag-select-list]:shadow-2xl [&_.ag-select-list]:rounded-2xl
        
        /* Headers */
        [&_.ag-header]:bg-white/85 [&_.ag-header]:backdrop-blur-xl [&_.ag-header]:border-b-white/50
        [&_.ag-header-cell]:font-semibold [&_.ag-header-cell]:text-slate-800 [&_.ag-header-cell:hover]:bg-blue-50/80
        
        /* Rows */
        [&_.ag-row-hover]:bg-gradient-to-r [&_.ag-row-hover]:from-blue-50/60 [&_.ag-row-hover]:to-indigo-50/60
        [&_.ag-row-selected]:bg-gradient-to-r [&_.ag-row-selected]:from-blue-500/10 [&_.ag-row-selected]:to-blue-600/10
        
        /* Cells */
        [&_.ag-cell]:backdrop-blur-sm [&_.ag-cell-focus]:ring-2 [&_.ag-cell-focus]:ring-blue-400/50
      "
      
      onRowClicked={(event) => {
        if (canView) router.push(`/buildings/${event.data.id}`);
      }}
    />
  </div>
</div>
    </div>
  );
}
