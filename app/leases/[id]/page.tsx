"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { useApi } from "@/app/hooks/useApi";
import { FileText, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─────────────────────────────────────────────────────────── Types */

type WorkflowInfo = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_by?: { name: string; created_at: string } | null;
  approved_by?: { name: string; approved_at: string } | string | null;
};

type Lease = {
  id: number;
  building_id?: string;
  lease_administrator?: { user_id: number; username: string };
  tenant_legal_name?: string;
  landlord_legal_name?: string;
  legacy_entity_name?: string;
  lease_type?: string;
  lease_status?: string;
  lease_agreement_date?: string;
  possession_date?: string;
  rent_commencement_date?: string;
  termination_date?: string;
  current_term?: string;
  current_term_remaining?: string;
  lease_rentable_area?: string;
  measure_units?: string;
  escalation_type?: string;
  security_deposit_type?: string;
  security_deposit_amount?: string;
  portfolio?: string;
  remarks?: string;
  system_lease_id?: string;
  client_lease_id?: string;
  lease_version?: string;
  lease_source?: string;
  lease_hierarchy?: string;
  parent_lease_id?: string;
  primary_use?: string;
  additional_use?: string;
  ownership_type?: string;
  account_type?: string;
  lease_recovery_type?: string;
  critical_lease?: string;
  within_landlord_tenant_act?: string;
  compliance_status?: string;
  deed_of_grant?: string;
  lease_acts?: string;
  lease_clauses?: string;
  lease_penalties?: string;
  current_commencement_date?: string;
  lease_possible_expiration?: string;
  security_deposit_deposited_date?: string;
  security_deposit_return_date?: string;
  portfolio_sub_group?: string;
};

type LeaseDocument = {
  id: number;
  leaseId: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  created_at: string;
  uploaded_by: number;
  uploaded_by_first_name?: string;
  uploaded_by_last_name?: string;
};

type Expense = {
  expense_id: number;
  expense_year?: string;
  expense_period?: string;
  expense_category?: string;
  expense_type?: string;
  amount?: string;
  currency?: string;
  status?: string;
  vendor_name?: string;
  account_code?: string;
};

/* ─────────────────────────────────────────────────────── Constants */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";
const FILE_BASE_URL = BASE_URL.replace("/api", "");
const getFileUrl = (path: string) => `${FILE_BASE_URL}/storage/${path}`;

const SECTIONS = [
  { id: "identification", title: "Lease Identification" },
  { id: "parties", title: "Parties Involved" },
  { id: "dates", title: "Key Dates & Lifecycle" },
  { id: "terms", title: "Lease Terms" },
  { id: "space", title: "Space & Usage" },
  { id: "financial", title: "Financial & Recovery" },
  { id: "compliance", title: "Compliance & Legal" },
  { id: "portfolio", title: "Portfolio & Classification" },
];

/* ───────────────────────────────────────── CollapsibleSection (same as Building) */

function CollapsibleSection({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        open
          ? "bg-blue-50/60 border-blue-200 shadow-md"
          : "bg-white/70 border-gray-300 hover:bg-gray-50"
      } backdrop-blur-xl`}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex justify-between items-center"
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 grid gap-4">{children}</div>}
    </div>
  );
}

/* ───────────────────────────────────────────── Detail card (same as Building) */

function Detail({ label, value }: { label: string; value?: any }) {
  let displayValue: string = "—";
  if (value) {
    if (typeof value === "object" && value.username) {
      displayValue = value.username;
    } else if (value !== null && value !== undefined) {
      displayValue = String(value);
    }
  }
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="mt-1 text-sm font-medium text-slate-800">{displayValue}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────── Upload Document Modal */

function UploadDocumentModal({
  leaseId,
  onClose,
  onUploaded,
}: {
  leaseId: string | string[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileType, setFileType] = useState("");

  const handleUpload = async () => {
    if (!files) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("lease_id", String(leaseId));
    formData.append("file_type", fileType);
    Array.from(files).forEach((file) => formData.append("documents[]", file));
    await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Upload Lease Documents</h2>
          <p className="mt-1 text-sm text-slate-500">Add one or more files to this lease.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">File Type</label>
            <input
              type="text"
              placeholder="Agreement, Amendment, Annexure..."
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Documents</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── Edit Document Modal */

function EditDocumentModal({
  document,
  onClose,
  onUpdated,
}: {
  document: LeaseDocument;
  onClose: () => void;
  onUpdated: (updatedDoc: LeaseDocument) => void;
}) {
  const [fileName, setFileName] = useState(document.file_name);
  const [fileType, setFileType] = useState(document.file_type || "");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("file_name", fileName);
    formData.append("file_type", fileType);
    if (newFile) formData.append("document", newFile);
    const res = await fetch(`${BASE_URL}/documents/${document.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { alert("Failed to update document"); return; }
    onUpdated(data.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Edit Document</h2>
          <p className="mt-1 text-sm text-slate-500">Update file details or replace the file.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current File</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{document.file_name}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">File Name</label>
            <input value={fileName} onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">File Type</label>
            <input value={fileType} onChange={(e) => setFileType(e.target.value)} placeholder="File Type"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Replace File</label>
            <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-400 disabled:opacity-60 active:scale-95">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── Create Expense Modal */

function CreateExpenseModal({
  leaseId,
  onClose,
  onCreated,
}: {
  leaseId: string | string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    expense_year: "",
    expense_type: "",
    expense_category: "",
    vendor_name: "",
    amount: "",
    currency: "INR",
    status: "PENDING",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, lease_id: leaseId }),
    });
    setLoading(false);
    if (!res.ok) { alert("Failed to create expense"); return; }
    onCreated();
    onClose();
  };

  const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 pt-24 pb-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Lease Expense</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new expense entry for this lease</p>
            </div>
            <button onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">✕</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Expense Year</label>
            <input placeholder="2026" value={form.expense_year} onChange={(e) => handleChange("expense_year", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Expense Type</label>
            <input placeholder="Electricity, Tax..." value={form.expense_type} onChange={(e) => handleChange("expense_type", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <input placeholder="Rent / Non-Rent" value={form.expense_category} onChange={(e) => handleChange("expense_category", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Vendor Name</label>
            <input placeholder="Vendor Name" value={form.vendor_name} onChange={(e) => handleChange("vendor_name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Amount</label>
            <input placeholder="Amount" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Currency</label>
            <input placeholder="INR" value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button onClick={handleCreate} disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60 active:scale-95">
            {loading ? "Saving..." : "Create Expense"}
          </button>
          <button onClick={onClose}
            className="h-11 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────── Section fields config */

const leaseSectionFields: Record<string, { label: string; key: keyof Lease }[]> = {
  identification: [
    { label: "System Lease ID", key: "system_lease_id" },
    { label: "Client Lease ID", key: "client_lease_id" },
    { label: "Lease Version", key: "lease_version" },
    { label: "Lease Source", key: "lease_source" },
    { label: "Lease Hierarchy", key: "lease_hierarchy" },
    { label: "Parent Lease ID", key: "parent_lease_id" },
  ],
  parties: [
    { label: "Tenant Legal Name", key: "tenant_legal_name" },
    { label: "Landlord Legal Name", key: "landlord_legal_name" },
    { label: "Legacy Entity", key: "legacy_entity_name" },
    { label: "Lease Administrator", key: "lease_administrator" as keyof Lease },
  ],
  dates: [
    { label: "Lease Agreement Date", key: "lease_agreement_date" },
    { label: "Possession Date", key: "possession_date" },
    { label: "Rent Commencement Date", key: "rent_commencement_date" },
    { label: "Current Commencement Date", key: "current_commencement_date" },
    { label: "Termination Date", key: "termination_date" },
    { label: "Possible Expiration", key: "lease_possible_expiration" },
  ],
  terms: [
    { label: "Lease Type", key: "lease_type" },
    { label: "Lease Status", key: "lease_status" },
    { label: "Current Term", key: "current_term" },
    { label: "Term Remaining", key: "current_term_remaining" },
    { label: "Critical Lease", key: "critical_lease" },
    { label: "Within Landlord Tenant Act", key: "within_landlord_tenant_act" },
  ],
  space: [
    { label: "Primary Use", key: "primary_use" },
    { label: "Additional Use", key: "additional_use" },
    { label: "Ownership Type", key: "ownership_type" },
    { label: "Measure Units", key: "measure_units" },
  ],
  financial: [
    { label: "Account Type", key: "account_type" },
    { label: "Lease Recovery Type", key: "lease_recovery_type" },
    { label: "Escalation Type", key: "escalation_type" },
    { label: "Security Deposit Type", key: "security_deposit_type" },
    { label: "Security Deposit Amount", key: "security_deposit_amount" },
    { label: "Deposit Date", key: "security_deposit_deposited_date" },
    { label: "Deposit Return Date", key: "security_deposit_return_date" },
  ],
  compliance: [
    { label: "Compliance Status", key: "compliance_status" },
    { label: "Deed of Grant", key: "deed_of_grant" },
    { label: "Lease Acts", key: "lease_acts" },
    { label: "Lease Clauses", key: "lease_clauses" },
    { label: "Lease Penalties", key: "lease_penalties" },
  ],
  portfolio: [
    { label: "Portfolio", key: "portfolio" },
    { label: "Portfolio Sub Group", key: "portfolio_sub_group" },
    { label: "Building ID", key: "building_id" },
  ],
};

/* ══════════════════════════════════════════════════════════ Main Page */

export default function LeaseDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { request } = useApi();

  const [lease, setLease] = useState<Lease | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LeaseDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaseDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Sidebar & section state (same pattern as Building Details) ──
  const [activeSection, setActiveSection] = useState<string>("identification");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identification: true,
  });

  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");

  const handleSectionNav = (sectionId: string) => {
    setActiveSection(sectionId);
    setOpenSections({ [sectionId]: true });
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  /* ── Data fetching ── */

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    const data = await request(`/leases/${id}/documents`);
    setDocuments(data?.data || []);
    setDocsLoading(false);
  }, [id, request]);

  const fetchLease = useCallback(async () => {
    if (!canView || !id) { router.push("/dashboard"); return; }
    setLoading(true);
    const data = await request(`/leases/${id}`);
    if (!data) { setLoading(false); router.push("/leases"); return; }
    setLease(data.lease);
    setWorkflow(data.workflow);
    setLoading(false);
  }, [id, canView, router, request]);

  const handleDelete = useCallback(async (docId: number) => {
    const success = await request(`/documents/${docId}`, { method: "DELETE" });
    if (success !== null) setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, [request]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await handleDelete(deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
  };

  useEffect(() => { fetchLease(); }, [id, canView]);
  useEffect(() => { fetchDocuments(); }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    fetch(`${BASE_URL}/expenses/leases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data.data || []))
      .finally(() => setExpenseLoading(false));
  }, [id]);

  /* ── Sorted sections: active first ── */
  const orderedSections = [
    ...SECTIONS.filter((s) => s.id === activeSection),
    ...SECTIONS.filter((s) => s.id !== activeSection),
  ];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-56 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        <div className="bg-white/90 p-6 rounded border border-gray-300 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-52 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="h-4 w-6 bg-gray-200 rounded" />
                <div className="w-px flex-1 bg-gray-200 mt-2" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-64 bg-gray-200 rounded" />
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-4 w-3/4 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!lease) return null;

  /* ══════════════════════════════════════════════════════ Render */
  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lease Details</h1>
        </div>

        {canEdit && workflow?.status !== "APPROVED" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push(`/leases/${id}/edit`)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z" />
                </svg>
                <span>Edit Lease</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              <p>Edit lease</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ── Workflow status card (same as Building) ── */}
      {workflow && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-slate-600">Approval Workflow</span>
            </div>

            <span className="hidden sm:block h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                workflow.status === "APPROVED"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${workflow.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {workflow.status}
              </span>
            </div>

            {workflow.created_by && (
              <>
                <span className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created By</span>
                  <span className="font-medium text-slate-700">
                    {workflow.created_by.name}
                    {workflow.created_by.created_at && (
                      <span className="ml-1 text-xs text-slate-400">
                        · {new Date(workflow.created_by.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}

            {workflow.approved_by && (
              <>
                <span className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Approved By</span>
                  <span className="font-medium text-slate-700">
                    {typeof workflow.approved_by === "object"
                      ? workflow.approved_by.name
                      : workflow.approved_by}
                    {typeof workflow.approved_by === "object" && workflow.approved_by.approved_at && (
                      <span className="ml-1 text-xs text-slate-400">
                        · {new Date(workflow.approved_by.approved_at).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Sidebar + content layout (identical to Building Details) ── */}
      <div className="flex gap-4 items-start">

        {/* Left sidebar */}
        <div className="shrink-0 sticky top-4 self-start flex flex-col items-center">
          <aside className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur overflow-hidden transition-all duration-300 ${sidebarOpen ? "w-72" : "w-12"}`}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center h-12 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            <div className={`transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
              <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-2">
                {SECTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionNav(item.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${activeSection === item.id ? "bg-blue-500" : "bg-slate-300"}`} />
                    <span>{item.title}</span>
                  </button>
                ))}

                <div className="my-2 border-t border-slate-100" />

                {[
                  { id: "documents", label: "Lease Documents" },
                  { id: "expenses", label: "Lease Expenses" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionNav(item.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${activeSection === item.id ? "bg-blue-500" : "bg-slate-300"}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {!sidebarOpen && (
            <div className="w-px bg-slate-200 rounded-full mt-2" style={{ minHeight: "80vh" }} />
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── Collapsible detail sections ── */}
          <div className="space-y-4">
            {orderedSections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-6">
                <CollapsibleSection
                  title={section.title}
                  open={openSections[section.id] ?? false}
                  onToggle={() =>
                    setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(leaseSectionFields[section.id] || []).map((field) => (
                      <Detail key={field.key} label={field.label} value={lease[field.key]} />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            ))}
          </div>

          {/* ── Documents ── */}
          <div id="documents" className="scroll-mt-6 mt-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lease Documents</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload and manage lease documents</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Upload</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}><p>Upload document</p></TooltipContent>
                </Tooltip>
              </div>

              {docsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                  <span className="ml-3 text-sm font-medium text-slate-600">Loading documents...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-16 px-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 mt-4">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents yet</h3>
                  <p className="text-slate-500 max-w-md mx-auto text-sm">Upload lease files to get started. All documents are securely stored.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden mt-4">
                  <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/70 px-6 py-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-slate-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-600">
                        {documents.length} document{documents.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">File Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Uploaded By</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 bg-white">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{doc.file_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{doc.file_type || "-"}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {doc.uploaded_by_first_name ? `${doc.uploaded_by_first_name} ${doc.uploaded_by_last_name}` : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button onClick={() => window.open(getFileUrl(doc.file_path), "_blank")} title="View"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <a href={getFileUrl(doc.file_path)} download title="Download"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                <button title="Edit" onClick={() => setEditingDoc(doc)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z" />
                                  </svg>
                                </button>
                                <button title="Delete" onClick={() => setDeleteTarget(doc)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Expenses ── */}
          <div id="expenses" className="scroll-mt-6 mt-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lease Expenses</h2>
                  <p className="text-sm text-slate-500 mt-1">Track and manage expense entries for this lease</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Expense</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}><p>Add lease expense</p></TooltipContent>
                </Tooltip>
              </div>

              {expenseLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
                  <span className="ml-3 text-sm font-medium text-slate-600">Loading expenses...</span>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12 px-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 mt-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No expenses recorded</h3>
                  <p className="text-slate-500 text-sm">Add expense entries to track lease-related costs.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden mt-4">
                  <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/70 px-6 py-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-slate-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-600">
                        {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Year</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Vendor</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 bg-white">
                        {expenses.map((exp) => (
                          <tr key={exp.expense_id}
                            className="hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer"
                            onClick={() => router.push(`/accounts/${exp.expense_id}`)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{exp.expense_year || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{exp.expense_type || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{exp.expense_category || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{exp.vendor_name || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {exp.amount} {exp.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium tracking-wide ${
                                exp.status === "APPROVED" ? "bg-emerald-50 text-emerald-700"
                                  : exp.status === "PENDING" ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {exp.status || "N/A"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      {showUpload && (
        <UploadDocumentModal leaseId={id as string} onClose={() => setShowUpload(false)} onUploaded={fetchDocuments} />
      )}

      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onUpdated={(updatedDoc) =>
            setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)))
          }
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete document?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  This will permanently remove{" "}
                  <span className="font-medium text-slate-700">{deleteTarget.file_name}</span>.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-60 active:scale-95">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <CreateExpenseModal
          leaseId={id as string}
          onClose={() => setShowExpenseModal(false)}
          onCreated={() => {
            const token = localStorage.getItem("token");
            fetch(`${BASE_URL}/expenses/leases/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => setExpenses(data.data || []));
          }}
        />
      )}

    </div>
  );
}