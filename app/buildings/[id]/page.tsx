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

export default function BuildingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [building, setBuilding] = useState<Building | null>(null);
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
        setBuilding(data);
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
            ✏️ Edit Lease
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
        
        <Detail label="CLLI" value={building.clli} />
        <Detail label="SIO" value={building.sio} />
        <Detail label="Building Name" value={building.building_name} />
        <Detail label="Address" value={building.address_1} />
        <Detail label="City" value={building.city} />
        <Detail label="Zip Code" value={building.zip_code} /> 
        <Detail label="Country" value={building.country} /> <br />
        <Detail label="Longitude" value={building.longitude} />
        <Detail label="Latitude" value={building.latitude} />
        <Detail label="Geocode Longitude" value={building.geocode_longitude} />
        <Detail label="Geocode Latitude" value={building.geocode_latitude} />

      </div>

      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
        
        <Detail label="Type" value={building.building_type} /> <br />
        <Detail label="Rentable Area" value={building.building_rentable_area}/>
        <Detail label="Measurement Unit" value={building.building_measure_units}/>
        <Detail label="Construction Year" value={building.construction_year} />
        <Detail label="Last Renovation Year" value={building.last_renovation_year || "Not Yet Renovated"}  />
        <Detail label="Purchase Price" value={building.purchase_price} />
        <Detail label="Currency Type" value={building.currency_type} />
      </div>

       <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
        <Detail label="Ownership" value={building.ownership_type} />
        <Detail label="Managed By" value={building.managed_by} />
        <Detail label="Portfolio" value={building.portfolio} />
        <Detail label="Portfolio Sub Group" value={building.portfolio_sub_group} />
        
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
