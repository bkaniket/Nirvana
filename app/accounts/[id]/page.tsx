"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarRange,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Layers3,
  ShieldCheck,
  Upload,
} from "lucide-react";

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
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!files || !files[0]) return;

    setUploading(true);
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("expense_id", String(expenseId));
    formData.append("invoice_number", invoiceNumber);
    formData.append("amount", amount);
    Array.from(files).forEach((file) => {
      formData.append("files[]", file);
    });

    try {
      await fetch(`${BASE_URL}/invoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      onUploaded();
      onClose();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fileNames = files ? Array.from(files).map((f) => f.name).join(", ") : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-3xl bg-white/90 border border-white/20 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Invoice
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
            <input
              placeholder="INV-2026-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BadgeIndianRupee className="h-5 w-5 text-slate-400" />
              </div>
              <input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 bg-white/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Files</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 transition-colors cursor-pointer"
            />
            {fileNames && (
              <p className="mt-2 text-xs text-slate-500 truncate">{fileNames}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-3xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-11 rounded-2xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!files?.[0] || uploading}
            className="px-6 h-11 rounded-2xl bg-amber-500 text-white font-semibold hover:bg-amber-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Invoice"}
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

  const refreshInvoices = async () => {
    const token = sessionStorage.getItem("token");
    if (!token || !id) return;

    setInvoiceLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/expenses/${id}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setInvoices(data.data || []);
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 p-6 rounded-3xl bg-white/70 border border-white/20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-6 w-full bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center rounded-3xl border border-slate-200/50 bg-white/70 p-8 shadow-xl">
        <FileText className="h-16 w-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Expense Not Found</h1>
        <p className="text-slate-600 mb-6 max-w-md">The expense record you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push("/accounts")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </button>
      </div>
    );
  }

  const totalInvoices = invoices.length;
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex flex-col">
            <button
              onClick={() => router.back()}
              className="self-start mb-4 inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/80 px-4 py-1.5 text-sm font-semibold text-amber-700 mb-3">
              <ShieldCheck className="h-4 w-4" />
              Expense #{expense.expense_id}
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {expense.expense_category || "Uncategorized Expense"}
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl">
              {expense.expense_type} • {expense.expense_period} {expense.expense_year}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm text-slate-900 font-semibold">
              <BadgeIndianRupee className="h-5 w-5" />
              {expense.amount} {expense.currency}
            </div>
            
            {canEdit && workflow?.status !== "APPROVED" && (
              <button
                className="group inline-flex h-12 items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 hover:from-amber-400 hover:to-amber-500"
                onClick={() => router.push(`/accounts/${id}/edit`)}
              >
                <Edit3 className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                Edit Expense
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Status */}
        {workflow && (
          <section className="lg:col-span-1 rounded-3xl border border-white/20 bg-gradient-to-br from-emerald-50/80 to-blue-50/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-2xl ${workflow.status === "APPROVED" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"} border`}>
                {workflow.status === "APPROVED" ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Clock className="h-6 w-6 text-amber-600" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Workflow Status</h3>
                <p className="text-sm text-slate-600">Approval tracking</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500">Status</span>
                <div className={`font-semibold mt-1 px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
                  workflow.status === "APPROVED" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {workflow.status === "APPROVED" ? "✅ Approved" : "⏳ Pending"}
                </div>
              </div>
              
              <div>
                <span className="text-slate-500 block">Created By</span>
                <span className="font-medium">{workflow.created_by?.name || "N/A"}</span>
              </div>
              
              <div>
                <span className="text-slate-500 block">Approved By</span>
                <span className="font-medium">
                  {typeof workflow.approved_by === "string" 
                    ? workflow.approved_by 
                    : workflow.approved_by?.name || "Pending"}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Main Details */}
        <section className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailCard
              label="Category"
              value={expense.expense_category || "Uncategorized"}
              icon={<Layers3 className="h-5 w-5 text-slate-500" />}
            />
            <DetailCard
              label="Type"
              value={expense.expense_type || "General"}
              icon={<Layers3 className="h-5 w-5 text-slate-500" />}
            />
            <DetailCard
              label="Year"
              value={expense.expense_year || "-"}
              icon={<CalendarRange className="h-5 w-5 text-slate-500" />}
            />
            <DetailCard
              label="Period"
              value={expense.expense_period || "-"}
              icon={<CalendarRange className="h-5 w-5 text-slate-500" />}
            />
            <DetailCard
              label="Status"
              value={expense.status || "Draft"}
              statusColor={expense.status?.toLowerCase()}
              icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}
            />
            <DetailCard
              label="Escalable"
              value={expense.is_escalable === "Yes" ? "Yes" : "No"}
              icon={<Layers3 className="h-5 w-5 text-slate-500" />}
            />
          </div>
          
          {expense.note && (
            <div className="mt-8 pt-8 border-t border-slate-200/50">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <FileText className="h-6 w-6 text-slate-500" />
                Remarks / Notes
              </h3>
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/30">
                <p className="text-slate-700 whitespace-pre-wrap">{expense.note}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Invoices Section */}
      <section className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/50">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
              <p className="text-slate-600">{totalInvoices} attached • {totalInvoiceAmount.toLocaleString()} total</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="group inline-flex h-12 items-center gap-3 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-400 hover:to-indigo-500"
          >
            <Upload className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
            Upload New Invoice
          </button>
        </div>

        {invoiceLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-slate-200/50 bg-slate-50/50">
            <FileText className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Invoices</h3>
            <p className="text-slate-600 mb-6">Upload your first invoice to get started.</p>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/50">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-gradient-to-r from-slate-50/50 to-white/50 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">File</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 bg-white/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-semibold text-slate-900">
                      {inv.invoice_number || "—"}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">
                      {inv.invoice_date
                        ? new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-900">{inv.amount || "—"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-xs block" title={inv.file_name}>
                        {inv.file_name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <a
                          href={`${BASE_URL.replace("/api", "")}/storage/${inv.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 items-center justify-center gap-2 px-3 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                        <a
                          href={`${BASE_URL.replace("/api", "")}/storage/${inv.file_path}`}
                          download={inv.file_name}
                          className="inline-flex h-10 items-center justify-center gap-2 px-3 text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showInvoiceModal && (
        <UploadInvoiceModal
          expenseId={id as string}
          onClose={() => setShowInvoiceModal(false)}
          onUploaded={refreshInvoices}
        />
      )}
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon,
  statusColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  statusColor?: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl border border-slate-200/50 bg-white/70 hover:border-slate-300/70 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-50/50 to-white/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
      <div className="relative flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-slate-100/50 group-hover:bg-slate-200/60 transition-colors flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`font-semibold text-lg ${statusColor === "approved" ? "text-emerald-700" : statusColor === "pending" ? "text-amber-700" : "text-slate-900"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}