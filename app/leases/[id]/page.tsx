"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { useApi } from "@/app/hooks/useApi";


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

const leaseSections: {
  title: string;
  fields: { label: string; key: keyof Lease }[];
}[] = [
  {
    title: "Lease Identification",
    fields: [
      { label: "System Lease ID", key: "system_lease_id" },
      { label: "Client Lease ID", key: "client_lease_id" },
      { label: "Lease Version", key: "lease_version" },
      { label: "Lease Source", key: "lease_source" },
      { label: "Lease Hierarchy", key: "lease_hierarchy" },
      { label: "Parent Lease ID", key: "parent_lease_id" },
    ],
  },
  {
    title: "Parties Involved",
    fields: [
      { label: "Tenant Legal Name", key: "tenant_legal_name" },
      { label: "Landlord Legal Name", key: "landlord_legal_name" },
      { label: "Legacy Entity", key: "legacy_entity_name" },
    ],
  },
  {
    title: "Key Dates & Lifecycle",
    fields: [
      { label: "Lease Agreement Date", key: "lease_agreement_date" },
      { label: "Possession Date", key: "possession_date" },
      { label: "Rent Commencement Date", key: "rent_commencement_date" },
      { label: "Current Commencement Date", key: "current_commencement_date" },
      { label: "Termination Date", key: "termination_date" },
      { label: "Possible Expiration", key: "lease_possible_expiration" },
    ],
  },
  {
    title: "Lease Terms",
    fields: [
      { label: "Lease Type", key: "lease_type" },
      { label: "Lease Status", key: "lease_status" },
      { label: "Current Term", key: "current_term" },
      { label: "Term Remaining", key: "current_term_remaining" },
      { label: "Critical Lease", key: "critical_lease" },
      { label: "Within Landlord Tenant Act", key: "within_landlord_tenant_act" },
    ],
  },
  {
    title: "Space & Usage",
    fields: [
      { label: "Primary Use", key: "primary_use" },
      { label: "Additional Use", key: "additional_use" },
      { label: "Ownership Type", key: "ownership_type" },
      { label: "Measure Units", key: "measure_units" },
    ],
  },
  {
    title: "Financial & Recovery",
    fields: [
      { label: "Account Type", key: "account_type" },
      { label: "Lease Recovery Type", key: "lease_recovery_type" },
      { label: "Escalation Type", key: "escalation_type" },
      { label: "Security Deposit Type", key: "security_deposit_type" },
      { label: "Security Deposit Amount", key: "security_deposit_amount" },
      { label: "Deposit Date", key: "security_deposit_deposited_date" },
      { label: "Deposit Return Date", key: "security_deposit_return_date" },
    ],
  },
  {
    title: "Compliance & Legal",
    fields: [
      { label: "Compliance Status", key: "compliance_status" },
      { label: "Deed of Grant", key: "deed_of_grant" },
      { label: "Lease Acts", key: "lease_acts" },
      { label: "Lease Clauses", key: "lease_clauses" },
      { label: "Lease Penalties", key: "lease_penalties" },
    ],
  },
  {
    title: "Portfolio & Classification",
    fields: [
      { label: "Portfolio", key: "portfolio" },
      { label: "Portfolio Sub Group", key: "portfolio_sub_group" },
      { label: "Building ID", key: "building_id" },
    ],
  },
];

export default function LeaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { request } = useApi();
  const [lease, setLease] = useState<Lease | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LeaseDocument | null>(null);
const openEditModal = useCallback((doc: LeaseDocument) => {
  setEditingDoc(doc);
}, []);


  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");

const fetchDocuments = useCallback(async () => {
  if (!id) return;

  const data = await request(`/leases/${id}/documents`);

  setDocuments(data?.data || []);
  setDocsLoading(false);
}, [id, request]);
const fetchLease = useCallback(async () => {
  if (!canView || !id) {
    router.push("/dashboard");
    return;
  }

  setLoading(true);

  const data = await request(`/leases/${id}`);

  if (!data) {
    setLoading(false);
    router.push("/leases");
    return;
  }

  setLease(data.lease);
  setWorkflow(data.workflow);
  setLoading(false);
}, [id, canView, router, request]);

const handleDelete = useCallback(async (docId: number) => {
  if (!confirm("Are you sure?")) return;

  const success = await request(`/documents/${docId}`, {
    method: "DELETE",
  });

  if (success !== null) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }
}, [request]);


useEffect(() => {
  fetchLease();
}, [id, canView]);

useEffect(() => {
  fetchDocuments();
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


  if (!lease) return null;

  return (
    <div className=" bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Lease Details</h1>

          {workflow && <WorkflowPanel workflow={workflow} />}

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

          <div>
            {leaseSections.map((section) => (
  <Section key={section.title} title={section.title}>
    {section.fields.map((field) => (
      <Field
        key={field.key}
        label={field.label}
        value={lease[field.key]}
      />
    ))}
  </Section>
))}
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
            <div className="rounded-lg border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left border-collapse">
      
      {/* Header */}
      <thead className="bg-blue-100 text-blue-900">
        <tr>
          <th className="px-4 py-3 border-b border-gray-200 font-semibold">
            File Name
          </th>
          <th className="px-4 py-3 border-b border-gray-200 font-semibold">
            Type
          </th>
          <th className="px-4 py-3 border-b border-gray-200 font-semibold">
            Uploaded By
          </th>
          <th className="px-4 py-3 border-b border-gray-200 font-semibold">
            Created
          </th>
          <th className="px-4 py-3 border-b border-gray-200 font-semibold">
            Actions
          </th>
        </tr>
      </thead>

      {/* Body */}
      <tbody className="bg-white">
        {documents.map((doc) => (
          <tr
            key={doc.id}
            className="hover:bg-blue-50 transition"
          >
            <td className="px-4 py-3 border-b border-gray-100">
              {doc.file_name}
            </td>

            <td className="px-4 py-3 border-b border-gray-100">
              {doc.file_type || "-"}
            </td>

            <td className="px-4 py-3 border-b border-gray-100">
              {doc.uploaded_by_first_name
                ? `${doc.uploaded_by_first_name} ${doc.uploaded_by_last_name}`
                : "-"}
            </td>

            <td className="px-4 py-3 border-b border-gray-100">
              {new Date(doc.created_at).toLocaleString()}
            </td>

            <td className="px-4 py-3 border-b border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    window.open(getFileUrl(doc.file_path), "_blank")
                  }
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>

                <a
                  href={getFileUrl(doc.file_path)}
                  download
                  className="text-green-600 hover:underline"
                >
                  Download
                </a>

                <button
                  onClick={() => openEditModal(doc)}
                  className="text-yellow-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      
      )}
      </Section>
      {/* Modals OUTSIDE content wrapper */}
      {showUpload && (
        <UploadDocumentModal
          leaseId={id}
          onClose={() => setShowUpload(false)}
onUploaded={fetchDocuments}
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

function WorkflowPanel({ workflow }: { workflow: WorkflowInfo }) {
  const isApproved = workflow.status === "APPROVED";

  return (
    <div
      className={`bg-white p-6 rounded shadow border-l-4 space-y-2 ${
        isApproved ? "border-green-500" : "border-blue-500"
      }`}
    >
      <h2 className="text-lg font-semibold">Approval Workflow</h2>

      <p>
        <strong>Status:</strong>{" "}
        {isApproved ? (
          <span className="text-green-600 font-semibold">
            ✅ Approved
          </span>
        ) : (
          <span className="text-yellow-600 font-semibold">
            ⏳ Approval Pending
          </span>
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
  );
}


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

