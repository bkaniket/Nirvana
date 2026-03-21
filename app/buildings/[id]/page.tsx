"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Building = {
  id: number;
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
type Expense = {
  expense_id: number;
  expense_year?: string;
  expense_period?: string;
  expense_category?: string;
  expense_type?: string;
  amount?: string;
  currency?: string;
  status?: string;
  vendor_name?: string;
  account_code?: string;
};

type Certificate = {
  id: number;
  certificate_number?: string;
  certificate_name?: string;
  certificate_type?: string;
  issued_by?: string;
  expiry_date?: string;
  status?: string;
  file_path?: string;
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

function CreateExpenseModal({
  buildingId,
  onClose,
  onCreated,
}: {
  buildingId: string | string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [form, setForm] = useState({
    expense_year: "",
    expense_type: "",
    expense_category: "",
    vendor_name: "",
    amount: "",
    currency: "INR",
    status: "PENDING",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const res = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        building_id: buildingId,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create expense");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add Building Expense</h2>

        {/* Year */}
        <input
          placeholder="Expense Year (e.g. 2026)"
          value={form.expense_year}
          onChange={(e) => handleChange("expense_year", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Type */}
        <input
          placeholder="Expense Type (Electricity, Tax...)"
          value={form.expense_type}
          onChange={(e) => handleChange("expense_type", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Category */}
        <input
          placeholder="Category (Rent / Non-Rent)"
          value={form.expense_category}
          onChange={(e) => handleChange("expense_category", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Vendor */}
        <input
          placeholder="Vendor Name"
          value={form.vendor_name}
          onChange={(e) => handleChange("vendor_name", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Amount */}
        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Currency */}
        <input
          placeholder="Currency"
          value={form.currency}
          onChange={(e) => handleChange("currency", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCertificateModal({
  buildingId,
  onClose,
  onCreated,
}: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [form, setForm] = useState({
    certificate_name: "",
    certificate_type: "",
    issued_by: "",
    expiry_date: "",
    status: "pending",
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files[]", file);
      });
    }

    setLoading(true);

    const res = await fetch(
      `${BASE_URL}/buildings/${buildingId}/certificates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    setLoading(false);

    if (!res.ok) {
      alert("Failed to upload certificate");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded space-y-3">
        <h2 className="text-lg font-semibold">Add Certificate</h2>

        <input
          placeholder="Certificate Name"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("certificate_name", e.target.value)}
        />

        <input
          placeholder="Type"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("certificate_type", e.target.value)}
        />

        <input
          placeholder="Issued By"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("issued_by", e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("expiry_date", e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />

        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            {loading ? "Uploading..." : "Save"}
          </button>
        </div>
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
const [expenseLoading, setExpenseLoading] = useState(true);
const [showExpenseModal, setShowExpenseModal] = useState(false);
const [certificates, setCertificates] = useState<Certificate[]>([]);
const [certificateLoading, setCertificateLoading] = useState(true);
const [showCertificateModal, setShowCertificateModal] = useState(false);
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

  useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token || !id) return;

  fetch(`${BASE_URL}/expenses/buildings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setExpenses(data.data || []);
    })
    .finally(() => setExpenseLoading(false));
}, [id]);

useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token || !id) return;

  fetch(`${BASE_URL}/buildings/${id}/certificates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setCertificates(data.data || []);
    })
    .finally(() => setCertificateLoading(false));
}, [id]);

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
            {/* <Detail label="System Building ID" value={building.system_building_id} /> */}
            <Detail label="Building Name" value={building.building_name} />
            {/* <Detail label="CLLI" value={building.clli} />
            <Detail label="SIO" value={building.sio} /> */}
            <Detail label="Building Type" value={building.building_type} />
            <Detail label="Building Status" value={building.building_status} />
          </div>
        </CollapsibleSection>
        {/* 🔹 Location & Address */}
        <CollapsibleSection index={2} title="Location Details">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Address" value={building.address_1} />
            <Detail label="City" value={building.city} />
            <Detail label="State" value={building.state} />
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
          {/** 🔹 Certificates & Compliance */}

        <div className="space-y-4 m-4">
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">Certificates</h2>

    <button
      className="px-3 py-1.5 bg-green-600 text-white rounded text-sm"
      onClick={() => setShowCertificateModal(true)}
    >
      + Add Certificate
    </button>
  </div>

  {certificateLoading ? (
    <p>Loading certificates...</p>
  ) : certificates.length === 0 ? (
    <p className="text-gray-500">No certificates found.</p>
  ) : (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Issued By</th>
            <th className="px-4 py-2">Expiry</th>
            <th className="px-4 py-2">File</th>
          </tr>
        </thead>

        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id} className="border-t">
              <td className="px-4 py-2">{cert.certificate_name}</td>
              <td className="px-4 py-2">{cert.certificate_type}</td>
              <td className="px-4 py-2">{cert.issued_by}</td>
              <td className="px-4 py-2">{cert.expiry_date}</td>
              <td className="px-4 py-2">
                {cert.file_path && (
                  <a
                    href={cert.file_path}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {showCertificateModal && (
    <CreateCertificateModal
      buildingId={id}
      onClose={() => setShowCertificateModal(false)}
      onCreated={() => {
        const token = sessionStorage.getItem("token");

        fetch(`${BASE_URL}/buildings/${id}/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setCertificates(data.data || []));
      }}
    />
  )}
</div>

        {/** 🔹 Building Expenses */}
<div className="space-y-4 m-4">
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">Building Expenses</h2>

    <button
      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
     onClick={() => setShowExpenseModal(true)}
    >
      + Add Expense
    </button>
  </div>

  {expenseLoading ? (
    <p>Loading expenses...</p>
  ) : expenses.length === 0 ? (
    <p className="text-gray-500">No expenses recorded.</p>
  ) : (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Year</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Vendor</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp) => (
            <tr
              key={exp.expense_id}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/accounts/${exp.expense_id}`)}
            >
              <td className="px-4 py-2">{exp.expense_year || "-"}</td>
              <td className="px-4 py-2">{exp.expense_type || "-"}</td>
              <td className="px-4 py-2">{exp.expense_category || "-"}</td>
              <td className="px-4 py-2">{exp.vendor_name || "-"}</td>
              <td className="px-4 py-2">
                {exp.amount} {exp.currency}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    exp.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : exp.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {exp.status || "N/A"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )}
  {showExpenseModal && (
  <CreateExpenseModal
    buildingId={id as string}
    onClose={() => setShowExpenseModal(false)}
    onCreated={() => {
      // refresh expense list
      const token = sessionStorage.getItem("token");

      fetch(`${BASE_URL}/expenses/buildings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setExpenses(data.data || []));
    }}
  />
)}
</div>


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
