"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type WorkflowItem = {
  id: number;
  status: "CREATED" | "UPDATED" | "APPROVED" | "REJECTED";
  entity_type: "BUILDING" | "LEASE" | "EXPENSE";
  entity_name: string | number | null;
  user: string | null;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  CREATED: "bg-blue-100 text-blue-800",
  UPDATED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function WorkflowListPage() {
  const router = useRouter();
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const canView = hasPermission("WORKFLOW", "view");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

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
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  if (!canView) {
    router.replace("/dashboard");
    return;
  }

  setLoading(true);

  fetch(
    `${BASE_URL}/workflow/pending?page=${page}&per_page=10&search=${debouncedSearch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load workflow");
      return res.json();
    })
    .then((data) => {
          setItems(data?.data || []);
          setTotalPages(data?.last_page || 1);  
    })
    .catch(() => alert("Failed to load workflow requests"))
    .finally(() => setLoading(false));
}, [page, debouncedSearch, canView, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex justify-between items-center">
  <h1 className="text-2xl font-bold">Workflow Approvals</h1>

  <input
    type="text"
    placeholder="Search workflow..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg w-80"
  />
</div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              {/* <th className="p-3 border text-left">ID</th> */}

              <th className="p-3 border text-left">Entity</th>
              <th className="p-3 border text-left">Type</th>
              <th className="p-3 border text-left">Status</th>
              <th className="p-3 border text-left">Requested By</th>
              <th className="p-3 border text-left">Requested At</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-3 border">
                      <div className="h-4 bg-gray-300 rounded" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Data */}
            {!loading &&
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/workflow/${item.id}`)}
                >
                  {/* <td className="p-3 border font-medium">
                    #{item.id}
                  </td> */}

                  <td className="p-3 border">
                    {item.entity_name ?? "-"}
                  </td>

                  <td className="p-3 border">
                    {item.entity_type}
                  </td>

                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        statusStyles[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3 border">
                    {item.user ?? "System"}
                  </td>

                  <td className="p-3 border">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

            {/* Empty */}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No workflow requests 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center gap-4 mt-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-4 py-2 bg-gray-200 rounded"
  >
    Prev
  </button>

  <span>
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-4 py-2 bg-gray-200 rounded"
  >
    Next
  </button>
</div>
      </div>
    </div>
  );
}
