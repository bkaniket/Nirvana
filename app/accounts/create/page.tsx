"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import {
  ArrowLeft,
  CalendarRange,
  CircleDollarSign,
  FileText,
  Layers3,
  Save,
} from "lucide-react";

export default function CreateExpensePage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const canCreate = hasPermission("EXPENSE", "create");

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    expense_year: "",
    expense_period: "",
    expense_category: "",
    amount: "",
    currency: "USD",
    status: "Active",
  });

  useEffect(() => {
    if (!canCreate) router.replace("/accounts");
  }, [canCreate, router]);

  const isValid = useMemo(() => {
    return (
      form.expense_year.trim() &&
      form.expense_period.trim() &&
      form.expense_category.trim() &&
      form.amount.trim() &&
      form.currency.trim() &&
      form.status.trim()
    );
  }, [form]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isValid) return;

    try {
      setSubmitting(true);

      await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      router.push("/accounts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-4 space-y-4 max-w-4xl sm:mx-6 lg:mx-auto lg:max-w-5xl">
      {/* Header - tighter */}
      <section className="rounded-[28px] border border-white/20 bg-white/70 p-4 md:p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              onClick={() => router.push("/accounts")}
              className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to accounts
            </button>

            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Layers3 className="h-3.5 w-3.5" />
              Expense workflow
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create expense
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Add a new expense record with period, category, amount, and status.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2.5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Default currency
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {form.currency}
            </p>
          </div>
        </div>
      </section>

      {/* Form - tight */}
      <section className="rounded-[32px] border border-white/20 bg-white/75 p-4 md:p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-2.5 text-slate-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Expense details
            </h2>
            <p className="text-sm text-slate-600">
              Fill in the required information before saving.
            </p>
          </div>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Expense year" hint="Example: 2026">
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="Enter year"
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                value={form.expense_year}
                onChange={(e) => updateField("expense_year", e.target.value)}
              />
            </div>
          </Field>

          <Field label="Expense period" hint="Choose the reporting period">
            <select
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              value={form.expense_period}
              onChange={(e) => updateField("expense_period", e.target.value)}
            >
              <option value="">Select period</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </Field>

          <Field label="Expense category" hint="Classify the expense type">
            <select
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              value={form.expense_category}
              onChange={(e) => updateField("expense_category", e.target.value)}
            >
              <option value="">Select category</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Utilities">Utilities</option>
              <option value="Rent">Rent</option>
              <option value="Tax">Tax</option>
              <option value="Insurance">Insurance</option>
              <option value="Operations">Operations</option>
            </select>
          </Field>

          <Field label="Amount" hint="Enter the total expense amount">
            <div className="relative">
              <CircleDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="0.00"
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
              />
            </div>
          </Field>

          <Field label="Currency" hint="Default is USD">
            <select
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
            </select>
          </Field>

          <Field label="Status" hint="Set the current record state">
            <div className="flex flex-wrap gap-2">
              {["Active", "Pending", "Closed"].map((item) => {
                const active = form.status === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("status", item)}
                    className={[
                      "h-11 rounded-2xl border px-3.5 text-sm font-medium transition",
                      active
                        ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/accounts")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isValid || submitting}
            onClick={submit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving..." : "Save expense"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}