"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Lease = {
  building_id: number;
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

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token || !canEdit) {
      router.push("/dashboard");
      return;
    }

    fetch(`${BASE_URL}/leases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setForm)
      .finally(() => setLoading(false));
  }, [id, router, canEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    setSaving(true);
    const token = sessionStorage.getItem("token");

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
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Lease</h1>

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
          label="Agreement Date"
          type="date"
          name="lease_agreement_date"
          value={form.lease_agreement_date}
          onChange={handleChange}
        />
        <Input
          label="Possession Date"
          type="date"
          name="possession_date"
          value={form.possession_date}
          onChange={handleChange}
        />
        <Input
          label="Termination Date"
          type="date"
          name="termination_date"
          value={form.termination_date}
          onChange={handleChange}
        />
      </Section>

      {/* Terms */}
      <Section title="Terms">
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
          label="Security Deposit Amount"
          name="security_deposit_amount"
          value={form.security_deposit_amount}
          onChange={handleChange}
        />
      </Section>

      {/* Notes */}
      <Section title="Remarks">
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
          {saving ? "Saving..." : "Save Changes"}
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
