"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/app/lib/permission";
import { useParams, useRouter } from "next/navigation";

type Building = {
  building_name: string;
  address_1?: string;
  city?: string;
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

export default function EditBuildingPage() {
  const { id } = useParams();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [form, setForm] = useState<Building>({
    building_name: "",
    address_1: "",
    city: "",
    country: "",
    building_status: "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasPermission("BUILDING", "edit")) {
      router.replace("/buildings");
    }
  }, [router]);
  /* Fetch building details */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/buildings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const buildingData = data.building ?? data;
        setForm(buildingData);
      })
      .catch(() => router.push("/buildings"))
      .finally(() => setLoading(false));
  }, [id, router]);

  /* Handle form change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* Submit update */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = sessionStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/buildings/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push(`/buildings/${id}`);
    } else {
      alert("Update failed");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading building...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">✏️ Edit Building</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <Input label="System Building ID" name="system_building_id" value={form.system_building_id || ""} onChange={handleChange} />
        <Input label="SIO" name="sio" value={form.sio || ""} onChange={handleChange} />
        <Input label="CLLI" name="clli" value={form.clli || ""} onChange={handleChange} />
        <Input label="Building Name" name="building_name" value={form.building_name} onChange={handleChange} required />
        <Input label="Building Type" name="building_type" value={form.building_type || ""} onChange={handleChange} />

        <Input label="Address" name="address_1" value={form.address_1 || ""} onChange={handleChange} />
        <Input label="City" name="city" value={form.city || ""} onChange={handleChange} />
        <Input label="Zip Code" name="zip_code" value={form.zip_code || ""} onChange={handleChange} />
        <Input label="Country" name="country" value={form.country || ""} onChange={handleChange} />

        <Input label="Latitude" name="latitude" value={form.latitude || ""} onChange={handleChange} />
        <Input label="Longitude" name="longitude" value={form.longitude || ""} onChange={handleChange} />
        <Input label="Geocode Latitude" name="geocode_latitude" value={form.geocode_latitude || ""} onChange={handleChange} />
        <Input label="Geocode Longitude" name="geocode_longitude" value={form.geocode_longitude || ""} onChange={handleChange} />

        <Input label="Latitude" name="latitude" value={form.latitude || ""} onChange={handleChange} />
        <Input label="Longitude" name="longitude" value={form.longitude || ""} onChange={handleChange} />
        <Input label="Geocode Latitude" name="geocode_latitude" value={form.geocode_latitude || ""} onChange={handleChange} />
        <Input label="Geocode Longitude" name="geocode_longitude" value={form.geocode_longitude || ""} onChange={handleChange} />

        <Input label="Purchase Price" name="purchase_price" value={form.purchase_price || ""} onChange={handleChange} />
        <Input label="Currency Type" name="currency_type" value={form.currency_type || ""} onChange={handleChange} />

        <Input label="Ownership Type" name="ownership_type" value={form.ownership_type || ""} onChange={handleChange} />
        <Input label="Managed By" name="managed_by" value={form.managed_by || ""} onChange={handleChange} />
        <Input label="Portfolio" name="portfolio" value={form.portfolio || ""} onChange={handleChange} />
        <Input label="Portfolio Sub Group" name="portfolio_sub_group" value={form.portfolio_sub_group || ""} onChange={handleChange} />

        <select
          name="building_status"
          value={form.building_status || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Holdover">Holdover</option>
          <option value="Terminated">Terminated</option>
        </select>


        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Saving..." : "Save Changes"}
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

/* Reusable input */
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
