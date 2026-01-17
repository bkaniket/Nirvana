"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

  type Expense = {
  expense_id: number;
  lease_id?: number | null;
  building_id?: number | null;
  expense_year?: string;
  expense_period?: string;
  expense_category?: string;
  expense_type?: string | null;
  amount?: string;
  currency?: string;
  status?: string;
  note?: string | null;
};

export default function AccountsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [canCreate, setCanCreate] = useState(false);
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  /* ✅ Permissions – client only */
  useEffect(() => {
    setMounted(true);
    setCanCreate(hasPermission("EXPENSE", "create"));
    setCanView(hasPermission("EXPENSE", "view"));
    setCanEdit(hasPermission("EXPENSE", "edit"));
    setCanDelete(hasPermission("EXPENSE", "delete"));
  }, []);

  /* ✅ Fetch data */
  useEffect(() => {
    if (!mounted) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/expenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
  console.log("API EXPENSES:", data);
  setExpenses(data);
})
      
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [mounted, router]);

  if (!mounted) return null; // 🔥 hydration fix

const filteredExpenses = expenses.filter((e) =>
  `${e.expense_category} ${e.expense_year} ${e.status}`
    .toLowerCase()
    .includes(search.toLowerCase())
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
              onClick={() => router.push("/accounts/create")}
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
            placeholder="Search expense..."
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
    <th className="p-3 border">ID</th>
    <th className="p-3 border">Year</th>
    <th className="p-3 border">Period</th>
    <th className="p-3 border">Category</th>
    <th className="p-3 border">Amount</th>
    <th className="p-3 border">Status</th>
  </tr>
</thead>

          <tbody>
            {/* Skeleton */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-3 border">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}

            {/* Data */}
            {!loading &&
              filteredExpenses.map((expense) => (
<tr
  key={expense.expense_id}
  className="hover:bg-gray-100 cursor-pointer"
  onClick={() => canView && router.push(`/accounts/${expense.expense_id}`)}
>
  <td className="p-3 border font-medium">
    {expense.expense_id}
  </td>
  <td className="p-3 border">
    {expense.expense_year || "-"}
  </td>
  <td className="p-3 border">
    {expense.expense_period || "-"}
  </td>
  <td className="p-3 border">
    {expense.expense_category || "-"}
  </td>
  <td className="p-3 border">
    {expense.amount} {expense.currency}
  </td>
  <td className="p-3 border">
    {expense.status || "-"}
  </td>
</tr>

              ))}

            {/* No data */}
            {!loading && filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
