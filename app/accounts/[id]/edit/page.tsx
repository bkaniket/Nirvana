"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export default function AccountEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEdit = hasPermission("EXPENSE", "edit");

  /* 🔐 Permission Guard */
  useEffect(() => {
    if (!canEdit) {
      router.push("/accounts");
    }
  }, [canEdit, router]);

  /* 📥 Fetch Expense */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
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

  /* 💾 Update Expense */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = sessionStorage.getItem("token");

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

  if (loading) {
    return <p className="text-gray-500">Loading expense...</p>;
  }

  if (!expense) {
    return <p className="text-red-500">Expense not found</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Edit Expense</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow"
      >
        <Input
          label="Expense Year"
          value={expense.expense_year}
          onChange={(v) =>
            setExpense({ ...expense, expense_year: v })
          }
        />

        <Input
          label="Expense Period"
          value={expense.expense_period}
          onChange={(v) =>
            setExpense({ ...expense, expense_period: v })
          }
        />

        <Input
          label="Category"
          value={expense.expense_category}
          onChange={(v) =>
            setExpense({ ...expense, expense_category: v })
          }
        />

        <Input
          label="Type"
          value={expense.expense_type}
          onChange={(v) =>
            setExpense({ ...expense, expense_type: v })
          }
        />

        <Input
          label="Amount"
          value={expense.amount}
          onChange={(v) =>
            setExpense({ ...expense, amount: v })
          }
        />

        <Input
          label="Currency"
          value={expense.currency}
          onChange={(v) =>
            setExpense({ ...expense, currency: v })
          }
        />

        {/* <Textarea
          label="Note"
          value={expense.note}
          onChange={(v) =>
            setExpense({ ...expense, note: v })
          }
        /> */}

        <div className="col-span-2 flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            {saving ? "Saving..." : "Update Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* 🔹 Inputs */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <input
        className="w-full border px-3 py-2 rounded"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="col-span-2">
      <p className="text-sm text-gray-500">{label}</p>
      <textarea
        rows={3}
        className="w-full border px-3 py-2 rounded"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
