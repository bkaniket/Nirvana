"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { Building2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Building = {
  id: number;
  building_name: string;
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
};

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
    <div className={`rounded-2xl border transition-all duration-300 
    ${open 
      ? "bg-blue-50/60 border-blue-200 shadow-md" 
      : "bg-white/70 border-gray-300 hover:bg-gray-50"} 
    backdrop-blur-xl`}>

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex justify-between items-center"
      >
        <span className="text-base font-semibold text-gray-900">
          {title}
        </span>

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

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 grid gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

function CreateExpenseModal({
  buildingId,
  onClose,
  onCreated,
}: {
  buildingId: string | string[];
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
        building_id: buildingId,
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
      
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">

        {/* 🔹 Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add Expense
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Record and manage building expenses
              </p>
            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 🔹 Body */}
        <div className="space-y-5 px-6 py-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Expense Year"
              placeholder="e.g. 2026"
              value={form.expense_year}
              onChange={(v) => handleChange("expense_year", v)}
            />

            <InputField
              label="Expense Type"
              placeholder="Electricity, Rent..."
              value={form.expense_type}
              onChange={(v) => handleChange("expense_type", v)}
            />

            <InputField
              label="Category"
              placeholder="Rent / Non-Rent"
              value={form.expense_category}
              onChange={(v) => handleChange("expense_category", v)}
            />

            <InputField
              label="Vendor Name"
              placeholder="Vendor / Company"
              value={form.vendor_name}
              onChange={(v) => handleChange("vendor_name", v)}
            />

            <InputField
              label="Amount"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(v) => handleChange("amount", v)}
            />

            <InputField
              label="Currency"
              placeholder="INR"
              value={form.currency}
              onChange={(v) => handleChange("currency", v)}
            />

          </div>
        </div>

        {/* 🔹 Footer */}
       <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
  <button
    onClick={handleCreate}
    disabled={loading}
    className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
  >
    {loading ? "Saving..." : "Save Expense"}
  </button>

  <button
    onClick={onClose}
    className="h-11 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 cursor-pointer"
  >
    Cancel
  </button>
</div>
      </div>
    </div>
  );
}
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function CreateCertificateModal({
  buildingId,
  onClose,
  onCreated,
}: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [form, setForm] = useState({
    certificate_name: "",
    certificate_type: "",
    issued_by: "",
    expiry_date: "",
    status: "pending",
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files[]", file);
      });
    }

    setLoading(true);

    const res = await fetch(
      `${BASE_URL}/buildings/${buildingId}/certificates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    setLoading(false);

    if (!res.ok) {
      alert("Failed to upload certificate");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Certificate</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload and manage a new building certificate
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Certificate Name
              </label>
              <input
                placeholder="Enter certificate name"
                value={form.certificate_name}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("certificate_name", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Certificate Type
              </label>
              <input
                placeholder="Enter type"
                value={form.certificate_type}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("certificate_type", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Issued By
              </label>
              <input
                placeholder="Authority / Organization"
                value={form.issued_by}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("issued_by", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiry_date}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(e) => handleChange("expiry_date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Upload File
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50">
  <input
    type="file"
    multiple
    onChange={(e) => setFiles(e.target.files)}
    className="hidden"
    id="fileUpload"
  />

  <label
    htmlFor="fileUpload"
    className="cursor-pointer flex flex-col items-center gap-2"
  >
    <div className="h-12 px-6 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition">
      Choose Files
    </div>

    <p className="text-sm text-slate-500">
      Upload one or more certificate files
    </p>
  </label>

  {files && (
    <p className="text-xs text-slate-600 mt-2">
      {files.length} file(s) selected
    </p>
  )}
</div>
          </div>
        </div>

        {/* Footer */}
       <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
  <button
    onClick={handleCreate}
    disabled={loading}
    className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
  >
    {loading ? "Uploading..." : "Save Certificate"}
  </button>

  <button
    onClick={onClose}
    className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
  >
    Cancel
  </button>
</div>
      </div>
    </div>
  );
}

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
const [showCertificateModal, setShowCertificateModal] = useState(false);
  const canEdit = hasPermission("BUILDING", "edit");
useEffect(() => {
  const token = sessionStorage.getItem("token");
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
  <button
    className="h-12 w-44 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98] cursor-pointer"
    onClick={() => router.push(`/buildings/${id}/edit`)}
  >
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4 20l1.537-4.25L16.862 3.487z"
      />
    </svg>
    Edit Building
  </button>
)}
    </div>

     {/* 🔹 Workflow / Approval Info */}
{workflow && (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Approval Workflow</h2>
        <p className="text-sm text-slate-500">Current review and approval details</p>
      </div>

      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          workflow.status === "APPROVED"
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        }`}
      >
        <span
          className={`mr-2 h-2 w-2 rounded-full ${
            workflow.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        {workflow.status === "APPROVED" ? "Approved" : "Approval Pending"}
      </span>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Status
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {workflow.status === "APPROVED" ? "Approved" : "Approval Pending"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Created By
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {workflow.created_by?.name || "Not available"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Approved By
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {typeof workflow.approved_by === "string"
            ? workflow.approved_by
            : workflow.approved_by?.name || "Pending"}
        </p>
      </div>
    </div>
  </div>
)}

      <div className="space-y-6">
        {/* 🔹 Basic Identification */}
        <CollapsibleSection  title="Basic Information" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <Detail label="System Building ID" value={building.system_building_id} /> */}
            <Detail label="Building Name" value={building.building_name} />
            {/* <Detail label="CLLI" value={building.clli} />
            <Detail label="SIO" value={building.sio} /> */}
            <Detail label="Building Type" value={building.building_type} />
            <Detail label="Building Status" value={building.building_status} />
          </div>
        </CollapsibleSection>
        {/* 🔹 Location & Address */}
        <CollapsibleSection  title="Location Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Address" value={building.address_1} />
            <Detail label="City" value={building.city} />
            <Detail label="State" value={building.state} />
            <Detail label="Zip Code" value={building.zip_code} />
            <Detail label="Country" value={building.country} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Coordinates */}
        <CollapsibleSection  title="Geographical Coordinates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Latitude" value={building.latitude} />
            <Detail label="Longitude" value={building.longitude} />
            <Detail label="Geocode Latitude" value={building.geocode_latitude} />
            <Detail label="Geocode Longitude" value={building.geocode_longitude} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Property Specifications */}
        <CollapsibleSection  title="Property Specifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Construction Year" value={building.construction_year} />
            <Detail
              label="Last Renovation Year"
              value={building.last_renovation_year || "Not Yet Renovated"}
            />
            <Detail label="Rentable Area" value={building.building_rentable_area} />
            <Detail label="Measurement Unit" value={building.building_measure_units} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Financial Details */}
        <CollapsibleSection  title="Financial Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Purchase Price" value={building.purchase_price} />
            <Detail label="Currency Type" value={building.currency_type} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Ownership & Management */}
        <CollapsibleSection  title="Ownership & Management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Ownership Type" value={building.ownership_type} />
            <Detail label="Managed By" value={building.managed_by} />
            <Detail label="Portfolio" value={building.portfolio} />
            <Detail label="Portfolio Sub Group" value={building.portfolio_sub_group} />
          </div>
        </CollapsibleSection>

      </div>

           {leases && leases.length > 0 && (
        <div className="space-y-2 mt-4">
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
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        lease.lease_status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
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
      )}

<div>
  {/** 🔹 Certificates & Compliance */}
  <div className="space-y-6 p-6">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Certificates</h2>
          <p className="text-sm text-slate-500 mt-1">Upload and manage a new building certificate</p>
        </div>

        <button
          className="h-12 w-48 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          onClick={() => setShowCertificateModal(true)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Certificate
        </button>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Issued by
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Expiry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    File
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 bg-white">
                {certificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{cert.certificate_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {cert.certificate_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {cert.issued_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          new Date(cert.expiry_date) > new Date()
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {cert.expiry_date}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cert.file_path ? (
                        <a
                          href={cert.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CreateCertificateModal
          buildingId={id}
          onClose={() => setShowCertificateModal(false)}
          onCreated={() => {
            const token = sessionStorage.getItem("token");
            fetch(`${BASE_URL}/buildings/${id}/certificates`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Building Expenses</h2>
          <p className="text-sm text-slate-500 mt-1">
            Record and manage building expenses
          </p>
        </div>


        <button
          className="h-12 w-48 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          onClick={() => setShowExpenseModal(true)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </button>
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
                        className={`text-xs px-3 py-1.5 rounded-full font-medium tracking-wide ${
                          exp.status === "APPROVED"
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
            const token = sessionStorage.getItem("token");
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