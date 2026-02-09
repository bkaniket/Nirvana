"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: number;
  expense_id: number;
  invoice_number?: string;
  invoice_date?: string;
  amount?: string;
  file_name: string;
  file_path: string;
  created_at?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ;

export default function InvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [form, setForm] = useState({
    expense_id: "",
    invoice_number: "",
    invoice_date: "",
    amount: "",
    files: [] as File[],
  });

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${BASE_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setInvoices(data.data || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, files: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async () => {
    if (!form.expense_id) {
      alert("Expense ID is required");
      return;
    }

    if (!editingInvoice && form.files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    const formData = new FormData();
    formData.append("expense_id", form.expense_id);

    if (form.invoice_number)
      formData.append("invoice_number", form.invoice_number);

    if (form.invoice_date)
      formData.append("invoice_date", form.invoice_date);

    if (form.amount) formData.append("amount", form.amount);

    if (!editingInvoice) {
      form.files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    const url = editingInvoice
      ? `${BASE_URL}/invoices/${editingInvoice.id}`
      : `${BASE_URL}/invoices`;

    const method = editingInvoice ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");

      setShowForm(false);
      setEditingInvoice(null);
      setForm({
        expense_id: "",
        invoice_number: "",
        invoice_date: "",
        amount: "",
        files: [],
      });

      fetchInvoices();
    } catch (err) {
      alert("Failed to save invoice");
      console.error(err);
    }
  };

  const startEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setForm({
      expense_id: inv.expense_id.toString(),
      invoice_number: inv.invoice_number || "",
      invoice_date: inv.invoice_date || "",
      amount: inv.amount || "",
      files: [],
    });
    setShowForm(true);
  };

  if (loading) {
    return <p className="text-gray-500">Loading invoices...</p>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Invoices</h1>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingInvoice(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Upload Invoice
        </button>
      </div>

      {/* 🔹 Upload / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow space-y-4 border">

          <h2 className="text-lg font-semibold">
            {editingInvoice ? "Edit Invoice" : "Upload New Invoice"}
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Expense ID *"
              value={form.expense_id}
              onChange={(v) => setForm({ ...form, expense_id: v })}
            />

            <Input
              label="Invoice Number"
              value={form.invoice_number}
              onChange={(v) => setForm({ ...form, invoice_number: v })}
            />

            <Input
              label="Invoice Date"
              type="date"
              value={form.invoice_date}
              onChange={(v) => setForm({ ...form, invoice_date: v })}
            />

            <Input
              label="Amount"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
            />

            {!editingInvoice && (
              <div>
                <label className="text-sm text-gray-500">
                  Select Invoice Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {editingInvoice ? "Update" : "Upload"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setEditingInvoice(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {invoices.map((inv) => {
          // 🔹 Replace /api with /storage
          const storageBase = BASE_URL.replace("/api", "/storage");
          const fileUrl = `${storageBase}/${inv.file_path}`;

          const isImage = inv.file_name.match(/\.(jpg|jpeg|png|gif)$/i);
          const isPdf = inv.file_name.match(/\.pdf$/i);

          return (
            <div
              key={inv.id}
              className="bg-white rounded shadow p-4 space-y-3 border"
            >
              <p className="font-medium truncate">{inv.file_name}</p>

              {/* 🔹 Preview */}
              <div className="h-40 border rounded flex items-center justify-center bg-gray-50">
                {isImage && (
                  <img
                    src={fileUrl}
                    alt={inv.file_name}
                    className="max-h-full object-contain"
                  />
                )}

                {isPdf && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full"
                  />
                )}

                {!isImage && !isPdf && (
                  <p className="text-sm text-gray-500">No Preview</p>
                )}
              </div>

              {/* 🔹 Meta */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>Expense ID: {inv.expense_id}</p>
                {inv.invoice_number && (
                  <p>Invoice No: {inv.invoice_number}</p>
                )}
                {inv.invoice_date && (
                  <p>Date: {inv.invoice_date}</p>
                )}
                {inv.amount && <p>Amount: {inv.amount}</p>}
              </div>

              {/* 🔹 Actions */}
              <div className="flex justify-between items-center pt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  className="text-blue-600 text-sm underline"
                >
                  View / Download
                </a>

                <button
                  onClick={() => startEdit(inv)}
                  className="text-yellow-600 text-sm"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 🔹 Reusable Input */
function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded mt-1"
      />
    </div>
  );
}