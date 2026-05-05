"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { Building2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Building = {
  id: number;
  building_name: string;
  wing: string;
  unit_no: string;
  address_1?: string;
  city?: string;
  state?: string;
  country?: string;
  building_status?: string;
  ownership_type?: string;
  managed_by?: string;
  clli?: string;
  sio?: string;
  zip_code?: string;
  system_building_id?: string;
  building_type?: string;
  construction_year?: string;
  last_renovation_year?: string;
  building_rentable_area?: string;
  building_measure_units?: string;
  purchase_price?: string;
  currency_type?: string;
  portfolio?: string;
  portfolio_sub_group?: string;
  latitude?: string;
  longitude?: string;
  geocode_latitude?: string;
  geocode_longitude?: string;

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

type Lease = {
  id: number;
  client_lease_id: string;
  landlord_legal_name?: string;
  lease_agreement_date?: string;
  termination_date?: string;
  lease_status?: string;
};
type Expense = {
  expense_name?: string;
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

type Certificate = {
  id: number;
  certificate_number?: string;
  certificate_name?: string;
  certificate_type?: string;
  issued_by?: string;
  expiry_date?: string;
  status?: string;
  file_path?: string;
  owner_name?: string;
  owner_address?: string;
  approved_by?: string;
  issued_date?: string;
  notes?: string;
};


// Collapsible 
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${open
          ? "bg-blue-50/60 border-blue-200 shadow-md"
          : "bg-white/70 border-gray-300 hover:bg-gray-50"
        } backdrop-blur-xl`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex justify-between items-center"
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${open ? "rotate-180" : ""
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

// Input Field
function InputField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function CreateExpenseModal({
  buildingId, onClose, onCreated,
}: {
  buildingId: string | string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [form, setForm] = useState({
    expense_name:"",
    expense_period: "",
    expense_year: "",
    expense_type: "",
    expense_category: "",
    vendor_name: "",
    amount: "",
    currency: "",
    status: "",
    is_escalable: "",
    note: "",
    account_code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const EXP_MANDATORY = ["expense_year", "expense_type", "expense_category", "vendor_name", "amount", "currency", "status", "is_escalable", "account_code"];
  const expFormValid = EXP_MANDATORY.every((k) => (form as any)[k]?.trim());

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const missing = EXP_MANDATORY.filter((k) => !(form as any)[k]?.trim());
    if (missing.length > 0) { alert(`Please fill: ${missing.join(", ")}`); return; }
    setLoading(true);
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, building_id: buildingId }),
    });
    
    setLoading(false);
    if (!res.ok) { alert("Failed to create expense"); return; }
    onCreated();
    onClose();
  };

  const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 pt-24 pb-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
                <p className="text-sm text-gray-600 mt-1">Record and manage building expenses</p>
              </div>
              <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">✕</button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Expense Name <span className="text-red-500">*</span></label>
                <input placeholder="e.g. Electricity Bill 2026" value={form.expense_name} className={inputCls} onChange={(e) => handleChange("expense_name", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expense Year <span className="text-red-500">*</span></label>
                <input placeholder="e.g. 2026" value={form.expense_year} className={inputCls} onChange={(e) => handleChange("expense_year", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expense Period <span className="text-red-500">*</span></label>
                <input placeholder="e.g. Monthly, Yearly" value={form.expense_period} className={inputCls} onChange={(e) => handleChange("expense_period", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expense Type <span className="text-red-500">*</span></label>
                <input placeholder="Electricity, Rent..." value={form.expense_type} className={inputCls} onChange={(e) => handleChange("expense_type", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                <input placeholder="Rent / Non-Rent" value={form.expense_category} className={inputCls} onChange={(e) => handleChange("expense_category", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Vendor Name <span className="text-red-500">*</span></label>
                <input placeholder="Vendor / Company" value={form.vendor_name} className={inputCls} onChange={(e) => handleChange("vendor_name", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Amount <span className="text-red-500">*</span></label>
                <input placeholder="Enter amount" value={form.amount} className={inputCls} onChange={(e) => handleChange("amount", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Currency <span className="text-red-500">*</span></label>
                <input placeholder="e.g. INR" value={form.currency} className={inputCls} onChange={(e) => handleChange("currency", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Account Code <span className="text-red-500">*</span></label>
                <input placeholder="e.g. ACC-001" value={form.account_code} className={inputCls} onChange={(e) => handleChange("account_code", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                <select value={form.status} className={inputCls} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="" disabled hidden>Select status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Is Escalable <span className="text-red-500">*</span></label>
                <select value={form.is_escalable} className={inputCls} onChange={(e) => handleChange("is_escalable", e.target.value)}>
                  <option value="" disabled hidden>Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Note</label>
                <textarea placeholder="Additional notes (optional)" value={form.note} rows={2}
                  className={`${inputCls} resize-none`}
                  onChange={(e) => handleChange("note", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button onClick={handleCreate} disabled={loading || !expFormValid}
              className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
              {loading ? "Saving..." : "Save Expense"}
            </button>
            <button onClick={onClose}
              className="h-11 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCertificateModal({ buildingId, onClose, onCreated, editingData }: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/svg+xml", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
  const ALLOWED_EXT = "pdf, jpg, jpeg, png, svg, doc, docx, txt";
  const MAX_SIZE_MB = 50;

  const [form, setForm] = useState({
    certificate_number: "",
    certificate_name: "",
    certificate_type: "",
    owner_name: "",
    owner_address: "",
    issued_by: "",
    approved_by: "",
    issued_date: "",
    expiry_date: "",
    status: "",
    notes: "",
  });
  useEffect(() => {
    if (editingData) {
      setForm({
        certificate_number: editingData.certificate_number || "",
        certificate_name: editingData.certificate_name || "",
        certificate_type: editingData.certificate_type || "",
        owner_name: editingData.owner_name || "",
        owner_address: editingData.owner_address || "",
        issued_by: editingData.issued_by || "",
        approved_by: editingData.approved_by || "",
        issued_date: editingData.issued_date || "",
        expiry_date: editingData.expiry_date || "",
        status: editingData.status || "",
        notes: editingData.notes || "",
      });
    }
  }, [editingData]);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const selected = e.target.files?.[0];
    if (!selected) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError(`Invalid file type. Allowed: ${ALLOWED_EXT}`);
      setFile(null);
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Max size: ${MAX_SIZE_MB} MB`);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const MANDATORY_CERT = ["certificate_number", "certificate_name", "certificate_type", "owner_name", "issued_by", "approved_by", "issued_date", "status"];
  const certFormValid = MANDATORY_CERT.every((k) => (form as any)[k]?.trim());

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const missing = MANDATORY_CERT.filter((k) => !(form as any)[k]?.trim());
    if (missing.length > 0) { alert(`Please fill: ${missing.join(", ")}`); return; }
    if (!file) { alert("Please choose a file"); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("files[]", file);

    setLoading(true);
    const res = await fetch(`${BASE_URL}/buildings/${buildingId}/certificates`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    setLoading(false);
    if (!res.ok) { alert("Failed to upload certificate"); return; }
    onCreated();
    onClose();
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editingData) return;

    setLoading(true);

    const res = await fetch(`${BASE_URL}/certificates/${editingData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update certificate");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 px-4 pt-24 pb-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Certificate</h2>
              <p className="mt-1 text-sm text-slate-500">Upload and manage a new building certificate</p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Certificate Number <span className="text-red-500">*</span></label>
              <input required placeholder="e.g. CERT-2024-001" value={form.certificate_number}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("certificate_number", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Certificate Name <span className="text-red-500">*</span></label>
              <input required placeholder="Enter certificate name" value={form.certificate_name}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("certificate_name", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Certificate Type <span className="text-red-500">*</span></label>
              <input required placeholder="Enter type" value={form.certificate_type}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("certificate_type", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Owner Name <span className="text-red-500">*</span></label>
              <input required placeholder="Owner name" value={form.owner_name}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("owner_name", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Issued By <span className="text-red-500">*</span></label>
              <input required placeholder="Authority / Organization" value={form.issued_by}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("issued_by", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Approved By <span className="text-red-500">*</span></label>
              <input required placeholder="Approver name" value={form.approved_by}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("approved_by", e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Issued Date <span className="text-red-500">*</span></label>
              <input required type="date" value={form.issued_date} max={form.expiry_date || undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => {
                  handleChange("issued_date", e.target.value);
                  if (form.expiry_date && form.expiry_date < e.target.value) handleChange("expiry_date", "");
                }} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Expiry Date</label>
              <input type="date" value={form.expiry_date} min={form.issued_date || undefined}
                disabled={!form.issued_date}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                onChange={(e) => handleChange("expiry_date", e.target.value)} />
              <p className="mt-1 text-xs text-slate-400">Select issued date first</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Status <span className="text-red-500">*</span></label>
              <select required value={form.status}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("status", e.target.value)}>
                <option value="" disabled hidden>Select status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Owner Address</label>
              <textarea placeholder="Owner address (optional)" value={form.owner_address} rows={2}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                onChange={(e) => handleChange("owner_address", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
              <textarea placeholder="Additional notes (optional)" value={form.notes} rows={2}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                onChange={(e) => handleChange("notes", e.target.value)} />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Upload File <span className="text-red-500">*</span>
            </label>
            {editingData && editingData.file_path && !file && (
              <a href={editingData.file_path} target="_blank" className="text-sm text-blue-600 underline">
                View existing file
              </a>
            )}
            <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 bg-slate-50 transition-colors ${fileError ? "border-red-300 bg-red-50" : file ? "border-emerald-300 bg-emerald-50" : "border-slate-300"}`}>
              <input type="file" onChange={handleFileChange} className="hidden" id="fileUpload"
                accept=".pdf,.jpg,.jpeg,.png,.svg,.doc,.docx,.txt" />
              <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className={`h-12 px-6 flex items-center justify-center rounded-xl font-semibold shadow-md transition ${file ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-600 hover:bg-slate-700"} text-white`}>
                  {file ? "Change File" : "Choose File"}
                </div>
                {file ? (
                  <p className="text-sm font-medium text-emerald-700">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                ) : (
                  <p className="text-xs text-slate-500 text-center">
                    Supported formats: {ALLOWED_EXT}<br />Max size: {MAX_SIZE_MB} MB
                  </p>
                )}
              </label>
              {fileError && <p className="mt-2 text-xs text-red-600 font-medium">{fileError}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button onClick={editingData ? handleUpdate : handleCreate} disabled={loading || !certFormValid}
            className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
            {loading ? "Uploading..." : "Save Certificate"}
          </button>
          <button onClick={onClose}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


// Section config 
const SECTIONS = [
  { id: "basic", title: "Basic Information", label: "Basic Information" },
  { id: "location", title: "Location Details", label: "Location Details" },
  { id: "coordinates", title: "Geographical Coordinates", label: "Coordinates" },
  { id: "property", title: "Property Specifications", label: "Property Specs" },
  { id: "financial", title: "Financial Details", label: "Financial Details" },
  { id: "ownership", title: "Ownership & Management", label: "Ownership & Mgmt" },
];


export default function BuildingDetailsPage() {


  const { id } = useParams();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [building, setBuilding] = useState<Building | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const canEdit = hasPermission("BUILDING", "edit");
  const [activeSection, setActiveSection] = useState<string>("basic");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    setLoading(true);

    Promise.all([
      apiFetch(`${BASE_URL}/buildings/${id}`),
      apiFetch(`${BASE_URL}/expenses/buildings/${id}`),
      apiFetch(`${BASE_URL}/buildings/${id}/certificates`)
    ])
      .then(([buildingRes, expenseRes, certRes]) => {
        setBuilding(buildingRes.building);
        setWorkflow(buildingRes.workflow);
        setLeases(buildingRes.leases || []);

        setExpenses(expenseRes.data || []);
        setCertificates(certRes.data || []);
      })
      .catch(() => router.push("/buildings"))
      .finally(() => {
        setLoading(false);
        setExpenseLoading(false);
        setCertificateLoading(false);
      });
  }, [id]);



  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-56 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>

        {/* Workflow Card */}
        <div className="bg-white/90 p-6 rounded border border-gray-300 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-52 bg-gray-200 rounded" />
            <div className="h-4 w-44 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((section) => (
            <div key={section} className="flex">
              {/* Left Number Line */}
              <div className="flex flex-col items-center mr-4">
                <div className="h-4 w-6 bg-gray-200 rounded" />
                <div className="w-px flex-1 bg-gray-200 mt-2"></div>
              </div>

              {/* Section Content */}
              <div className="flex-1 space-y-3">
                <div className="h-6 w-64 bg-gray-200 rounded" />
                <div className="ml-4 border-l border-gray-300 pl-4 space-y-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-4 w-3/4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lease Cards */}
        <div className="space-y-4">
          <div className="h-6 w-56 bg-gray-200 rounded" />

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="border rounded p-4 space-y-3 bg-white/90"
              >
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!building) {
    return <p className="text-red-500">Building not found</p>;
  }
  // Sorted: active section first, rest follow original order
  const orderedSections = [
    ...SECTIONS.filter((s) => s.id === activeSection),
    ...SECTIONS.filter((s) => s.id !== activeSection),
  ];


  return (
    <div className="space-y-5">

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Building Details
          </h1>
        </div>


        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push(`/buildings/${id}/edit`)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full
                   bg-blue-600 px-5 text-sm font-semibold text-white shadow-md
                   transition-all duration-200 hover:bg-blue-700
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z"
                  />
                </svg>
                <span>Edit Building</span>
              </button>
            </TooltipTrigger>

            <TooltipContent side="bottom" sideOffset={8}>
              <p>Edit building</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ── Workflow + LHS Menu side by side ── */}
      <div className="flex gap-4 items-start">

        {/* Toggle Section */}
        {/* ── Left Sidebar ── */}
        <div className={`shrink-0 transition-all duration-300 ${sidebarOpen ? "w-48" : "w-10"}`}>
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur overflow-hidden">

            {/* Toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-between px-3 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {sidebarOpen && (
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Sections
                </span>
              )}
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180 mx-auto"}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Section items — only show when open */}
            {sidebarOpen && SECTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 border-b border-slate-50 last:border-0 flex items-center gap-2 ${activeSection === item.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeSection === item.id ? "bg-blue-500" : "bg-transparent"}`} />
                {item.label}
              </button>
            ))}

            {/* Collapsed: show dot indicators */}
            {!sidebarOpen && SECTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(true); }}
                className={`w-full flex justify-center py-2.5 border-b border-slate-50 last:border-0 transition-colors ${activeSection === item.id ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                title={item.label}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeSection === item.id ? "bg-blue-500" : "bg-slate-300"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: all main content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Approval Workflow */}
          {workflow && (
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Approval Workflow</h2>
                    <p className="text-xs text-slate-400">Current review and approval details</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${workflow.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${workflow.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                  {workflow.status === "APPROVED" ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Status", value: workflow.status === "APPROVED" ? "Approved" : "Pending" },
                  { label: "Created By", value: workflow.created_by?.name || "Not available" },
                  { label: "Approved By", value: typeof workflow.approved_by === "string" ? workflow.approved_by : workflow.approved_by?.name || "Pending" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LHS Section Menu — fixed width, sits right of workflow */}
          <div className="w-48 shrink-0">
            
          </div>
        </div>
      </div>
      {/* ── Dynamic Sections — active always on top and open ── */}

      <div key={activeSection} className="space-y-6">
        {orderedSections.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <div key={section.id} id={section.id}>
              <CollapsibleSection title={section.title} defaultOpen={isActive}>

                {section.id === "basic" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Building Name" value={building.building_name} />
                    <Detail label="Building Type" value={building.building_type} />
                    <Detail label="Wing" value={building.wing} />
                    <Detail label="Unit No" value={building.unit_no} />
                    <Detail label="Building Status" value={building.building_status} />
                  </div>
                )}

                {section.id === "location" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Address" value={building.address_1} />
                    <Detail label="City" value={building.city} />
                    <Detail label="State" value={building.state} />
                    <Detail label="Zip Code" value={building.zip_code} />
                    <Detail label="Country" value={building.country} />
                  </div>
                )}

                {section.id === "coordinates" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Latitude" value={building.latitude} />
                    <Detail label="Longitude" value={building.longitude} />
                    <Detail label="Geocode Latitude" value={building.geocode_latitude} />
                    <Detail label="Geocode Longitude" value={building.geocode_longitude} />
                  </div>
                )}

                {section.id === "property" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Construction Year" value={building.construction_year} />
                    <Detail label="Last Renovation Year" value={building.last_renovation_year || "Not Yet Renovated"} />
                    <Detail label="Rentable Area" value={building.building_rentable_area} />
                    <Detail label="Measurement Unit" value={building.building_measure_units} />
                  </div>
                )}

                {section.id === "financial" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Purchase Price" value={building.purchase_price} />
                    <Detail label="Currency Type" value={building.currency_type} />
                  </div>
                )}

                {section.id === "ownership" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="Ownership Type" value={building.ownership_type} />
                    <Detail label="Managed By" value={building.managed_by} />
                    <Detail label="Portfolio" value={building.portfolio} />
                    <Detail label="Portfolio Sub Group" value={building.portfolio_sub_group} />
                  </div>
                )}

              </CollapsibleSection>
            </div>
          );
        })}
      </div>


      {/* leases */}
      {leases && leases.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Leases in this Building
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Browse all lease agreements linked to this property
                </p>
              </div>

              <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:block">
                {leases.length} leases
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {leases.map((lease) => (
                <div
                  key={lease.id}
                  onClick={() => router.push(`/leases/${lease.id}`)}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {lease.client_lease_id}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {lease.landlord_legal_name}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition group-hover:bg-slate-900 group-hover:text-white">
                      →
                    </div>
                  </div>

                  <div className="my-4 h-px bg-slate-100" />

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Lease period
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {lease.lease_agreement_date}
                        <span className="mx-1 text-slate-400">→</span>
                        {lease.termination_date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${lease.lease_status?.trim().toUpperCase() === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : lease.lease_status?.trim().toUpperCase() === "INACTIVE"
                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                      >
                        {lease.lease_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/** 🔹 Certificates & Compliance */}
      <div>

        <div className="space-y-6 p-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Certificates</h2>
                <p className="text-sm text-slate-500 mt-1">Upload and manage a new building certificate</p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full
                  bg-green-600 px-5 text-sm font-semibold text-white shadow-md
                  transition-all duration-200 hover:bg-green-700
                  focus:outline-none focus:ring-2 focus:ring-green-300
                  active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add Certificate</span>
                  </button>
                </TooltipTrigger>

                <TooltipContent side="top" sideOffset={8}>
                  <p>Add building certificates</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Loading */}
            {certificateLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
                <span className="ml-3 text-sm font-medium text-slate-600">Loading certificates...</span>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-16 px-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No certificates yet</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Add your first certificate to get started. All documents are securely stored.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/70 px-6 py-4 border-b border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-slate-400 rounded-full" />
                    <span className="text-sm font-medium text-slate-600">
                      {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Issued by</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Expiry</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 bg-white">
                      {certificates.map((cert) => {
                        const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
                        const isExpired = expiryDate ? expiryDate <= new Date() : true;
                        return (
                          <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{cert.certificate_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{cert.certificate_type}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{cert.issued_by}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm px-2 py-1 rounded-full ${!isExpired ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                {cert.expiry_date || "No expiry"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {/* View */}
                                {cert.file_path && (
                                  <a href={cert.file_path} target="_blank" rel="noopener noreferrer"
                                    title="View"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </a>
                                )}
                                {/* Download */}
                                {cert.file_path && (
                                  <a href={cert.file_path} download
                                    title="Download"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                )}
                                {/* Edit */}
                                <button
                                  title="Edit"
                                  onClick={() => {
                                    setEditingCertificate(cert);
                                    setShowCertificateModal(true);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z" />
                                  </svg>
                                </button>
                                {/* Delete */}
                                <button
                                  title="Delete"
                                  onClick={async () => {
                                    if (!confirm("Delete this certificate?")) return;
                                    const token = localStorage.getItem("token");
                                    const res = await fetch(`${BASE_URL}/certificates/${cert.id}`, {
                                      method: "DELETE",
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (res.ok) {
                                      setCertificates((prev) => prev.filter((c) => c.id !== cert.id));
                                    } else {
                                      alert("Failed to delete certificate");
                                    }
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Certificate Modal */}
            {showCertificateModal && (
              <CreateCertificateModal
                buildingId={id}
                editingData={editingCertificate}
                onClose={() => {
                  setShowCertificateModal(false);
                  setEditingCertificate(null);
                }}
                onCreated={() => {
                  const token = localStorage.getItem("token");
                  fetch(`${BASE_URL}/buildings/${id}/certificates`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((res) => res.json())
                    .then((data) => setCertificates(data.data || []));
                }}
              />
            )}
          </div>

          {/** 🔹 Building Expenses */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Building Expenses</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Record and manage building expenses
                </p>
              </div>


              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full
                 bg-green-600 px-5 text-sm font-semibold text-white shadow-md
                 transition-all duration-200 hover:bg-green-700
                 focus:outline-none focus:ring-2 focus:ring-green-300
                 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add Expense</span>
                  </button>
                </TooltipTrigger>

                <TooltipContent side="top" sideOffset={8}>
                  <p>Add building expenses</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {expenseLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
                <span className="ml-3 text-sm font-medium text-slate-600">Loading expenses...</span>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12 px-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No expenses yet</h3>
                <p className="text-slate-500 text-sm">
                  Add your first expense to start tracking building costs.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
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
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Expense Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Year
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Vendor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 bg-white">
                      {expenses.map((exp) => (
                        <tr
                          key={exp.expense_id}
                          className="hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer"
                          onClick={() => router.push(`/accounts/${exp.expense_id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {exp.expense_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {exp.expense_year || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {exp.expense_type || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {exp.expense_category || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {exp.vendor_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {exp.amount} {exp.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-medium tracking-wide ${exp.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700"
                                : exp.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                                }`}
                            >
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

            {/* Expense Modal */}
            {showExpenseModal && (
              <CreateExpenseModal
                buildingId={id as string}
                onClose={() => setShowExpenseModal(false)}
                onCreated={() => {
                  const token = localStorage.getItem("token");
                  fetch(`${BASE_URL}/expenses/buildings/${id}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then((res) => res.json())
                    .then((data) => setExpenses(data.data || []));
                }}
              />
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

//  here


function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="mt-1 text-sm font-medium text-slate-800">
        {value ?? "—"}
      </span>
    </div>
  );
}