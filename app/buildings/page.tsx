"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Building = {
  id: number;
  building_name: string;
  address_1:string;
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
  const canCreate = hasPermission("BUILDING", "create");
  const canView = hasPermission("BUILDING", "view");
const canEdit   = hasPermission("BUILDING", "edit");
const canDelete = hasPermission("BUILDING", "delete");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/buildings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
  .then((data) => {setBuildings(data); console.log(data);})
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredBuildings = buildings.filter((b) =>
    b.building_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Left: CRUD */}
        <div className="flex gap-2">
           {canCreate && (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => router.push("/buildings/create")}
    >
      ➕ Create
    </button>
  )}

          <button className="px-4 py-2 bg-yellow-500 text-white rounded">
            ✏️ Edit
          </button>

          <button className="px-4 py-2 bg-red-600 text-white rounded">
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
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border" >SIO</th>
              <th className="p-3 border">CLLI</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Address</th>
              <th className="p-3 border">Additional-Details</th>
              <th className="p-3 border">Ownership</th>
              <th className="p-3 border">Managed By</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {/* 🔹 Skeleton Loader */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="p-3 border">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}

            {/* 🔹 Actual Data */}
            {!loading &&
              filteredBuildings.map((building) => (
                <tr
                  key={building.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
    if (canView) {
      router.push(`/buildings/${building.id}`);
    }
  }}
                >
                  <td className="p-3 border font-medium">
                    {building.sio}
                  </td>
                  <td className="p-3 border font-medium">
                    {building.clli}
                  </td>
                  <td className="p-3 border font-medium">
                    {building.building_name}
                  </td>
                  <td className="p-3 border">{building.address_1|| ""},<br/>{building.city || "-"} {building.zip_code|| "-"},<br/>{building.country || "-"}

                  </td>
                  <td className="p-3 border">Property Type : {building.building_type || "-"} <br/>
                    Construction Year : {building.construction_year || "-"}<br/> 
                    Rentable Area : {building.building_rentable_area || "-"} <br/>{building.building_measure_units || "-"} <br/>
                    Purchas Price: {building.purchase_price || "-"} {building.currency_type || "-"} <br/> 
                    Last Renovation Year : {building.last_renovation_year || "Not Renoveted"}
                  </td>
                  <td className="p-3 border">
                    {building.managed_by || "-"}
                  </td>
                  <td className="p-3 border">
                    {building.ownership_type || "-"}
                  </td>
                  <td className="p-3 border">
                    {building.building_status || "-"}
                  </td>
                </tr>
              ))}

            {/* 🔹 No Data State */}
            {!loading && filteredBuildings.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No buildings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
