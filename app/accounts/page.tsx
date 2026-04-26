"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ReceiptText,
  Wallet,
  AlertCircle,
  Eye,
} from "lucide-react";
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
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [canCreate, setCanCreate] = useState(false);
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [page, setPage] = useState(1);
const [perPage] = useState(10);
const [totalPages, setTotalPages] = useState(1);

const [debouncedSearch, setDebouncedSearch] = useState(search);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1); // reset page on search
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

  useEffect(() => {
    setMounted(true);
    setCanCreate(hasPermission("EXPENSE", "create"));
    setCanView(hasPermission("EXPENSE", "view"));
    setCanEdit(hasPermission("EXPENSE", "edit"));
    setCanDelete(hasPermission("EXPENSE", "delete"));
  }, []);

 const fetchExpenses = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(
      `${BASE_URL}/expenses?page=${page}&per_page=${perPage}&search=${debouncedSearch}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    console.log(data);
    setExpenses(data.data);        // ✅ FIXED
    setTotalPages(data.last_page); // ✅ OK

  } catch {
    router.push("/dashboard");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (!mounted) return;
  fetchExpenses();
}, [mounted, page, debouncedSearch]);


const totalAmount = useMemo(() => {
  if (!Array.isArray(expenses)) return 0;

  return expenses.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);
}, [expenses]);

const pendingCount = useMemo(() => {
  return expenses.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;
}, [expenses]);

  const myTheme = themeQuartz.withParams({
    backgroundColor: "transparent",
    foregroundColor: "#0f172a",
    headerBackgroundColor: "#eef4ff",
    headerTextColor: "#1e3a8a",
    borderColor: "rgba(148, 163, 184, 0.22)",
    spacing: 10,
    rowHoverColor: "rgba(59, 130, 246, 0.08)",
    selectedRowBackgroundColor: "rgba(59, 130, 246, 0.12)",
    wrapperBorderRadius: 18,
    headerColumnResizeHandleColor: "#60a5fa",
  });

  const columnDefs: ColDef[] = [
    {
      field: "expense_id",
      headerName: "ID",
      filter: true,
      minWidth: 90,
    },
    {
      field: "expense_year",
      headerName: "Year",
      filter: true,
      minWidth: 110,
    },
    {
      field: "expense_period",
      headerName: "Period",
      filter: true,
      minWidth: 130,
    },
    {
      field: "expense_category",
      headerName: "Category",
      filter: true,
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "Amount",
      minWidth: 160,
      valueGetter: (params) =>
        `${params.data.amount || "-"} ${params.data.currency || ""}`,
      cellClass: "font-semibold tabular-nums",
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      filter: true,
      minWidth: 140,
      cellRenderer: (params: { value?: string }) => {
        const value = params.value || "Unknown";
        const status = value.toLowerCase();

        const styles =
          status === "paid"
            ? "bg-emerald-500/15 text-emerald-700 border-emerald-400/20"
            : status === "pending"
            ? "bg-amber-500/15 text-amber-700 border-amber-400/20"
            : status === "overdue"
            ? "bg-rose-500/15 text-rose-700 border-rose-400/20"
            : "bg-slate-500/10 text-slate-700 border-slate-400/20";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${styles}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      headerName: "Open",
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: Expense }) =>
        canView ? (
          <button
            onClick={() => router.push(`/accounts/${params.data.expense_id}`)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  if (!mounted) return null;
  if (loading) return <AccountsSkeleton />;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <ReceiptText className="h-3.5 w-3.5" />
              Accounts Ledger
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Expense management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review, search, and manage all recorded expense entries.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Visible records
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {expenses.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total expenses"
          value={`${totalAmount.toLocaleString()} INR`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Pending"
          value={pendingCount.toString()}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatCard
          title="All entries"
          value={expenses.length.toString()}
          icon={<ReceiptText className="h-5 w-5" />}
        />
      </section>

      <section className="rounded-[28px] border border-white/20 bg-white/70 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <button
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                onClick={() => router.push("/accounts/create")}
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            )}

            {canEdit && (
              <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-100">
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}

            {canDelete && (
              <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}

            <button
              onClick={fetchExpenses}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses (category, type, vendor, amount...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-11 pr-4 text-sm text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-white/20 bg-white/75 shadow-[0_16px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        {expenses.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full border border-slate-200 bg-slate-50 p-4">
              <ReceiptText className="h-8 w-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              No expenses found
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Try a different search term or create a new expense record.
            </p>
            {canCreate && (
              <button
                onClick={() => router.push("/accounts/create")}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create expense
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              height: "560px",
              width: "100%",
              "--ag-font-size": "14px",
              "--ag-font-family": "Inter, ui-sans-serif, system-ui, sans-serif",
              "--ag-row-border-color": "rgba(148, 163, 184, 0.14)",
              "--ag-cell-horizontal-padding": "16px",
              "--ag-header-height": "52px",
              "--ag-row-height": "54px",
              "--ag-wrapper-border-radius": "24px",
              "--ag-odd-row-background-color": "rgba(255,255,255,0.88)",
              "--ag-even-row-background-color": "rgba(248,250,252,0.82)",
            } as React.CSSProperties}
            className="ag-premium"
          >
            <AgGridReact
              theme={myTheme}
              pagination={false}   
              rowData={expenses}
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
        )}
      </section>
            <div className="flex justify-center gap-4 mt-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-4 py-2 bg-gray-200 rounded"
  >
    Prev
  </button>

  <span>Page {page} of {totalPages}</span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-4 py-2 bg-gray-200 rounded"
  >
    Next
  </button>
</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/20 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-3 inline-flex rounded-2xl border border-slate-200/70 bg-slate-50 p-2 text-slate-700">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

function AccountsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[28px] border border-slate-200/60 bg-white/70 p-5">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[24px] border border-slate-200/60 bg-white/70 p-4"
          >
            <div className="h-10 w-10 rounded-2xl bg-slate-200" />
            <div className="mt-4 h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200/60 bg-white/70 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:justify-between">
          <div className="flex gap-2">
            <div className="h-11 w-28 rounded-2xl bg-slate-200" />
            <div className="h-11 w-24 rounded-2xl bg-slate-200" />
            <div className="h-11 w-24 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-11 w-full rounded-2xl bg-slate-200 xl:w-80" />
        </div>
      </div>

      <div className="h-[560px] rounded-[32px] border border-slate-200/60 bg-white/70" />
    </div>
  );
}