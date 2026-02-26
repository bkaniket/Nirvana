"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

export default function CreateBuildingPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [form, setForm] = useState({
    building_name: "",
    address_1: "",
    city: "",
    country: "",
    state: "",
    building_status: "Active",
    ownership_type: "",
    managed_by: "",
    clli: "",
    sio: "",
    zip_code: "",
    system_building_id: "",
    building_type: "",
    construction_year: "",
    last_renovation_year: "",
    building_rentable_area: "",
    building_measure_units: "",
    purchase_price: "",
    currency_type: "",
    portfolio: "",
    portfolio_sub_group: "",
    latitude: "",
    longitude: "",
    geocode_latitude: "",
    geocode_longitude: "",
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

    const res = await fetch(`${BASE_URL}/buildings`, {
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
        <div className="border-b pb-2 font-semibold">Basic Information</div>

        <Input label="System Building ID" name="system_building_id" value={form.system_building_id} onChange={handleChange} />
        <Input label="Building Name" name="building_name" value={form.building_name} onChange={handleChange} required />
        <Input label="CLLI" name="clli" value={form.clli} onChange={handleChange} />
        <Input label="SIO" name="sio" value={form.sio} onChange={handleChange} />
        <Input label="Building Type" name="building_type" value={form.building_type} onChange={handleChange} />

        <div className="border-b pb-2 font-semibold mt-6">Location Details</div>

        <Input label="Address" name="address_1" value={form.address_1} onChange={handleChange} />
        <Input label="City" name="city" value={form.city} onChange={handleChange} />
        <Input label="State" name="state" value={form.state} onChange={handleChange} />
        <Input label="Zip Code" name="zip_code" value={form.zip_code} onChange={handleChange} />
        <Input label="Country" name="country" value={form.country} onChange={handleChange} />

        <div className="border-b pb-2 font-semibold mt-6">Geographical Coordinates</div>

        <Input label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} />
        <Input label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} />
        <Input label="Geocode Latitude" name="geocode_latitude" value={form.geocode_latitude} onChange={handleChange} />
        <Input label="Geocode Longitude" name="geocode_longitude" value={form.geocode_longitude} onChange={handleChange} />

        <div className="border-b pb-2 font-semibold mt-6">Property Specifications</div>

        <Input label="Construction Year" name="construction_year" value={form.construction_year} onChange={handleChange} />
        <Input label="Last Renovation Year" name="last_renovation_year" value={form.last_renovation_year} onChange={handleChange} />
        <Input label="Rentable Area" name="building_rentable_area" value={form.building_rentable_area} onChange={handleChange} />
        <Input label="Measurement Unit" name="building_measure_units" value={form.building_measure_units} onChange={handleChange} />

        <div className="border-b pb-2 font-semibold mt-6">Financial Details</div>

        <Input label="Purchase Price" name="purchase_price" value={form.purchase_price} onChange={handleChange} />
        <Input label="Currency Type" name="currency_type" value={form.currency_type} onChange={handleChange} />

        <div className="border-b pb-2 font-semibold mt-6">Ownership & Management</div>

        <Input label="Ownership Type" name="ownership_type" value={form.ownership_type} onChange={handleChange} />
        <Input label="Managed By" name="managed_by" value={form.managed_by} onChange={handleChange} />
        <Input label="Portfolio" name="portfolio" value={form.portfolio} onChange={handleChange} />
        <Input label="Portfolio Sub Group" name="portfolio_sub_group" value={form.portfolio_sub_group} onChange={handleChange} />

        <div className="mt-4">
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
            <option value="Holdover">Holdover</option>
            <option value="Terminated">Terminated</option>
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
