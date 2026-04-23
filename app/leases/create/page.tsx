"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import Select from "react-select";
import { Plus } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Hash } from "lucide-react";

type LeaseForm = {
  building_id: number | "";
   lease_administrator_id?: number | "";
  tenant_legal_name?: string;
  landlord_legal_name?: string;
  lease_type?: string;
  lease_status?: string;
  lease_agreement_date?: string;
  possession_date?: string;
  rent_commencement_date?: string;
  next_rent_review_date?: string;
  termination_date?: string;
  lease_rentable_area?: string;
  primary_use?: string;
  permitted_use?: string;

  measure_units?: string;
  escalation_type?: string;
  security_deposit_type?: string;
  security_deposit_amount?: string;
  portfolio?: string;
  remarks?: string;
};

type Building = {
  id: number;
  building_name: string;
  city?: string;
};

type User = {
  user_id: number;
  username: string;
  email_id?: string;
};

export default function CreateLeasePage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [users, setUsers] = useState<User[]>([]);
const canViewBuildings = hasPermission("BUILDING", "view");
 const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const canCreate = hasPermission("LEASE", "create");

  const [form, setForm] = useState<LeaseForm>({
  building_id: "",
  lease_administrator_id: "",
  lease_agreement_date: null as any,
  possession_date: null as any,
  rent_commencement_date: null as any,
  next_rent_review_date: null as any,
  termination_date: null as any,
});

  // Convert string to Date for datepicker
const getDateObject = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  return new Date(dateString);
};

// Handle date change
const handleDateChange = (date: Date | null, field: keyof LeaseForm) => {
  setForm((prev) => ({
    ...prev,
    [field]: date ? date.toISOString().split("T")[0] : null,
  }));
};

// Toggle manual input
const toggleManualInput = (field: keyof typeof dateInputs.showManual) => {
  setDateInputs((prev) => ({
    ...prev,
    showManual: {
      ...prev.showManual,
      [field]: !prev.showManual[field],
    },
  }));
};

  const [saving, setSaving] = useState(false);

// Date picker states
const [dateInputs, setDateInputs] = useState({
  showManual: {
    lease_agreement_date: false,
    possession_date: false,
    rent_commencement_date: false,
    next_rent_review_date: false,
    termination_date: false,
  },
});

  useEffect(() => {
  if (!canCreate) {
    router.push("/dashboard");
    return;
  }

  if (!canViewBuildings) return;

  const token = sessionStorage.getItem("token");

  fetch(`${BASE_URL}/buildings/names`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(setBuildings)
    .catch(console.error);
}, [canCreate, canViewBuildings, router]);


useEffect(() => {
  const token = sessionStorage.getItem("token");

  fetch(`${BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => setUsers(data.users))
    .catch(console.error);
}, []);


  useEffect(() => {
    if (!canCreate) {
      router.push("/dashboard");
    }
  }, [canCreate, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.building_id) {
      alert("Building is required");
      return;
    }

    setSaving(true);
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/leases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create lease");
      }

      const lease = await res.json();
      router.push(`/leases/${lease.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };
const buildingOptions = buildings.map((b) => ({
  value: b.id,
  label: `${b.building_name}${b.city ? ` (${b.city})` : ""}`,
}));

const userOptions = users.map((u) => ({
  value: u.user_id,
  label: `${u.username}${u.email_id ? ` (${u.email_id})` : ""}`,
}));

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/40 to-indigo-200/40">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-900/10 
      rounded-none p-6 md:p-8 space-y-8 w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
  <Plus className="w-5 h-5 text-blue-600" />
  <h1 className="text-2xl font-semibold text-slate-800">
    Create Lease
  </h1>
</div>

      {/* Building + User */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Basic Setup
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Building */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Building *
            </label>
            <Select
  options={buildingOptions}
  placeholder="Search building..."
  value={buildingOptions.find(
    (b) => b.value === form.building_id
  )}
  onChange={(selected) =>
    setForm((prev) => ({
      ...prev,
      building_id: selected?.value || "",
    }))
  }
  className="mt-1"
  styles={{
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      padding: "2px",
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
      "&:hover": { borderColor: "#3b82f6" },
      backgroundColor: "white",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      padding: "10px",
      cursor: "pointer",
    }),
  }}
/>
          </div>

          {/* User */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Lease Administrator
            </label>
            <Select
              options={userOptions}
              placeholder="Search user..."
              value={userOptions.find(
                (u) => u.value === form.lease_administrator_id
              )}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  lease_administrator_id: selected?.value || "",
                }))
              }
              className="mt-1"
  styles={{
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      padding: "2px",
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
      "&:hover": { borderColor: "#3b82f6" },
      backgroundColor: "white",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      padding: "10px",
      cursor: "pointer",
    }),
  }}
/>
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section title="Basic Information">
        <Input label="Lease Type" name="lease_type" value={form.lease_type} onChange={handleChange} />
        <Input label="Lease Status" name="lease_status" value={form.lease_status} onChange={handleChange} />
        <Input label="Primary Use" name="primary_use" value={form.primary_use} onChange={handleChange} />
        <Input label="Permitted Use" name="permitted_use" value={form.permitted_use} onChange={handleChange} />
      </Section>

      <Section title="Parties">
        <Input label="Tenant Legal Name" name="tenant_legal_name" value={form.tenant_legal_name} onChange={handleChange} />
        <Input label="Landlord Legal Name" name="landlord_legal_name" value={form.landlord_legal_name} onChange={handleChange} />
      </Section>

      <Section title="Key Dates">
        <DateInput 
  label="Agreement Date" 
  field="lease_agreement_date"
  value={form.lease_agreement_date}
  dateInputs={dateInputs}
  toggleManualInput={toggleManualInput}
  handleDateChange={handleDateChange}
  handleChange={handleChange}
  getDateObject={getDateObject}
/>
<DateInput 
  label="Possession Date" 
  field="possession_date"
  value={form.possession_date}
  dateInputs={dateInputs}
  toggleManualInput={toggleManualInput}
  handleDateChange={handleDateChange}
  handleChange={handleChange}
  getDateObject={getDateObject}
/>
<DateInput 
  label="Rent Commencement Date" 
  field="rent_commencement_date"
  value={form.rent_commencement_date}
  dateInputs={dateInputs}
  toggleManualInput={toggleManualInput}
  handleDateChange={handleDateChange}
  handleChange={handleChange}
  getDateObject={getDateObject}
/>
<DateInput 
  label="Next Rent Review Date" 
  field="next_rent_review_date"
  value={form.next_rent_review_date}
  dateInputs={dateInputs}
  toggleManualInput={toggleManualInput}
  handleDateChange={handleDateChange}
  handleChange={handleChange}
  getDateObject={getDateObject}
/>
<DateInput 
  label="Termination Date" 
  field="termination_date"
  value={form.termination_date}
  dateInputs={dateInputs}
  toggleManualInput={toggleManualInput}
  handleDateChange={handleDateChange}
  handleChange={handleChange}
  getDateObject={getDateObject}
/>
      </Section>

      <Section title="Financials">
        <Input label="Rentable Area" name="lease_rentable_area" value={form.lease_rentable_area} onChange={handleChange} />
        <Input label="Measure Units" name="measure_units" value={form.measure_units} onChange={handleChange} />
        <Input label="Security Deposit Type" name="security_deposit_type" value={form.security_deposit_type} onChange={handleChange} />
        <Input label="Security Deposit Amount" name="security_deposit_amount" value={form.security_deposit_amount} onChange={handleChange} />
      </Section>

      <Section title="Additional">
        <Input label="Escalation Type" name="escalation_type" value={form.escalation_type} onChange={handleChange} />
        <Input label="Portfolio" name="portfolio" value={form.portfolio} onChange={handleChange} />
        <Textarea label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} />
      </Section>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white font-semibold text-sm shadow-lg shadow-blue-500/25
          hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
        >
          {saving ? "Creating..." : "Create Lease"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 px-6 rounded-xl bg-white/70 border border-slate-300 text-slate-800 font-semibold text-sm shadow-md
          hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);
}



function DateInput({ 
  label, 
  field, 
  value, 
  dateInputs, 
  toggleManualInput, 
  handleDateChange, 
  handleChange,
  getDateObject 
}: any) {
  const isManual = dateInputs.showManual[field as keyof typeof dateInputs.showManual];

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {isManual ? (
          <input
            type="date"
            name={field}
            value={value || ""}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm transition cursor-pointer pr-12"
          />
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Click calendar or type date (DD/MM/YYYY)"
              value={value ? new Date(value).toLocaleDateString('en-GB') : ""}
              readOnly
              onClick={() => {
  const el = document.getElementById(field as string) as HTMLInputElement | null;
  el?.showPicker?.();
}}
              className="w-full px-3 py-2.5 pr-12 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm transition cursor-pointer"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        )}
        <button
          type="button"
          onClick={() => toggleManualInput(field as keyof typeof dateInputs.showManual)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition"
          title={isManual ? "Switch to Calendar" : "Switch to Manual Input"}
        >
          {isManual ? <Calendar className="h-4 w-4 text-blue-500" /> : <Hash className="h-3 w-3 text-slate-400" />}
        </button>
      </div>
      <div className={`text-xs ${isManual ? 'text-green-600' : 'text-blue-600'}`}>
        {isManual ? 'Manual input • Click calendar icon to switch' : 'Calendar picker • Click # for manual typing'}
      </div>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */

function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Input({ label, type, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        {...props}
        className={`w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm transition
        ${type === "date" ? "cursor-pointer" : ""}`}
      />
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div className="md:col-span-2 space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        {...props}
        rows={4}
        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm transition"
      />
    </div>
  );
}
