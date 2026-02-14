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

function CollapsibleSection({
  index,
  title,
  children,
  defaultOpen = false,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex">
      {/* Left vertical line */}
      <div className="flex flex-col items-center mr-4">
        <div className="text-sm font-semibold text-gray-500">
          {index.toString().padStart(2, "0")}
        </div>
        <div className="w-px flex-1 bg-gray-300 mt-2"></div>
      </div>

      {/* Right content */}
      <div className="flex-1">
        {/* Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left py-3 flex justify-between items-center group"
        >
          <span className="text-base font-semibold text-gray-800 group-hover:text-gray-900">
            {title}
          </span>

          <svg
            className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${open ? "rotate-90" : ""
              }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Content */}
        {open && (
          <div className="ml-4 border-l border-gray-200 pl-4 pb-4 space-y-2">
            {children}
          </div>
        )}
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
  const canEdit = hasPermission("BUILDING", "edit");
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/buildings/${id}`, {
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
    return ( 
    <div className="space-y-6 animate-pulse">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>

      {/* Workflow Card */}
      <div className="bg-white p-6 rounded border border-gray-200 space-y-4">
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
              <div className="ml-4 border-l border-gray-200 pl-4 space-y-2">
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
              className="border rounded p-4 space-y-3 bg-white"
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

      <div className="space-y-6">
        {/* 🔹 Basic Identification */}
        <CollapsibleSection index={1} title="Basic Information" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="System Building ID" value={building.system_building_id} />
            <Detail label="Building Name" value={building.building_name} />
            <Detail label="CLLI" value={building.clli} />
            <Detail label="SIO" value={building.sio} />
            <Detail label="Building Type" value={building.building_type} />
            <Detail label="Building Status" value={building.building_status} />
          </div>
        </CollapsibleSection>
        {/* 🔹 Location & Address */}
        <CollapsibleSection index={2} title="Location Details">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Address" value={building.address_1} />
            <Detail label="City" value={building.city} />
            <Detail label="Zip Code" value={building.zip_code} />
            <Detail label="Country" value={building.country} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Coordinates */}
        <CollapsibleSection index={3} title="Geographical Coordinates">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Latitude" value={building.latitude} />
            <Detail label="Longitude" value={building.longitude} />
            <Detail label="Geocode Latitude" value={building.geocode_latitude} />
            <Detail label="Geocode Longitude" value={building.geocode_longitude} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Property Specifications */}
        <CollapsibleSection index={4} title="Property Specifications">
          <div className="grid grid-cols-2 gap-4">
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
        <CollapsibleSection index={5} title="Financial Details">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Purchase Price" value={building.purchase_price} />
            <Detail label="Currency Type" value={building.currency_type} />
          </div>
        </CollapsibleSection>

        {/* 🔹 Ownership & Management */}
        <CollapsibleSection index={6} title="Ownership & Management">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Ownership Type" value={building.ownership_type} />
            <Detail label="Managed By" value={building.managed_by} />
            <Detail label="Portfolio" value={building.portfolio} />
            <Detail label="Portfolio Sub Group" value={building.portfolio_sub_group} />
          </div>
        </CollapsibleSection>

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
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400">—</span>
      <div>
        <span className="text-gray-500">{label}: </span>
        <span className="text-gray-800 font-medium">
          {value || "-"}
        </span>
      </div>
    </div>

  );
}
