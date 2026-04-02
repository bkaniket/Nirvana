"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { useApi } from "@/app/hooks/useApi";
import { FileText, Trash2, ShieldCheck } from "lucide-react";

/* ---------------- Types ---------------- */

type WorkflowInfo = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_by?: {
    name: string;
    created_at: string;
  } | null;
  approved_by?: {
    name: string;
    approved_at: string;
  } | string | null;
};

type Lease = {
  id: number;
  building_id?: string;
  lease_administrator?: {
  user_id: number;
  username: string;
};
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
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";
const FILE_BASE_URL = BASE_URL.replace("/api", "");
const getFileUrl = (path: string) =>
  `${FILE_BASE_URL}/storage/${path}`;



function UploadDocumentModal({
  leaseId,
  onClose,
  onUploaded,
}: {
  leaseId: string | string[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileType, setFileType] = useState("");

  const handleUpload = async () => {
    if (!files) return;

    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("lease_id", String(leaseId));
    formData.append("file_type", fileType);

    Array.from(files).forEach((file) => {
      formData.append("documents[]", file);
    });

    await fetch(`${BASE_URL}/documents`, {
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Upload Lease Documents
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add one or more files to this lease.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            File Type
          </label>
          <input
            type="text"
            placeholder="Agreement, Amendment, Annexure..."
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Documents
          </label>
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
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
  onClick={handleUpload}
  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
>
  Upload
</button>
      </div>
    </div>
  </div>
);
}
function EditDocumentModal({
  document,
  onClose,
  onUpdated,
}: {
  document: LeaseDocument;
  onClose: () => void;
  onUpdated: (updatedDoc: LeaseDocument) => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [fileName, setFileName] = useState(document.file_name);
  const [fileType, setFileType] = useState(document.file_type || "");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("_method", "PUT"); // Laravel method spoofing
    formData.append("file_name", fileName);
    formData.append("file_type", fileType);

    // Only append file if user selected one
    if (newFile) {
      formData.append("document", newFile);
    }

    const res = await fetch(`${BASE_URL}/documents/${document.id}`, {
      method: "POST", // MUST be POST for file upload
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update document");
      return;
    }

    onUpdated(data.data);
    onClose();
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Edit Document</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update file details or replace the file.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current File
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {document.file_name}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            File Name
          </label>
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            File Type
          </label>
          <input
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            placeholder="File Type"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Replace File
          </label>
          <input
            type="file"
            onChange={(e) =>
              setNewFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
);
}

const leaseSections: {
  title: string;
  fields: { label: string; key: keyof Lease }[];
}[] = [
  {
    title: "Lease Identification",
    fields: [
      { label: "System Lease ID", key: "system_lease_id" },
      { label: "Client Lease ID", key: "client_lease_id" },
      { label: "Lease Version", key: "lease_version" },
      { label: "Lease Source", key: "lease_source" },
      { label: "Lease Hierarchy", key: "lease_hierarchy" },
      { label: "Parent Lease ID", key: "parent_lease_id" },
    ],
  },
  {
    title: "Parties Involved",
    fields: [
      { label: "Tenant Legal Name", key: "tenant_legal_name" },
      { label: "Landlord Legal Name", key: "landlord_legal_name" },
      { label: "Legacy Entity", key: "legacy_entity_name" },
       { label: "Lease Administrator", key: "lease_administrator" as keyof Lease },
    ],
  },
  {
    title: "Key Dates & Lifecycle",
    fields: [
      { label: "Lease Agreement Date", key: "lease_agreement_date" },
      { label: "Possession Date", key: "possession_date" },
      { label: "Rent Commencement Date", key: "rent_commencement_date" },
      { label: "Current Commencement Date", key: "current_commencement_date" },
      { label: "Termination Date", key: "termination_date" },
      { label: "Possible Expiration", key: "lease_possible_expiration" },
    ],
  },
  {
    title: "Lease Terms",
    fields: [
      { label: "Lease Type", key: "lease_type" },
      { label: "Lease Status", key: "lease_status" },
      { label: "Current Term", key: "current_term" },
      { label: "Term Remaining", key: "current_term_remaining" },
      { label: "Critical Lease", key: "critical_lease" },
      { label: "Within Landlord Tenant Act", key: "within_landlord_tenant_act" },
    ],
  },
  {
    title: "Space & Usage",
    fields: [
      { label: "Primary Use", key: "primary_use" },
      { label: "Additional Use", key: "additional_use" },
      { label: "Ownership Type", key: "ownership_type" },
      { label: "Measure Units", key: "measure_units" },
    ],
  },
  {
    title: "Financial & Recovery",
    fields: [
      { label: "Account Type", key: "account_type" },
      { label: "Lease Recovery Type", key: "lease_recovery_type" },
      { label: "Escalation Type", key: "escalation_type" },
      { label: "Security Deposit Type", key: "security_deposit_type" },
      { label: "Security Deposit Amount", key: "security_deposit_amount" },
      { label: "Deposit Date", key: "security_deposit_deposited_date" },
      { label: "Deposit Return Date", key: "security_deposit_return_date" },
    ],
  },
  {
    title: "Compliance & Legal",
    fields: [
      { label: "Compliance Status", key: "compliance_status" },
      { label: "Deed of Grant", key: "deed_of_grant" },
      { label: "Lease Acts", key: "lease_acts" },
      { label: "Lease Clauses", key: "lease_clauses" },
      { label: "Lease Penalties", key: "lease_penalties" },
    ],
  },
  {
    title: "Portfolio & Classification",
    fields: [
      { label: "Portfolio", key: "portfolio" },
      { label: "Portfolio Sub Group", key: "portfolio_sub_group" },
      { label: "Building ID", key: "building_id" },
    ],
  },
];

function CreateExpenseModal({
  leaseId,
  onClose,
  onCreated,
}: {
  leaseId: string | string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

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

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const res = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        lease_id: leaseId,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create expense");
      return;
    }

    onCreated();
    onClose();
  };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Lease Expense
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a new expense entry for this lease.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Expense Year
          </label>
          <input
            placeholder="2026"
            value={form.expense_year}
            onChange={(e) => handleChange("expense_year", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Expense Type
          </label>
          <input
            placeholder="Electricity, Tax..."
            value={form.expense_type}
            onChange={(e) => handleChange("expense_type", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <input
            placeholder="Rent / Non-Rent"
            value={form.expense_category}
            onChange={(e) => handleChange("expense_category", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Vendor Name
          </label>
          <input
            placeholder="Vendor Name"
            value={form.vendor_name}
            onChange={(e) => handleChange("vendor_name", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Amount
          </label>
          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Currency
          </label>
          <input
            placeholder="INR"
            value={form.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Expense"}
        </button>
      </div>
    </div>
  </div>
);
}
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
  const [uploading, setUploading] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LeaseDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
const [deleting, setDeleting] = useState(false);
const openEditModal = useCallback((doc: LeaseDocument) => {
  setEditingDoc(doc);
}, []);
const confirmDelete = async () => {
  if (!deleteTarget) return;

  try {
    setDeleting(true);
    await handleDelete(deleteTarget.id);
    setDeleteTarget(null);
  } finally {
    setDeleting(false);
  }
};

  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");

const fetchDocuments = useCallback(async () => {
  if (!id) return;

  const data = await request(`/leases/${id}/documents`);

  setDocuments(data?.data || []);
  setDocsLoading(false);
}, [id, request]);
const fetchLease = useCallback(async () => {
  if (!canView || !id) {
    router.push("/dashboard");
    return;
  }

  setLoading(true);

  const data = await request(`/leases/${id}`);

  if (!data) {
    setLoading(false);
    router.push("/leases");
    return;
  }

  setLease(data.lease);
  setWorkflow(data.workflow);
  setLoading(false);
}, [id, canView, router, request]);

  useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token || !id) return;

  fetch(`${BASE_URL}/expenses/leases/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setExpenses(data.data || []);
    })
    .finally(() => setExpenseLoading(false));
}, [id]);

const handleDelete = useCallback(async (docId: number) => {
  const success = await request(`/documents/${docId}`, {
    method: "DELETE",
  });

  if (success !== null) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }
}, [request]);


useEffect(() => {
  fetchLease();
}, [id, canView]);

useEffect(() => {
  fetchDocuments();
}, [id]);

    if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-80 animate-pulse rounded-2xl bg-white/20" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[28px] bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }


  if (!lease) return null;

  return (
   <div className="min-h-screen w-full ">
<div className="w-full m-0 p-0 space-y-2">

        {/* Header */}
     <div className="space-y-3">
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <FileText className="h-5 w-5" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Lease Details
      </h1>
    </div>

    {canEdit && workflow?.status !== "APPROVED" && (
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
        onClick={() => router.push(`/leases/${id}/edit`)}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z"
          />
        </svg>
        Edit Lease
      </button>
    )}
  </div>

  {workflow && <WorkflowPanel workflow={workflow} />}
</div>

         

        {/* ALL SECTIONS ABOVE STAY SAME */}

         <div className="space-y-3">
  {leaseSections.map((section) => (
    <Section key={section.title} title={section.title}>
      {section.fields.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          value={lease[field.key]}
        />
      ))}
    </Section>
  ))}
</div>
        {/* Lease Documents */}
      

      
      <Section layout="block" className="mt-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        Lease Documents
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload and manage lease documents for this property
      </p>
    </div>

    <button
      onClick={() => setShowUpload(true)}
      className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
    >
      + Upload
    </button>
  </div>

  <div className="mt-2">
    {docsLoading ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading documents...
      </div>
    ) : documents.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">No documents uploaded</p>
        <p className="mt-1 text-sm text-slate-500">
          Upload lease files to get started. All documents are securely stored.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-700">
                <th className="px-5 py-4 font-semibold">File Name</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Uploaded By</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        📄
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {doc.file_name}
                        </p>
                        <p className="text-xs text-slate-500">Lease document</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {doc.file_type || "-"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {doc.uploaded_by_first_name
                      ? `${doc.uploaded_by_first_name} ${doc.uploaded_by_last_name}`
                      : "-"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {new Date(doc.created_at).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => window.open(getFileUrl(doc.file_path), "_blank")}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      <a
                        href={getFileUrl(doc.file_path)}
                        download
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Download
                      </a>

                      <button
                        onClick={() => openEditModal(doc)}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteTarget(doc)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete
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
</Section>
      {/* Modals OUTSIDE content wrapper */}
      {showUpload && (
        <UploadDocumentModal
          leaseId={id as string}
          onClose={() => setShowUpload(false)}
onUploaded={fetchDocuments}
        />
      )}

      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onUpdated={(updatedDoc) =>
            setDocuments((prev) =>
              prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
            )
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
          <h3 className="text-base font-semibold text-slate-900">
            Delete document?
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            This will permanently remove{" "}
            <span className="font-medium text-slate-700">
              {deleteTarget.file_name}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setDeleteTarget(null)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          disabled={deleting}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

        {/** 🔹 Building Expenses */}
<Section title="Lease Expenses" layout="block" className="mt-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-sm text-slate-500">
        Track and manage expense entries for this lease
      </p>
    </div>

    <button
      className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
      onClick={() => setShowExpenseModal(true)}
    >
      + Add Expense
    </button>
  </div>

  <div className="mt-3">
    {expenseLoading ? (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Loading expenses...
      </div>
    ) : expenses.length === 0 ? (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No expenses recorded
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Add expense entries to track lease-related costs.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-700">
                <th className="px-5 py-3 font-semibold">Year</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Vendor</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {expenses.map((exp) => (
                <tr
                  key={exp.expense_id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/accounts/${exp.expense_id}`)}
                >
                  <td className="px-5 py-3">{exp.expense_year || "-"}</td>
                  <td className="px-5 py-3">{exp.expense_type || "-"}</td>
                  <td className="px-5 py-3">{exp.expense_category || "-"}</td>
                  <td className="px-5 py-3">{exp.vendor_name || "-"}</td>
                  <td className="px-5 py-3 font-medium">
                    {exp.amount || "-"} {exp.currency || ""}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium">
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

  {showExpenseModal && (
    <CreateExpenseModal
      leaseId={id as string}
      onClose={() => setShowExpenseModal(false)}
      onCreated={() => {
        const token = sessionStorage.getItem("token");

        fetch(`${BASE_URL}/expenses/leases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setExpenses(data.data || []));
      }}
    />
  )}
</Section>

    </div>
  </div>
);
}


/* ---------------- Reusable UI ---------------- */

function WorkflowPanel({ workflow }: { workflow: WorkflowInfo }) {
  const isApproved = workflow.status === "APPROVED";

  const approvedBy =
    typeof workflow.approved_by === "string"
      ? workflow.approved_by
      : workflow.approved_by?.name || "Pending";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-5 shadow-sm backdrop-blur">
      
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Approval Workflow
          </h2>
          <p className="text-sm text-slate-500">
            Current review and approval details
          </p>
        </div>

        {/* STATUS BADGE */}
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isApproved
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}
        >
          <span
            className={`mr-2 h-2 w-2 rounded-full ${
              isApproved ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {isApproved ? "Approved" : "Approval Pending"}
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        
        {/* STATUS */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Status
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {isApproved ? "Approved" : "Approval Pending"}
          </p>
        </div>

        {/* CREATED BY */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Created By
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {workflow.created_by?.name || "Not available"}
          </p>
        </div>

        {/* APPROVED BY */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Approved By
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {approvedBy}
          </p>
        </div>

      </div>
    </div>
  );
}


function Section({
  title,
  children,
  layout = "grid",
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  layout?: "grid" | "block";
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title && (
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      )}

      {layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {children}
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: any;
}) {
  let displayValue = "-";

  if (value) {
    if (typeof value === "object" && value.username) {
      displayValue = value.username;
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-slate-600">
        {label}
      </p>
      <p className="text-base font-semibold text-slate-900">
        {displayValue}
      </p>
    </div>
  );
}

