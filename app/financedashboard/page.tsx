"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Palette ─────────────────────────────────────────────────────────────────
const PALETTE = ["#2563EB", "#0D9488", "#F59E0B", "#F43F5E", "#8B5CF6"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatLabel(label: string) {
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatShort(value: any) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}
function formatFull(value: any) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-IN").format(n);
}
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}
function urgencyColor(days: number) {
  if (days <= 30) return "#F43F5E";
  if (days <= 90) return "#F59E0B";
  return "#10B981";
}

// ─── KPI Card metadata ────────────────────────────────────────────────────────
const CARD_META: Record<string, { icon: string; color: string; bg: string }> = {
  total_revenue:    { icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "#2563EB", bg: "#EFF6FF" },
  total_expenses:   { icon: "M3 3h18v4H3zM3 9h18v4H3zM3 15h18v4H3z",                  color: "#F43F5E", bg: "#FFF1F2" },
  net_profit:       { icon: "M22 12h-4l-3 9L9 3l-3 9H2",                               color: "#10B981", bg: "#ECFDF5" },
  occupancy_rate:   { icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",           color: "#F59E0B", bg: "#FFFBEB" },
  pending_invoices: { icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",  color: "#8B5CF6", bg: "#F5F3FF" },
};

// ─── Components ───────────────────────────────────────────────────────────────
function KPICard({ label, value }: { label: string; value: any }) {
  const key = label.toLowerCase().replace(/ /g, "_");
  const meta = CARD_META[key] ?? { icon: "M12 2a10 10 0 100 20A10 10 0 0012 2z", color: "#2563EB", bg: "#EFF6FF" };
  const isPercent = key.includes("rate");
  const displayVal = isPercent ? `${value}%` : typeof value === "number" ? formatShort(value) : value;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl" style={{ background: meta.color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{formatLabel(label)}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{displayVal}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: meta.bg }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d={meta.icon} />
          </svg>
        </span>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 p-6">{children}</div>
    </section>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg text-sm">
      {label && <p className="mb-1 font-medium text-gray-500">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color ?? p.fill }}>
          {p.name ? `${p.name}: ` : ""}₹{formatFull(p.value)}
        </p>
      ))}
    </div>
  );
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: `${color}18`, color }}>
      {label}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-100 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80" /><Skeleton className="h-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/finance-dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const pieData = useMemo(() =>
    Object.entries(data?.expense_category_pie ?? {}).map(
      ([name, value]: any, i) => ({ name, value, fill: PALETTE[i % PALETTE.length] })
    ), [data]);

  const lineData = useMemo(() =>
    Object.entries(data?.expenses_over_time ?? {}).map(
      ([name, value]: any) => ({ name, value })
    ), [data]);

  const cards = Object.entries(data?.cards ?? {});

  if (error)
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-sm font-medium">Failed to load dashboard data.</p>
      </div>
    );

  if (!data) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 p-6">

      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finance Overview</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live Data
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(([key, value]: any) => <KPICard key={key} label={key} value={value} />)}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">

        <SectionCard title="Expense Distribution" subtitle="Breakdown by category">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="h-[220px] w-full sm:w-[220px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={95}
                    paddingAngle={3} labelLine={false} label={renderPieLabel}>
                    {pieData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Inline legend */}
            <div className="flex flex-wrap gap-y-3 gap-x-4 sm:flex-col">
              {pieData.map((d: any) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: d.fill }} />
                  <span className="text-xs text-gray-600">{formatLabel(d.name)}</span>
                  <span className="ml-auto pl-4 text-xs font-semibold text-gray-900">{formatShort(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Expense Trend" subtitle="Monthly spend over time">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => formatShort(v)} width={56} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#fff", strokeWidth: 2, stroke: "#2563EB" }}
                  activeDot={{ r: 6, fill: "#2563EB" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-3">

        <SectionCard title="Expiring Leases" subtitle="Upcoming lease expirations"
          action={<Badge label={`${data.expiring_leases_table.length} leases`} color="#F59E0B" />}>
          <div className="divide-y divide-gray-50">
            {data.expiring_leases_table.map((l: any, i: number) => {
              const days = daysUntil(l.expiry);
              const color = urgencyColor(days);
              return (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: `${color}18`, color }}>
                      {l.tenant?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{l.tenant}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{l.expiry}</p>
                    <p className="text-[11px] font-semibold" style={{ color }}>
                      {days > 0 ? `${days}d left` : "Expired"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Certificate Alerts" subtitle="Pending or expiring certificates"
          action={<Badge label={`${data.certificate_alerts.length} alerts`} color="#F43F5E" />}>
          <div className="divide-y divide-gray-50">
            {data.certificate_alerts.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.city}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Overdue Invoices" subtitle="Invoices requiring attention"
          action={<Badge label={`${data.overdue_invoices_table.length} overdue`} color="#8B5CF6" />}>
          <div className="divide-y divide-gray-50">
            {data.overdue_invoices_table.map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12h6m-3-3v6M5 8h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1zm3-4h6" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-gray-700">{inv.invoice}</span>
                </div>
                <span className="text-sm font-bold text-red-500">₹{formatFull(inv.amount)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}