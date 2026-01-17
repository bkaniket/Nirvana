"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Expense = {
  expense_id: number;
  expense_category?: string;
  expense_type?: string;
  expense_year?: string;
  expense_period?: string;
  amount?: string;
  currency?: string;
  status?: string;
  note?: string;
  is_escalable?: string;
};

type WorkflowUser = {
  name: string;
  created_at?: string;
  approved_at?: string;
};

type WorkflowInfo = {
  status: "APPROVED" | "PENDING";
  created_by?: WorkflowUser;
  approved_by?: WorkflowUser | string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export default function AccountDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = hasPermission("EXPENSE", "edit");

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
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("Expense details:", data);
        setExpense(data.expense);
        setWorkflow(data.workflow);
      })
      .catch(() => router.push("/accounts"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <p className="text-gray-500">Loading expense details...</p>;
  }

  if (!expense) {
    return <p className="text-red-500">Expense not found</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Expense Details</h1>

        {canEdit && workflow?.status !== "APPROVED" && (
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => router.push(`/accounts/${id}/edit`)}
          >
            ✏️ Edit Expense
          </button>
        )}
      </div>

      {/* 🔹 Workflow / Approval Info */}
      {workflow && (
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500 space-y-2">
          <h2 className="text-lg font-semibold">Approval Workflow</h2>

          <p>
            <strong>Status:</strong>{" "}
            {workflow.status === "APPROVED" ? (
              <span className="text-green-600 font-semibold">✅ Approved</span>
            ) : (
              <span className="text-yellow-600 font-semibold">
                ⏳ Approval Pending
              </span>
            )}
          </p>

          <p>
            <strong>Created By:</strong>{" "}
            {workflow.created_by?.name || "-"}
          </p>

          <p>
            <strong>Approved By:</strong>{" "}
            {typeof workflow.approved_by === "string"
              ? workflow.approved_by
              : workflow.approved_by?.name || "Approval Pending"}
          </p>
        </div>
      )}

      {/* Expense Core Info */}
      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
        <Detail label="Expense ID" value={String(expense.expense_id)} />
        <Detail label="Category" value={expense.expense_category} />
        <Detail label="Type" value={expense.expense_type} />
        <Detail label="Year" value={expense.expense_year} />
        <Detail label="Period" value={expense.expense_period} />
        <Detail
          label="Amount"
          value={`${expense.amount ?? "-"} ${expense.currency ?? ""}`}
        />
      </div>

      {/* Expense Status */}
      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
        <Detail label="Status" value={expense.status} />
        <Detail
          label="Escalable"
          value={expense.is_escalable ?? "No"}
        />
      </div>

      {/* Notes */}
      <div className="bg-white p-6 rounded shadow">
        <Detail label="Remarks / Notes" value={expense.note} />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
