"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

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
};

export default function LeasesPage() {
  const router = useRouter();

  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔐 Permissions
  const canCreate = hasPermission("LEASE", "create");
  const canView   = hasPermission("LEASE", "view");
  const canEdit   = hasPermission("LEASE", "edit");
  const canDelete = hasPermission("LEASE", "delete");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/leases", {
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

        {/* Right: Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search tenant / landlord..."
            className="border px-3 py-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Tenant</th>
              <th className="p-3 border">Landlord</th>
              <th className="p-3 border">Lease Type</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Rent Area</th>
              <th className="p-3 border">Commencement</th>
              <th className="p-3 border">Termination</th>
            </tr>
          </thead>

          <tbody>
            {/* 🔹 Skeleton Loader */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="p-3 border">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}

            {/* 🔹 Data Rows */}
            {!loading &&
              filteredLeases.map((lease) => (
                <tr
                  key={lease.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    if (canView) {
                      router.push(`/leases/${lease.id}`);
                    }
                  }}
                >
                  <td className="p-3 border font-medium">
                    {lease.tenant_legal_name || "-"}
                  </td>
                  <td className="p-3 border">
                    {lease.landlord_legal_name || "-"}
                  </td>
                  <td className="p-3 border">
                    {lease.lease_type || "-"}
                  </td>
                  <td className="p-3 border">
                    {lease.lease_status || "-"}
                  </td>
                  <td className="p-3 border">
                    {lease.lease_rentable_area || "-"}{" "}
                    {lease.measure_units || ""}
                  </td>
                  <td className="p-3 border">
                    {lease.rent_commencement_date || "-"}
                  </td>
                  <td className="p-3 border">
                    {lease.termination_date || "-"}
                  </td>
                </tr>
              ))}

            {/* 🔹 No Data */}
            {!loading && filteredLeases.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No leases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
