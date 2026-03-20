"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Invoice = {
  id: number;
  invoice_number?: string;
  invoice_date?: string;
  amount?: string;
  file_name: string;
  file_path: string;
  created_at: string;
};

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

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || "";


function UploadInvoiceModal({
  expenseId,
  onClose,
  onUploaded,
}: {
  expenseId: string | string[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handleUpload = async () => {
    if (!files) return;

    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("expense_id", String(expenseId));
    formData.append("invoice_number", invoiceNumber);
    formData.append("amount", amount);

    Array.from(files).forEach((file) => {
      formData.append("files[]", file);
    });

    await fetch(`${BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Upload Invoice</h2>

        <input
          placeholder="Invoice Number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
export default function AccountDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
const [invoiceLoading, setInvoiceLoading] = useState(true);
const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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

  useEffect(() => {
  const token = sessionStorage.getItem("token");
  if (!token || !id) return;

  fetch(`${BASE_URL}/expenses/${id}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setInvoices(data.data || []);
    })
    .finally(() => setInvoiceLoading(false));
}, [id]);

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

      {/* 🔹 Invoices Section */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <div className="flex justify-between items-center">
    <h2 className="text-lg font-semibold">Invoices</h2>

    <button
      onClick={() => setShowInvoiceModal(true)}
      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
    >
      + Upload Invoice
    </button>
  </div>

  {invoiceLoading ? (
    <p>Loading invoices...</p>
  ) : invoices.length === 0 ? (
    <p className="text-gray-500">No invoices uploaded.</p>
  ) : (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Invoice #</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">File</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="px-4 py-2">
                {inv.invoice_number || "-"}
              </td>

              <td className="px-4 py-2">
                {inv.invoice_date
                  ? new Date(inv.invoice_date).toLocaleDateString()
                  : "-"}
              </td>

              <td className="px-4 py-2">
                {inv.amount || "-"}
              </td>

              <td className="px-4 py-2">
                {inv.file_name}
              </td>

              <td className="px-4 py-2 flex gap-3">
                <a
                  href={`${BASE_URL.replace("/api", "")}/storage/${inv.file_path}`}
                  target="_blank"
                  className="text-blue-600"
                >
                  View
                </a>

                <a
                  href={`${BASE_URL.replace("/api", "")}/storage/${inv.file_path}`}
                  download
                  className="text-green-600"
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
  {showInvoiceModal && (
  <UploadInvoiceModal
    expenseId={id as string}
    onClose={() => setShowInvoiceModal(false)}
    onUploaded={() => {
      const token = sessionStorage.getItem("token");

      fetch(`${BASE_URL}/expenses/${id}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setInvoices(data.data || []));
    }}
  />
)}
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
