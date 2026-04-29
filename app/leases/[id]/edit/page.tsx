"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Save, ArrowLeft, Building2, FileText, Users, Key, DollarSign, FileText as FileTextIcon, Users2, Scale } from "lucide-react";
import { ChevronDown } from "lucide-react";

import { hasPermission } from "@/app/lib/permission";

type Lease = {
  building_id: number;
  lease_administrator_id?: number;
  tenant_legal_name?: string;
  landlord_legal_name?: string;
  lease_type?: string;
  lease_status?: string;
  lease_agreement_date?: string;
  possession_date?: string;
  rent_commencement_date?: string;
  termination_date?: string;
  lease_rentable_area?: string;
  measure_units?: string;
  escalation_type?: string;
  security_deposit_type?: string;
  security_deposit_amount?: string;
  portfolio?: string;
  remarks?: string;
};

export default function EditLeasePage() {
  const { id } = useParams();
  const router = useRouter();

  const canEdit = hasPermission("LEASE", "edit");
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [form, setForm] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !canEdit) {
      router.push("/dashboard");
      return;
    }

    Promise.all([
      fetch(`${BASE_URL}/leases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([leaseData, usersData]) => {
        setForm(leaseData.lease || leaseData);
        setUsers(usersData.users);
      })
      .finally(() => setLoading(false));
  }, [id, router, canEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    setSaving(true);
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/leases/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setSaving(false);
    router.push(`/leases/${id}`);
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="space-y-6 rounded-3xl bg-white/70 backdrop-blur-xl p-8 shadow-2xl border border-white/50">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-xl w-48 animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-2xl w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
     className="
  bg-white/90 
  backdrop-blur-xl 
  border border-slate-200 
  shadow-sm
  rounded-none 
  px-4 md:px-6 
  py-5
  space-y-6
  w-full
"
>
  
        {/* Header */}
       
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col">
              
             <div className="flex items-center gap-2 mb-4">
  <FileText className="w-5 h-5 text-blue-600" />
  <h1 className="text-2xl font-semibold text-slate-800">
    Edit Lease
  </h1>
</div>
              </div>
            {/* SAVE BUTTON */}
  {/* <button
    type="submit"
    disabled={saving}
    className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Save className="h-5 w-5" />
    {saving ? "Saving..." : "Save Lease"}
  </button> */}
      </div>
    
    {/* FORM CONTENT START */}

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-2">Basic Information</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Input
      label="Tenant Name"
      name="tenant_legal_name"
      value={form.tenant_legal_name || ""}
      onChange={handleChange}
    />
    <Input
      label="Landlord Name"
      name="landlord_legal_name"
      value={form.landlord_legal_name || ""}
      onChange={handleChange}
    />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-2">Lease Info</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SelectField
      label="Lease Type"
      name="lease_type"
      value={form.lease_type || ""}
      onChange={handleChange}
      options={["Commercial", "Residential"]}
    />

    <SelectField
      label="Status"
      name="lease_status"
      value={form.lease_status || ""}
      onChange={handleChange}
      options={["Active", "Inactive"]}
    />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-2">Dates</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Input
      type="date"
      label="Agreement Date"
      name="lease_agreement_date"
      value={form.lease_agreement_date || ""}
      onChange={handleChange}
    />
    <Input
      type="date"
      label="Termination Date"
      name="termination_date"
      value={form.termination_date || ""}
      onChange={handleChange}
    />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-">Remarks</h2>
  <Textarea
    label="Remarks"
    name="remarks"
    value={form.remarks || ""}
    onChange={handleChange}
  />
</div>

{/* FORM CONTENT END */}
<div className="flex justify-end gap-3 pt-4 items-center">
  <button
    type="submit"
    disabled={saving}
    className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 border border-blue-400/50 backdrop-blur-sm
    hover:from-blue-500 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/40 hover:border-blue-400/70
    active:translate-y-0 active:shadow-md active:shadow-blue-500/30 active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
  >
    {saving ? "Saving..." : "Save Lease"}
  </button>

  <button
    type="button"
    onClick={() => router.back()}
    className="
      h-12 px-6 rounded-xl
      bg-white/70 
      backdrop-blur-md
      border border-slate-300/50 
      text-slate-800 
      font-semibold text-sm
      shadow-md
      hover:bg-red-50 
      hover:border-red-400/60
      hover:text-red-600 
      active:scale-[0.97] active:bg-red-100 
      transition-all duration-200
    "
  >
    Cancel
  </button>
</div>
    </form>



</div>
);
}

 // Reusable Components
function Section({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
   <section className={`bg-white rounded-2xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="mb-8 flex items-start gap-3">
        <div className="mt-1 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-3 shadow-lg border border-white/50">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {description && (
            <p className="mt-2 text-slate-600 leading-relaxed max-w-lg">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const isDate = type === "date";

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 tracking-tight">{label}</label>
      <div className="group">
        <div className="relative">
          {isDate && (
           <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          )}
          <input
            type={type}
            {...props}
            className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400 ${
  isDate ? "pl-12 pr-4" : "px-4"
}`}
          />
        </div>
        {isDate && (
          <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3 -mt-0.5" />
            Click calendar or type date manually (YYYY-MM-DD)
          </p>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  options: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          
        >
          <span className={`${!value ? "text-gray-400" : ""}`}>
            {value
  ? value.charAt(0).toUpperCase() + value.slice(1)
  : "Select"}
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange({
                    target: { name, value: opt },
                  });
                  setOpen(false);
                }}
                className="
px-3 py-2 text-sm text-slate-800
hover:bg-white/60 hover:text-blue-600
cursor-pointer
transition-all duration-150
"
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 tracking-tight">
        {label}
      </label>
      <textarea
        {...props}
        rows={5}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 resize-vertical focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400 transition-all duration-200 min-h-[120px]"
      />
    </div>
  );
}