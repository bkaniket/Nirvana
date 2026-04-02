"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/app/lib/permission";
import { useParams, useRouter } from "next/navigation";
import { Edit2 } from "lucide-react";

type Building = {
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

export default function EditBuildingPage() {
  const { id } = useParams();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [form, setForm] = useState<Building>({
    building_name: "",
    address_1: "",
    city: "",
    state: "",
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

  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/40 to-indigo-200/40 flex items-center justify-center">
      <div className="flex flex-row gap-2 p-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl">
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
}

  return (
  <div className="
    min-h-screen 
    bg-gradient-to-br from-slate-100 via-blue-100/40 to-indigo-200/40
    p-0
  ">
      

      <form
      
  onSubmit={handleSubmit}
  className="
    bg-white/90 
    backdrop-blur-xl 
    border border-slate-200 
    shadow-xl shadow-slate-900/10 
    rounded-none 
    p-6 md:p-8 
    space-y-8 
    w-full h-full
  ">
  <div className="flex items-center gap-2 mb-7">
  <Edit2 className="w-5 h-5 text-blue-600" />
  <h1 className="text-2xl font-semibold text-slate-800">
    Edit Building
  </h1>
</div>

        {/* <Input label="System Building ID" name="system_building_id" value={form.system_building_id || ""} onChange={handleChange} />
        <Input label="SIO" name="sio" value={form.sio || ""} onChange={handleChange} />
        <Input label="CLLI" name="clli" value={form.clli || ""} onChange={handleChange} /> */}
       <div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Basic Information</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Building Name" name="building_name" value={form.building_name} onChange={handleChange} required />
    <Input label="Building Type" name="building_type" value={form.building_type || ""} onChange={handleChange} />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Location Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Address" name="address_1" value={form.address_1 || ""} onChange={handleChange} />
    <Input label="City" name="city" value={form.city || ""} onChange={handleChange} />
    <Input label="State" name="state" value={form.state || ""} onChange={handleChange} />
    <Input label="Zip Code" name="zip_code" value={form.zip_code || ""} onChange={handleChange} />
    <Input label="Country" name="country" value={form.country || ""} onChange={handleChange} />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Geographical Coordinates</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Latitude" name="latitude" value={form.latitude || ""} onChange={handleChange} />
    <Input label="Longitude" name="longitude" value={form.longitude || ""} onChange={handleChange} />
    <Input label="Geocode Latitude" name="geocode_latitude" value={form.geocode_latitude || ""} onChange={handleChange} />
    <Input label="Geocode Longitude" name="geocode_longitude" value={form.geocode_longitude || ""} onChange={handleChange} />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Property Specifications</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Construction Year" name="construction_year" value={form.construction_year || ""} onChange={handleChange} />
    <Input label="Last Renovation Year" name="last_renovation_year" value={form.last_renovation_year || ""} onChange={handleChange} />
    <Input label="Rentable Area" name="building_rentable_area" value={form.building_rentable_area || ""} onChange={handleChange} />
    <Input label="Measurement Unit" name="building_measure_units" value={form.building_measure_units || ""} onChange={handleChange} />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Financial Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Purchase Price" name="purchase_price" value={form.purchase_price || ""} onChange={handleChange} />
    <Input label="Currency Type" name="currency_type" value={form.currency_type || ""} onChange={handleChange} />
  </div>
</div>

<div>
  <h2 className="text-lg font-semibold text-slate-900 mb-3">Ownership & Management</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Ownership Type" name="ownership_type" value={form.ownership_type || ""} onChange={handleChange} />
    <Input label="Managed By" name="managed_by" value={form.managed_by || ""} onChange={handleChange} />
    <Input label="Portfolio" name="portfolio" value={form.portfolio || ""} onChange={handleChange} />
    <Input label="Portfolio Sub Group" name="portfolio_sub_group" value={form.portfolio_sub_group || ""} onChange={handleChange} />
  </div>
</div>
{/* Radio dropdown  */}
        <div className="md:col-span-2">
  <h2 className="text-lg font-semibold text-slate-900 mb-3">
    Building Status
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
    {["Active", "Inactive", "Holdover", "Terminated"].map((status) => (
      <label
        key={status}
        className={`cursor-pointer rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all duration-200 border-2 backdrop-blur-sm shadow-sm ${
          form.building_status === status
            ? status === "Active" 
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-800 shadow-emerald-500/25 ring-2 ring-emerald-400/50"
              : status === "Inactive" 
              ? "bg-slate-500/20 border-slate-500 text-slate-900 shadow-slate-500/25 ring-2 ring-slate-400/50"
              : status === "Holdover" 
              ? "bg-amber-500/20 border-amber-500 text-amber-900 shadow-amber-500/25 ring-2 ring-amber-400/50"
              : "bg-red-500/20 border-red-500 text-red-900 shadow-red-500/25 ring-2 ring-red-400/50"
            : "bg-white/70 border-slate-300 hover:border-slate-400 hover:shadow-md hover:shadow-slate-200 text-slate-800 hover:bg-white/90"
        }`}
      >
        {status}
        <input
          type="radio"
          name="building_status"
          value={status}
          checked={form.building_status === status}
          onChange={handleChange}
          className="accent-blue-500 w-4 h-4 rounded-full shadow-md hover:scale-110 transition-all"
        />
      </label>
    ))}
  </div>
</div>


        <div className="flex justify-end gap-3 pt-4 items-center">
  <button
    type="submit"
    disabled={saving}
    className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 border border-blue-400/50 backdrop-blur-sm
    hover:from-blue-500 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/40 hover:border-blue-400/70
    active:translate-y-0 active:shadow-md active:shadow-blue-500/30 active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md disabled:shadow-blue-500/10 transition-all duration-200"
  >
    {saving ? "Saving..." : "Save Changes"}
  </button>

  <div className="bg-gradient-to-b from-stone-000/40 to-transparent p-[4px] rounded-[16px]">
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
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="
          w-full px-3 py-2.5 rounded-xl
          bg-white
          border border-slate-300
          text-slate-900
          placeholder:text-slate-400
          focus:outline-none
          focus:ring-2 focus:ring-blue-500/40
          focus:border-blue-500
          shadow-sm
          transition
        "
      />
    </div>
  );
}
