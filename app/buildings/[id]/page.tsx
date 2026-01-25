"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Building = {
  id: number;
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

export default function BuildingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [building, setBuilding] = useState<Building | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
const canEdit   = hasPermission("BUILDING", "edit");
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/buildings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
  console.log("Building details:", data);
  setBuilding(data.building);
  setWorkflow(data.workflow);
   setLeases(data.leases || []);
})
      .catch(() => router.push("/buildings"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <p className="text-gray-500">Loading building details...</p>;
  }

  if (!building) {
    return <p className="text-red-500">Building not found</p>;
  }

  return (
    <div className="space-y-6">
     <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Building Details</h1>

        {canEdit && (
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => router.push(`/buildings/${id}/edit`)}
          >
            ✏️ Edit Building
          </button>
        )}

      </div>
{/* 🔹 Workflow / Approval Info */}
{workflow && (
  <div className="bg-white p-6 rounded shadow border-l-4
    border-blue-500 space-y-2">

    <h2 className="text-lg font-semibold">Approval Workflow</h2>

    <p>
      <strong>Status:</strong>{" "}
      {workflow.status === "APPROVED" ? (
        <span className="text-green-600 font-semibold">✅ Approved</span>
      ) : (
        <span className="text-yellow-600 font-semibold">⏳ Approval Pending</span>
      )}
    </p>

    <p>
      <strong>Created By:</strong>{" "}
      {workflow.created_by?.name || "-"}
    </p>

    <p>
      <strong>Approved By:</strong>{" "}
      {typeof workflow.approved_by === "string"
        ? workflow.approved_by
        : workflow.approved_by?.name || "Approval Pending"}
    </p>
  </div>
)}
   {/* 🔹 Basic Identification */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="System Building ID" value={building.system_building_id} />
    <Detail label="Building Name" value={building.building_name} />
    <Detail label="CLLI" value={building.clli} />
    <Detail label="SIO" value={building.sio} />
    <Detail label="Building Type" value={building.building_type} />
    <Detail label="Building Status" value={building.building_status} />
  </div>
</div>

{/* 🔹 Location & Address */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Location Details</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="Address" value={building.address_1} />
    <Detail label="City" value={building.city} />
    <Detail label="Zip Code" value={building.zip_code} />
    <Detail label="Country" value={building.country} />
  </div>
</div>

{/* 🔹 Coordinates */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Geographical Coordinates</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="Latitude" value={building.latitude} />
    <Detail label="Longitude" value={building.longitude} />
    <Detail label="Geocode Latitude" value={building.geocode_latitude} />
    <Detail label="Geocode Longitude" value={building.geocode_longitude} />
  </div>
</div>

{/* 🔹 Property Specifications */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Property Specifications</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="Construction Year" value={building.construction_year} />
    <Detail
      label="Last Renovation Year"
      value={building.last_renovation_year || "Not Yet Renovated"}
    />
    <Detail label="Rentable Area" value={building.building_rentable_area} />
    <Detail label="Measurement Unit" value={building.building_measure_units} />
  </div>
</div>

{/* 🔹 Financial Details */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Financial Details</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="Purchase Price" value={building.purchase_price} />
    <Detail label="Currency Type" value={building.currency_type} />
  </div>
</div>

{/* 🔹 Ownership & Management */}
<div className="bg-white p-6 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold border-b pb-2">Ownership & Management</h2>

  <div className="grid grid-cols-2 gap-4">
    <Detail label="Ownership Type" value={building.ownership_type} />
    <Detail label="Managed By" value={building.managed_by} />
    <Detail label="Portfolio" value={building.portfolio} />
    <Detail label="Portfolio Sub Group" value={building.portfolio_sub_group} />
  </div>
</div>
      


        {leases && leases.length > 0 && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Leases in this Building</h2>

    <div className="grid grid-cols-3 gap-4">
      {leases.map((lease) => (
        <div
          key={lease.id}
          className="border rounded p-4 shadow hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/leases/${lease.id}`)}
        >
          <p className="font-semibold">{lease.client_lease_id}</p>
          <p className="text-sm text-gray-600">{lease.landlord_legal_name}</p>
          <p className="text-sm">
            {lease.lease_agreement_date} → {lease.termination_date}
          </p>
          <p className="text-sm font-medium">
            Status: {lease.lease_status}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

        <div>


      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>

  );
}
