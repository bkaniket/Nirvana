"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarRange,
  FileText,
  Layers3,
  Save,
  ShieldCheck,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

type Expense = {
  expense_id?: number;
  lease_id?: number | null;
  building_id?: number | null;
  expense_name?: string;
  expense_year?: string;
  expense_period?: string;
  expense_category?: string;
  expense_type?: string | null;
  amount?: string;
  currency?: string;
  status?: string;
  note?: string | null;
};

export default function AccountEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEdit = hasPermission("EXPENSE", "edit");

  useEffect(() => {
    if (!canEdit) {
      router.push("/accounts");
    }
  }, [canEdit, router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setExpense(data.expense);
      })
      .catch(() => router.push("/accounts"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expense),
      });

      if (!res.ok) throw new Error("Update failed");

      router.push(`/accounts/${id}`);
    } catch {
      alert("Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  const statusTone = useMemo(() => {
    const status = expense?.status?.toLowerCase();

    if (status === "paid") {
      return "border-emerald-300/60 bg-emerald-50 text-emerald-700";
    }
    if (status === "pending") {
      return "border-amber-300/60 bg-amber-50 text-amber-700";
    }
    if (status === "overdue") {
      return "border-rose-300/60 bg-rose-50 text-rose-700";
    }

    return "border-slate-300/60 bg-slate-50 text-slate-700";
  }, [expense?.status]);

  if (loading) {
    return <AccountEditSkeleton />;
  }

  if (!expense) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-slate-200/70 bg-white/70 px-6 text-center shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-4 rounded-full border border-slate-200 bg-slate-50 p-4">
          <FileText className="h-8 w-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Expense not found
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          The expense you are trying to edit does not exist or is no longer available.
        </p>
        <button
          onClick={() => router.push("/accounts")}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-28">
      <section className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Expense Editor
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Edit Expense #{expense.expense_id}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Update financial details, category information, and notes for this expense record.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Status
              </p>
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusTone}`}
              >
                {expense.status || "Unknown"}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Currency
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {expense.currency || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[32px] border border-white/20 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-2.5 text-slate-700">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Basic details
              </h2>
              <p className="text-sm text-slate-600">
                Core classification and period information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Expense Name"
              hint="Name of Expense"
              icon={<CalendarRange className="h-4 w-4" />}
              value={expense.expense_name}
              onChange={(v) => setExpense({ ...expense, expense_name: v })}
            />

            <Input
              label="Expense year"
              hint="Accounting year for this record"
              icon={<CalendarRange className="h-4 w-4" />}
              value={expense.expense_year}
              onChange={(v) => setExpense({ ...expense, expense_year: v })}
            />

            <Input
              label="Expense period"
              hint="Month, quarter, or custom period"
              icon={<CalendarRange className="h-4 w-4" />}
              value={expense.expense_period}
              onChange={(v) => setExpense({ ...expense, expense_period: v })}
            />

            <Input
              label="Category"
              hint="Utility, maintenance, tax, insurance, etc."
              icon={<Layers3 className="h-4 w-4" />}
              value={expense.expense_category}
              onChange={(v) => setExpense({ ...expense, expense_category: v })}
            />

            <Input
              label="Type"
              hint="Fixed, recurring, variable, or custom"
              icon={<Layers3 className="h-4 w-4" />}
              value={expense.expense_type || ""}
              onChange={(v) => setExpense({ ...expense, expense_type: v })}
            />
          </div>
        </section>

        <section className="rounded-[32px] border border-white/20 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-2.5 text-slate-700">
              <BadgeIndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Financial details
              </h2>
              <p className="text-sm text-slate-600">
                Amount, currency, and additional note information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Amount"
              hint="Enter the payable or recorded value"
              icon={<BadgeIndianRupee className="h-4 w-4" />}
              value={expense.amount}
              onChange={(v) => setExpense({ ...expense, amount: v })}
            />

            <Input
              label="Currency"
              hint="INR, USD, AED, etc."
              icon={<BadgeIndianRupee className="h-4 w-4" />}
              value={expense.currency}
              onChange={(v) => setExpense({ ...expense, currency: v })}
            />

            <Textarea
              label="Note"
              hint="Optional internal note for this expense"
              value={expense.note || ""}
              onChange={(v) => setExpense({ ...expense, note: v })}
            />
          </div>
        </section>

        <div className="sticky bottom-4 z-20">
          <div className="flex flex-col gap-3 rounded-[24px] border border-white/20 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Ready to save changes
              </p>
              <p className="text-xs text-slate-600">
                Review the fields before updating this expense.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-sm font-medium text-white shadow-[0_10px_25px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Update Expense"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  hint,
  value,
  onChange,
  icon,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>

      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        ) : null}

        <input
          className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.12)]"
          style={{ paddingLeft: icon ? "2.6rem" : "1rem" }}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function Textarea({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>

      <textarea
        rows={4}
        className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.12)]"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AccountEditSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
      <div className="rounded-[28px] border border-slate-200/60 bg-white/70 p-5">
        <div className="h-10 w-24 rounded-2xl bg-slate-200" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
      </div>

      <div className="rounded-[32px] border border-slate-200/60 bg-white/70 p-6">
        <div className="mb-6 h-6 w-40 rounded bg-slate-200" />
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-12 w-full rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200/60 bg-white/70 p-6">
        <div className="mb-6 h-6 w-44 rounded bg-slate-200" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-12 w-full rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-12 w-full rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-28 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}