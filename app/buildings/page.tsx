"use client";

import { useEffect, useState } from "react";
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

type Building = {
  id: number;
  sio: string;
  building_name: string;
  wing: string;
  unit_no:string;
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
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [showExportModal, setShowExportModal] = useState(false);
const [selectedColumns, setSelectedColumns] = useState<string[]>(["building_name"]);
const [exportFormat, setExportFormat] = useState("csv");
const [debouncedSearch, setDebouncedSearch] = useState(search);
const [permissions, setPermissions] = useState({
  create: false,
  view: false,
  edit: false,
  delete: false,
});
useEffect(() => {
  setPage(1);
}, [search]);
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
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  if (showExportModal) {
    setSelectedColumns(["building_name"]);
  }
}, [showExportModal]);

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
    {
  field: "building_name",
  headerName: "Name",
  filter: true,
  cellRenderer: (params: any) => {
    return (
      <span
        onClick={() => {
          if (canView) router.push(`/buildings/${params.data.id}`);
        }}
        className="text-black hover:text-blue-600 hover:underline cursor-pointer font-medium transition-colors duration-200"
      >
        {params.value}
      </span>
    );
  },
},
 { field: "wing", headerName: "Wing", filter: true },
  { field: "unit_no", headerName: "Unit No", filter: true },
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
  const allColumnFields = columnDefs
  .map((col) => col.field)
  .filter((field): field is string => Boolean(field));

const allSelected =
  allColumnFields.length > 0 && selectedColumns.length === allColumnFields.length;

const someSelected = selectedColumns.length > 0 && !allSelected;

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  useEffect(() => {
  if (!hasPermission("BUILDING", "view")) {
    router.push("/dashboard");
  }
}, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
 setLoading(true); 
 fetch(`${BASE_URL}/buildings?page=${page}&per_page=10&search=${debouncedSearch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => { 
      setBuildings(data.data);
      setTotalPages(data.last_page);
    })
    .catch(() => router.push("/dashboard"))
    .finally(() => setLoading(false));

}, [page , debouncedSearch]);

  // const filteredBuildings = buildings.filter((b) =>
  //   b.building_name.toLowerCase().includes(search.toLowerCase())
  // );
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

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

const handleExport = async () => {
  if (selectedColumns.length === 0) {
    alert("Select at least one column");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/buildings/export`, {
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

    if (!response.ok) {
      throw new Error("Export failed");
    }

    // 🔥 IMPORTANT: get blob
    const blob = await response.blob();

    // 🔽 download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    let extension = exportFormat;
    if (exportFormat === "csv") extension = "csv";
    if (exportFormat === "pdf") extension = "pdf";
    if (exportFormat === "json") extension = "json";

    a.href = url;
    a.download = `buildings.${extension}`;
    a.click();

    window.URL.revokeObjectURL(url);
    setShowExportModal(false);

  } catch (error) {
    console.error(error);
    alert("Export failed");
  }
};



if(loading){
return <BuildingsSkeleton />;
}

  return (
    
  <div className="flex flex-col h-full overflow-hidden gap-4">
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
  <Tooltip>
    <TooltipTrigger asChild>
      <button
  onClick={() => router.push("/buildings/create")}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-full
             bg-[#2563eb] px-5 text-sm font-semibold text-[#fbfcfe] shadow-md
             transition-all duration-200 hover:bg-[#1d4ed8]
             focus:outline-none focus:ring-2 focus:ring-blue-400/50
             active:scale-95"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
  <span>Create</span>
</button>
    </TooltipTrigger>

    <TooltipContent side="bottom" sideOffset={8}>
      <p>Create building</p>
    </TooltipContent>
  </Tooltip>
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

         <Tooltip>
  <TooltipTrigger asChild>
    <button
      onClick={() => setShowExportModal(true)}
       className="inline-flex h-10 items-center justify-center gap-2 rounded-full
             bg-[#2563eb] px-5 text-sm font-semibold text-[#fbfcfe] shadow-md
             transition-all duration-200 hover:bg-[#1d4ed8]
             focus:outline-none focus:ring-2 focus:ring-blue-400/50
             active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 4v10m0 0l4-4m-4 4l-4-4M4 20h16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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




{/* Table */}
<div className="group relative flex flex-col flex-1 min-h-0 rounded-3xl border-2 border-white/40 bg-white border border-gray-200 shadow-2xl shadow-slate-200/50 hover:shadow-3xl hover:shadow-blue-500/20 overflow-hidden ring-1 ring-white/30 transition-all duration-500">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

  <div className="relative z-10 w-full h-full">
    <AgGridReact
      theme={myTheme}
      rowData={buildings}
      columnDefs={columnDefs}
      rowSelection="single"
      animateRows={true}
      pagination={false}
      rowHeight={52}
      headerHeight={56}
      suppressCellFocus={true}
      suppressRowClickSelection={false}
      overlayNoRowsTemplate="<div class='p-8 text-center'><span class='text-slate-500 text-lg font-medium'>No buildings found</span></div>"
      className="
        [&_.ag-row]:cursor-default
        [&_.ag-theme-quartz]:bg-transparent 
        [&_.ag-theme-quartz]:backdrop-blur-xl
        [&_.ag-theme-quartz]:border-white/30

        [&_.ag-paginator]:bg-gradient-to-r 
        [&_.ag-paginator]:from-white/90 
        [&_.ag-paginator]:to-blue-50/80 
        [&_.ag-paginator]:backdrop-blur-xl 
        [&_.ag-paginator]:border-t 
        [&_.ag-paginator]:border-blue-100 
        [&_.ag-paginator]:px-4 
        [&_.ag-paginator]:py-2 
        [&_.ag-paginator]:rounded-b-3xl

        [&_.ag-paging-button]:rounded-lg 
        [&_.ag-paging-button]:px-3 
        [&_.ag-paging-button]:py-1 
        [&_.ag-paging-button]:mx-1 
        [&_.ag-paging-button]:bg-white 
        [&_.ag-paging-button]:shadow-md 
        [&_.ag-paging-button:hover]:bg-blue-500 
        [&_.ag-paging-button:hover]:text-white 
        [&_.ag-paging-button]:transition-all 
        [&_.ag-paging-button]:duration-200

        [&_.ag-paging-button.ag-disabled]:opacity-40 
        [&_.ag-paging-button.ag-disabled]:cursor-not-allowed

        [&_.ag-paging-page-summary-panel]:text-sm 
        [&_.ag-paging-page-summary-panel]:text-slate-600

        [&_.ag-header]:bg-white/85 [&_.ag-header]:backdrop-blur-xl [&_.ag-header]:border-b-white/50
        [&_.ag-header-cell]:font-semibold [&_.ag-header-cell]:text-slate-800 [&_.ag-header-cell:hover]:bg-blue-50/80

        [&_.ag-row-hover]:bg-gradient-to-r [&_.ag-row-hover]:from-blue-50/60 [&_.ag-row-hover]:to-indigo-50/60
        [&_.ag-row-selected]:bg-gradient-to-r [&_.ag-row-selected]:from-blue-500/10 [&_.ag-row-selected]:to-blue-600/10

        [&_.ag-cell]:backdrop-blur-sm [&_.ag-cell-focus]:ring-2 [&_.ag-cell-focus]:ring-blue-400/50
      
        "
        
    />
  </div>
</div>

{/* pagination — sticky at bottom */}
<div className="flex-shrink-0 flex items-center justify-center gap-3 py-3 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="h-9 px-4 text-sm font-medium rounded-lg
      bg-white text-gray-700 border border-gray-200
      hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
      transition-colors shadow-sm"
  >
    ← Prev
  </button>

  <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="h-9 px-4 text-sm font-medium rounded-lg
      bg-white text-gray-700 border border-gray-200
      hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
      transition-colors shadow-sm"
  >
    Next →
  </button>
</div>

{showExportModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-700
      rounded-2xl p-6 w-[420px] shadow-2xl space-y-5
    ">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Export Buildings
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
        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-800 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <span>Select All</span>
    </label>
  </div>

  <div className="grid grid-cols-2 gap-y-2 gap-x-3 max-h-48 overflow-y-auto
    pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
    {columnDefs.map((col) => {
      const field = col.field as string;

      return (
        <label
          key={field}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300
            cursor-pointer select-none group"
        >
          <input
            type="checkbox"
            checked={selectedColumns.includes(field)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600
              text-blue-600 bg-white dark:bg-gray-800
              focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            onChange={(e) => {
              setSelectedColumns((prev) =>
                e.target.checked
                  ? prev.includes(field)
                    ? prev
                    : [...prev, field]
                  : prev.filter((c) => c !== field)
              );
            }}
          />
          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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

      {/* Format Selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Export Format
        </p>
        <select
          className="w-full h-10 px-3 rounded-lg text-sm
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            border border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-400
            transition-colors"
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
          className="h-9 px-4 text-sm font-medium rounded-lg
            text-gray-700 dark:text-gray-300
            bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            border border-gray-200 dark:border-gray-700
            transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          className="h-9 px-5 text-sm font-semibold rounded-lg
            text-white bg-green-600 hover:bg-green-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors shadow-sm"
          disabled={selectedColumns.length === 0}
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
