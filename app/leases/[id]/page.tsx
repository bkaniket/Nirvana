"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

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
  building_id: number;
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
};

export default function LeaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lease, setLease] = useState<Lease | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const canView = hasPermission("LEASE", "view");
  const canEdit = hasPermission("LEASE", "edit");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token || !canView) {
      router.push("/dashboard");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/leases/${id}`, {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Lease Details</h1>

          {workflow && (
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm rounded ${
                workflow.status === "APPROVED"
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
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => router.push(`/leases/${id}/edit`)}
          >
            ✏️ Edit Lease
          </button>
        )}
      </div>

      {/* Workflow Info */}
      {workflow && (
        <Section title="Workflow Information">
          <Field
            label="Created By"
            value={
              workflow.created_by
                ? `${workflow.created_by.name} (${new Date(
                    workflow.created_by.created_at
                  ).toLocaleString()})`
                : "-"
            }
          />
          <Field
            label="Approved By"
            value={
              typeof workflow.approved_by === "string"
                ? workflow.approved_by
                : workflow.approved_by
                ? `${workflow.approved_by.name} (${new Date(
                    workflow.approved_by.approved_at
                  ).toLocaleString()})`
                : "-"
            }
          />
        </Section>
      )}

      {/* Sections */}
      <Section title="Parties">
        <Field label="Tenant" value={lease.tenant_legal_name} />
        <Field label="Landlord" value={lease.landlord_legal_name} />
        <Field label="Legacy Entity" value={lease.legacy_entity_name} />
      </Section>

      <Section title="Key Dates">
        <Field label="Agreement Date" value={lease.lease_agreement_date} />
        <Field label="Possession Date" value={lease.possession_date} />
        <Field label="Rent Commencement" value={lease.rent_commencement_date} />
        <Field label="Termination Date" value={lease.termination_date} />
      </Section>

      <Section title="Lease Terms">
        <Field label="Lease Type" value={lease.lease_type} />
        <Field label="Status" value={lease.lease_status} />
        <Field label="Current Term" value={lease.current_term} />
        <Field label="Term Remaining" value={lease.current_term_remaining} />
      </Section>

      <Section title="Financials">
        <Field
          label="Rentable Area"
          value={`${lease.lease_rentable_area || "-"} ${
            lease.measure_units || ""
          }`}
        />
        <Field label="Escalation Type" value={lease.escalation_type} />
        <Field
          label="Security Deposit Type"
          value={lease.security_deposit_type}
        />
        <Field
          label="Security Deposit Amount"
          value={lease.security_deposit_amount}
        />
      </Section>

      <Section title="Additional Information">
        <Field label="Portfolio" value={lease.portfolio} />
        <Field label="Remarks" value={lease.remarks} />
      </Section>
    </div>
  );
}

/* ---------------- Reusable UI ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
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
