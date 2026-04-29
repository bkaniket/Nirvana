"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

type Workflow = {
  status: "CREATED" | "UPDATED" | "APPROVED" | "REJECTED";
};

type WorkflowResponse = {
  workflow: Workflow;
  entity_type: "BUILDING" | "LEASE" | "EXPENSE";
  entity: Record<string, any>;
};

export default function WorkflowReviewPage() {
  const router = useRouter();
  const { id } = useParams();

  const [data, setData] = useState<WorkflowResponse | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canApprove = hasPermission("WORKFLOW", "approve");

      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/workflow/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id, router]);

const handleAction = async (action: "approve" | "reject") => {
  if (!canApprove) return;

  setSubmitting(true);

  try {
    const res = await fetch(
      `${BASE_URL}/workflow/${id}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ notes }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Action failed");
    }

    alert(data.message);
    router.push("/workflow");

  } catch (err: any) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Not found</p>;

    const currentStatus = data.workflow?.status;

const canTakeAction =
  canApprove &&
  (currentStatus === "CREATED" || currentStatus === "UPDATED");


  return (
    <div className="space-y-6">
      {/* Header */}
      <p className="mt-2">
  Status:{" "}
  <span className="px-2 py-1 rounded bg-gray-200 text-sm font-medium">
    {currentStatus}
  </span>
</p>
      <div>
        <h1 className="text-2xl font-bold">Workflow Review</h1>
        <p className="text-gray-600">
          Entity Type: <strong>{data.entity_type}</strong>
        </p>
      </div>

      {/* Entity Details */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {data.entity_type} Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.entity || {}).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm text-gray-500">{key}</p>
              <p className="font-medium break-all">
                {String(value ?? "-")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-medium mb-1">
          Reviewer Notes (optional)
        </label>
        <textarea
          className="w-full border rounded p-3"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      {canTakeAction && (
        <div className="flex gap-4">
          <button
            disabled={submitting}
            onClick={() => handleAction("approve")}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            ✅ Approve
          </button>

          <button
            disabled={submitting}
            onClick={() => handleAction("reject")}
            className="px-6 py-2 bg-red-600 text-white rounded"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}
