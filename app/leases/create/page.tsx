"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type LeaseForm = {
  building_id: number | "";
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

type Building = {
  id: number;
  building_name: string;
  city?: string;
};

export default function CreateLeasePage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
const canViewBuildings = hasPermission("BUILDING", "view");

  const canCreate = hasPermission("LEASE", "create");

  const [form, setForm] = useState<LeaseForm>({
    building_id: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (!canCreate) {
    router.push("/dashboard");
    return;
  }

  if (!canViewBuildings) return;

  const token = sessionStorage.getItem("token");

  fetch("http://127.0.0.1:8000/api/buildings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(setBuildings)
    .catch(console.error);
}, [canCreate, canViewBuildings, router]);


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
      const res = await fetch("http://127.0.0.1:8000/api/leases", {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Lease</h1>

      {/* Basic */}
      <div>
  <label className="text-sm text-gray-600">Building *</label>
  <select
    className="w-full border px-3 py-2 rounded mt-1"
    value={form.building_id}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        building_id: Number(e.target.value),
      }))
    }
  >
    <option value="">Select Building</option>
    {buildings.map((b) => (
      <option key={b.id} value={b.id}>
        {b.building_name} {b.city ? `(${b.city})` : ""}
      </option>
    ))}
  </select>
</div>

      <Section title="Basic Information">
        
        <Input
          label="Lease Type"
          name="lease_type"
          value={form.lease_type}
          onChange={handleChange}
        />
        <Input
          label="Lease Status"
          name="lease_status"
          value={form.lease_status}
          onChange={handleChange}
        />
      </Section>

      {/* Parties */}
      <Section title="Parties">
        <Input
          label="Tenant Legal Name"
          name="tenant_legal_name"
          value={form.tenant_legal_name}
          onChange={handleChange}
        />
        <Input
          label="Landlord Legal Name"
          name="landlord_legal_name"
          value={form.landlord_legal_name}
          onChange={handleChange}
        />
      </Section>

      {/* Dates */}
      <Section title="Key Dates">
        <Input
          type="date"
          label="Agreement Date"
          name="lease_agreement_date"
          value={form.lease_agreement_date}
          onChange={handleChange}
        />
        <Input
          type="date"
          label="Possession Date"
          name="possession_date"
          value={form.possession_date}
          onChange={handleChange}
        />
        <Input
          type="date"
          label="Rent Commencement Date"
          name="rent_commencement_date"
          value={form.rent_commencement_date}
          onChange={handleChange}
        />
        <Input
          type="date"
          label="Termination Date"
          name="termination_date"
          value={form.termination_date}
          onChange={handleChange}
        />
      </Section>

      {/* Financials */}
      <Section title="Financials">
        <Input
          label="Rentable Area"
          name="lease_rentable_area"
          value={form.lease_rentable_area}
          onChange={handleChange}
        />
        <Input
          label="Measure Units"
          name="measure_units"
          value={form.measure_units}
          onChange={handleChange}
        />
        <Input
          label="Security Deposit Type"
          name="security_deposit_type"
          value={form.security_deposit_type}
          onChange={handleChange}
        />
        <Input
          label="Security Deposit Amount"
          name="security_deposit_amount"
          value={form.security_deposit_amount}
          onChange={handleChange}
        />
      </Section>

      {/* Additional */}
      <Section title="Additional">
        <Input
          label="Escalation Type"
          name="escalation_type"
          value={form.escalation_type}
          onChange={handleChange}
        />
        <Input
          label="Portfolio"
          name="portfolio"
          value={form.portfolio}
          onChange={handleChange}
        />
        <Textarea
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
        />
      </Section>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "Creating..." : "Create Lease"}
        </button>

        <button
          className="px-6 py-2 bg-gray-400 text-white rounded"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full border px-3 py-2 rounded mt-1"
      />
    </div>
  );
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="md:col-span-2">
      <label className="text-sm text-gray-600">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full border px-3 py-2 rounded mt-1"
      />
    </div>
  );
}
