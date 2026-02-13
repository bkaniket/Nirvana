"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import "@/src/lib/ag-grid-setup";

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
  
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  /* ✅ Permissions – client only */
  useEffect(() => {
    setMounted(true);
    setCanCreate(hasPermission("EXPENSE", "create"));
    setCanView(hasPermission("EXPENSE", "view"));
    setCanEdit(hasPermission("EXPENSE", "edit"));
    setCanDelete(hasPermission("EXPENSE", "delete"));
  }, []);

  const myTheme = themeQuartz.withParams({
  backgroundColor: "#f8f9fa",
  foregroundColor: "#1f2937",
  headerBackgroundColor: "#dbeafe",
  headerTextColor: "#1e3a8a",
  borderColor: "#e5e7eb",
  spacing: 8,
  rowHoverColor: "#e0f2fe",
});
const columnDefs: ColDef[] = [
  { field: "expense_id", headerName: "ID", filter: true },
  { field: "expense_year", headerName: "Year", filter: true },
  { field: "expense_period", headerName: "Period", filter: true },
  { field: "expense_category", headerName: "Category", filter: true },
  {
    headerName: "Amount",
    valueGetter: (params) =>
      `${params.data.amount || "-"} ${params.data.currency || ""}`,
    filter: true,
  },
  { field: "status", headerName: "Status", filter: true },
];
  /* ✅ Fetch data */
  useEffect(() => {
    if (!mounted) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/expenses`, {
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
  if (loading) {
  return <AccountsSkeleton />;
}

  const filteredExpenses = expenses.filter((expense) =>
    JSON.stringify(expense).toLowerCase().includes(search.toLowerCase())
  );

  
  function AccountsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-24 bg-gray-300 rounded" />
        </div>
        <div className="h-10 w-64 bg-gray-300 rounded" />
      </div>

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
    rowData={filteredExpenses}
    columnDefs={columnDefs}
    rowSelection="single"
    animateRows
    onRowClicked={(event) => {
      if (canView) {
        router.push(`/accounts/${event.data.expense_id}`);
      }
    }}
  />
</div>
    </div>
  );
}
