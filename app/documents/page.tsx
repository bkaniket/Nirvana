"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Document = {
  id: number;
  lease_id?: number;
  expense_id?: number;
  file_name: string;
  file_path: string;
  file_type?: string; // ✅ fix
  created_at?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";

export default function DocumentsPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

const [form, setForm] = useState({
  lease_id: "",
  file_type: "",   // 🔹 rename
  files: [] as File[],
});

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDocuments(data.data || data);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    setForm({ ...form, files: Array.from(e.target.files) });
  }
};

const handleSubmit = async () => {
  if (form.files.length === 0) {
    alert("Please select at least one file");
    return;
  }

  const formData = new FormData();

  // 🔹 IMPORTANT: backend expects documents[]
  form.files.forEach((file) => {
    formData.append("documents[]", file);
  });

  if (form.lease_id) formData.append("lease_id", form.lease_id);
  if (form.file_type) formData.append("file_type", form.file_type);

  const url = editingDoc
    ? `${BASE_URL}/documents/${editingDoc.id}`
    : `${BASE_URL}/documents`;

  const method = editingDoc ? "PUT" : "POST";  // 🔹 FIX

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set Content-Type when using FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    setShowForm(false);
    setEditingDoc(null);
    setForm({ lease_id: "",  file_type: "", files: [] });
    fetchDocuments();
  } catch (err) {
    alert("Failed to save document");
    console.error(err);
  }
};

const startEdit = (doc: Document) => {
  setEditingDoc(doc);
  setForm({
    lease_id: doc.lease_id?.toString() || "",
    file_type: doc.file_type || "",
    files: [], // 🔹 no file on edit
  });
  setShowForm(true);
};

  if (loading) {
    return <p className="text-gray-500">Loading documents...</p>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Documents</h1>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingDoc(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Upload Document
        </button>
      </div>

      {/* 🔹 Upload / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow space-y-4 border">

          <h2 className="text-lg font-semibold">
            {editingDoc ? "Edit Document" : "Upload New Document"}
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Lease ID (optional)"
              value={form.lease_id}
              onChange={(v) => setForm({ ...form, lease_id: v })}
            />


            <Input
              label="File Type"
              value={form.file_type}
              onChange={(v) => setForm({ ...form, file_type: v })}
            />

            <div>
              <label className="text-sm text-gray-500">Select File</label>
<input
  type="file"
  multiple
  onChange={(e) => {
    if (e.target.files) {
      setForm({ ...form, files: Array.from(e.target.files) });
    }
  }}
  className="block w-full mt-1"
/>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {editingDoc ? "Update" : "Upload"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setEditingDoc(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc) => {

         const fileUrl = `${BASE_URL.replace("/api", "")}/storage/${doc.file_path}`;
          const isImage = doc.file_name.match(/\.(jpg|jpeg|png|gif)$/i);
          const isPdf = doc.file_name.match(/\.pdf$/i);

          return (
            <div
              key={doc.id}
              className="bg-white rounded shadow p-4 space-y-3 border"
            >
              <p className="font-medium truncate">{doc.file_name}</p>

              {/* 🔹 Preview */}
              <div className="h-40 border rounded flex items-center justify-center bg-gray-50">
                {isImage && (
                  <img
                    src={fileUrl}
                    alt={doc.file_name}
                    className="max-h-full object-contain"
                  />
                )}

                {isPdf && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full"
                  />
                )}

                {!isImage && !isPdf && (
                  <p className="text-sm text-gray-500">No Preview</p>
                )}
              </div>

              {/* 🔹 Meta */}
              <div className="text-sm text-gray-600 space-y-1">
                {doc.lease_id && <p>Lease ID: {doc.lease_id}</p>}
                {doc.expense_id && <p>Expense ID: {doc.expense_id}</p>}
               {doc.file_type && <p>Type: {doc.file_type}</p>}
              </div>

              {/* 🔹 Actions */}
              <div className="flex justify-between items-center pt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  className="text-blue-600 text-sm underline"
                >
                  View / Download
                </a>

                <button
                  onClick={() => startEdit(doc)}
                  className="text-yellow-600 text-sm"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 🔹 Reusable Input */
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded mt-1"
      />
    </div>
  );
}
