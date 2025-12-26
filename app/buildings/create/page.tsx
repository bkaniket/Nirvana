"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permissions";

export default function CreateBuildingPage() {
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    building_name: "",
    address_1: "",
    city: "",
    country: "",
    ownership_type: "",
    managed_by: "",
    building_status: "Active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/buildings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/buildings");
    } else {
      const err = await res.json();
      alert(err.message || "Failed to create building");
    }

    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">➕ Create Building</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <Input
          label="Building Name"
          name="building_name"
          value={form.building_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Address"
          name="address_1"
          value={form.address_1}
          onChange={handleChange}
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
        />

        <Input
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
        />

        <Input
          label="Ownership Type"
          name="ownership_type"
          value={form.ownership_type}
          onChange={handleChange}
        />

        <Input
          label="Managed By"
          name="managed_by"
          value={form.managed_by}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Building Status
          </label>
          <select
            name="building_status"
            value={form.building_status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Creating..." : "Create Building"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable input component */
function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}
