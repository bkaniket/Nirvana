"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import "@/src/lib/ag-grid-setup";

/* ---------------- Types ---------------- */

type WorkflowInfo = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_by?: {
    name: string;
    created_at: string;
  } | null;
  approved_by?: {
    name: string;
    approved_at: string;
  } | string | null;
};

type Lease = {
  id: number;
  building_id?: string;
  tenant_legal_name?: string;
  landlord_legal_name?: string;
  legacy_entity_name?: string;
  lease_type?: string;
  lease_status?: string;
  lease_agreement_date?: string;
  possession_date?: string;
  rent_commencement_date?: string;
  termination_date?: string;
  current_term?: string;
  current_term_remaining?: string;
  lease_rentable_area?: string;
  measure_units?: string;
  escalation_type?: string;
  security_deposit_type?: string;
  security_deposit_amount?: string;
  portfolio?: string;
  remarks?: string;
  system_lease_id?: string;
  client_lease_id?: string;
  lease_version?: string;
  lease_source?: string;
  lease_hierarchy?: string;
  parent_lease_id?: string;
  primary_use?: string;
  additional_use?: string;
  ownership_type?: string;
  account_type?: string;
  lease_recovery_type?: string;
  critical_lease?: string;
  within_landlord_tenant_act?: string;
  compliance_status?: string;
  deed_of_grant?: string;
  lease_acts?: string;
  lease_clauses?: string;
  lease_penalties?: string;
  current_commencement_date?: string;
  lease_possible_expiration?: string;
  security_deposit_deposited_date?: string;
  security_deposit_return_date?: string;
  portfolio_sub_group?: string;

};

type LeaseDocument = {
  id: number;
  leaseId: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  created_at: string;
  uploaded_by: number;
  uploaded_by_first_name?: string;
  uploaded_by_last_name?: string;
};
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";
const FILE_BASE_URL = BASE_URL.replace("/api", "");
const getFileUrl = (path: string) =>
  `${FILE_BASE_URL}/storage/${path}`;



function UploadDocumentModal({
  leaseId,
  onClose,
  onUploaded,
}: {
  leaseId: string | string[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileType, setFileType] = useState("");

  const handleUpload = async () => {
    if (!files) return;

    const token = sessionStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("lease_id", String(leaseId));
    formData.append("file_type", fileType);

    Array.from(files).forEach((file) => {
      formData.append("documents[]", file);
    });

    await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold">Upload Lease Documents</h2>

        <input
          type="text"
          placeholder="File Type (optional)"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="w-full"
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
function EditDocumentModal({
  document,
  onClose,
  onUpdated,
}: {
  document: LeaseDocument;
  onClose: () => void;
  onUpdated: (updatedDoc: LeaseDocument) => void;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const [fileName, setFileName] = useState(document.file_name);
  const [fileType, setFileType] = useState(document.file_type || "");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("_method", "PUT"); // Laravel method spoofing
    formData.append("file_name", fileName);
    formData.append("file_type", fileType);

    // Only append file if user selected one
    if (newFile) {
      formData.append("document", newFile);
    }

    const res = await fetch(`${BASE_URL}/documents/${document.id}`, {
      method: "POST", // MUST be POST for file upload
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update document");
      return;
    }

    onUpdated(data.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Edit Document</h2>

        {/* Current File */}
        <p className="text-sm text-gray-500">
          Current file: <span className="font-medium">{document.file_name}</span>
        </p>

        {/* File Name */}
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* File Type */}
        <input
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          placeholder="File Type"
          className="w-full border p-2 rounded"
        />

        {/* Replace File */}
        <div>
          <label className="text-sm text-gray-500">
            Replace File (optional)
          </label>
          <input
            type="file"
            onChange={(e) =>
              setNewFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full mt-1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-1 bg-yellow-500 text-white rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function LeaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lease, setLease] = useState<Lease | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LeaseDocument | null>(null);
  const openEditModal = (doc: LeaseDocument) => {
    setEditingDoc(doc);
  };


const myTheme = themeQuartz.withParams({
  backgroundColor: "#f8f9fa",
  foregroundColor: "#1f2937",
  headerBackgroundColor: "#dbeafe",
  headerTextColor: "#1e3a8a",
  borderColor: "#e5e7eb",
  spacing: 8,
  rowHoverColor: "#e0f2fe",
});
const documentColumnDefs: ColDef[] = [
  {
    field: "file_name",
    headerName: "File Name",
    filter: true,
    flex: 1,
    minWidth: 120,
  },
  {
    field: "file_type",
    headerName: "Type",
    filter: true,
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "Uploaded By",
    valueGetter: (params) =>
      params.data.uploaded_by_first_name
        ? `${params.data.uploaded_by_first_name} ${params.data.uploaded_by_last_name}`
        : "-",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "created_at",
    headerName: "Created",
    valueGetter: (params) =>
      new Date(params.data.created_at).toLocaleString(),
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "Actions",

    cellRenderer: (params: any) => {
      const doc = params.data;

      return (
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open(getFileUrl(doc.file_path), "_blank")
            }
            className="text-blue-600 hover:underline text-sm"
          >
            View
          </button>

          <a
            href={getFileUrl(doc.file_path)}
            download
            className="text-green-600 hover:underline text-sm"
          >
            Download
          </a>

          <button
            onClick={() => openEditModal(doc)}
            className="text-yellow-600 hover:underline text-sm"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(doc.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      );
    },
  },
];

  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token || !canView) {
      router.push("/dashboard");
      return;
    }

    fetch(`${BASE_URL}/leases/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch lease");
        return res.json();
      })
      .then((data) => {
        setLease(data.lease);
        setWorkflow(data.workflow);
      })
      .catch(() => router.push("/leases"))
      .finally(() => setLoading(false));
  }, [id, router, canView]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    fetch(`${BASE_URL}/leases/${id}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.data || []);
      })
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 rounded w-full"></div>
        ))}
      </div>
    );
  }

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const token = sessionStorage.getItem("token");
    if (!token) return;

    await fetch(`${BASE_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };
  if (!lease) return null;

  return (
    <div className=" bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Lease Details</h1>

            {workflow && (
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm rounded ${workflow.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : workflow.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {workflow.status}
              </span>
            )}
          </div>

          {canEdit && workflow?.status !== "APPROVED" && (
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600 transition"
              onClick={() => router.push(`/leases/${id}/edit`)}
            >
              ✏️ Edit Lease
            </button>
          )}
        </div>

        {/* ALL SECTIONS ABOVE STAY SAME */}
        <div >
          {/* Sections */}
          {/* 🔹 Lease Identification */}
          <Section title="Lease Identification">
            <Field label="System Lease ID" value={lease.system_lease_id} />
            <Field label="Client Lease ID" value={lease.client_lease_id} />
            <Field label="Lease Version" value={lease.lease_version} />
            <Field label="Lease Source" value={lease.lease_source} />
            <Field label="Lease Hierarchy" value={lease.lease_hierarchy} />
            <Field label="Parent Lease ID" value={lease.parent_lease_id} />
          </Section>

          {/* 🔹 Parties Involved */}
          <Section title="Parties Involved">
            <Field label="Tenant Legal Name" value={lease.tenant_legal_name} />
            <Field label="Landlord Legal Name" value={lease.landlord_legal_name} />
            <Field label="Legacy Entity" value={lease.legacy_entity_name} />
          </Section>

          {/* 🔹 Key Dates & Lifecycle */}
          <Section title="Key Dates & Lifecycle">
            <Field label="Lease Agreement Date" value={lease.lease_agreement_date} />
            <Field label="Possession Date" value={lease.possession_date} />
            <Field label="Rent Commencement Date" value={lease.rent_commencement_date} />
            <Field label="Current Commencement Date" value={lease.current_commencement_date} />
            <Field label="Termination Date" value={lease.termination_date} />
            <Field label="Possible Expiration" value={lease.lease_possible_expiration} />
          </Section>

          {/* 🔹 Lease Terms */}
          <Section title="Lease Terms">
            <Field label="Lease Type" value={lease.lease_type} />
            <Field label="Lease Status" value={lease.lease_status} />
            <Field label="Current Term" value={lease.current_term} />
            <Field label="Term Remaining" value={lease.current_term_remaining} />
            <Field label="Critical Lease" value={lease.critical_lease} />
            <Field label="Within Landlord Tenant Act" value={lease.within_landlord_tenant_act} />
          </Section>

          {/* 🔹 Space & Usage */}
          <Section title="Space & Usage">
            <Field label="Primary Use" value={lease.primary_use} />
            <Field label="Additional Use" value={lease.additional_use} />
            <Field
              label="Rentable Area"
              value={`${lease.lease_rentable_area || "-"} ${lease.measure_units || ""}`}
            />
            <Field label="Measure Units" value={lease.measure_units} />
            <Field label="Ownership Type" value={lease.ownership_type} />
          </Section>

          {/* 🔹 Financial & Recovery */}
          <Section title="Financial & Recovery">
            <Field label="Account Type" value={lease.account_type} />
            <Field label="Lease Recovery Type" value={lease.lease_recovery_type} />
            <Field label="Escalation Type" value={lease.escalation_type} />
            <Field label="Security Deposit Type" value={lease.security_deposit_type} />
            <Field label="Security Deposit Amount" value={lease.security_deposit_amount} />
            <Field label="Deposit Date" value={lease.security_deposit_deposited_date} />
            <Field label="Deposit Return Date" value={lease.security_deposit_return_date} />
          </Section>

          {/* 🔹 Compliance & Legal */}
          <Section title="Compliance & Legal">
            <Field label="Compliance Status" value={lease.compliance_status} />
            <Field label="Deed of Grant" value={lease.deed_of_grant} />
            <Field label="Lease Acts" value={lease.lease_acts} />
            <Field label="Lease Clauses" value={lease.lease_clauses} />
            <Field label="Lease Penalties" value={lease.lease_penalties} />
          </Section>

          {/* 🔹 Portfolio & Classification */}
          <Section title="Portfolio & Classification">
            <Field label="Portfolio" value={lease.portfolio} />
            <Field label="Portfolio Sub Group" value={lease.portfolio_sub_group} />
            <Field label="Building ID" value={lease.building_id} />
          </Section>
        </div>
        {/* Lease Documents */}
      

      </div>
          <Section
          layout="block"
          title={
            <div className="flex items-center w-full">
              <h2 className="text-base font-semibold text-gray-800">
                Lease Documents
              </h2>

              <button
                onClick={() => setShowUpload(true)}
                className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition"
              >
                + Upload
              </button>
            </div>
          }


      >
          {docsLoading ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <p>No documents uploaded.</p>
          ) : (
            <div className="ag-theme-quartz rounded-lg border w-full"
              style={{ height: 400 }}
            >
              <AgGridReact
                theme={myTheme}
                rowData={documents}
                columnDefs={documentColumnDefs}
                domLayout="normal"
                defaultColDef={{
                  flex: 1,
                  minWidth: 120,
                  sortable: true,
                  filter: true,
                  resizable: true,
                }}
                rowSelection="single"
              />
            </div>
      
      )}
      </Section>
      {/* Modals OUTSIDE content wrapper */}
      {showUpload && (
        <UploadDocumentModal
          leaseId={id}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setDocsLoading(true);
            fetch(`${BASE_URL}/leases/${id}/documents`, {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            })
              .then((res) => res.json())
              .then((data) => setDocuments(data.data || []))
              .finally(() => setDocsLoading(false));
          }}
        />
      )}

      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onUpdated={(updatedDoc) =>
            setDocuments((prev) =>
              prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
            )
          }
        />
      )}

    </div>
  );

}

/* ---------------- Reusable UI ---------------- */

function Section({
  title,
  children,
  layout = "grid",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  layout?: "grid" | "block";
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        {title}
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children}
        </div>
      ) : (
        <div className="w-full  overflow-hidden">{children}</div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>

    </div>
  );
}

