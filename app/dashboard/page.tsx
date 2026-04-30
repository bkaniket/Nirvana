"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import dynamic from "next/dynamic";

// Keep map client-only because many map/globe libraries depend on browser APIs
const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
});

// Premium but restrained color palette
const COLORS = ["#2563EB", "#0F766E", "#F59E0B", "#F43F5E", "#10B981"];

// Format labels like "total_leases" -> "total leases"
function formatLabel(label: string) {
  return label.replace(/_/g, " ");
}

// Short number for cards if needed
function formatValue(value: any) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;

  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
}

// Full formatted number for tooltips / detailed values
function formatFullValue(value: any) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN").format(num);
}

// Reusable section card wrapper
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 pb-4 pt-6">
        <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>
    </section>
  );
}

// KPI card skeleton while loading
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
      <div className="mb-2 h-8 w-20 rounded bg-slate-200" />
      <div className="h-3 w-16 rounded bg-slate-100" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, [BASE_URL]);

  // Prepare pie chart data
  // useMemo avoids recalculating on every render
  const pieData = useMemo(() => {
    return Object.entries(data?.lease_status_pie ?? {}).map(
      ([name, value]: any, index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      })
    );
  }, [data]);

  // Prepare line chart data
  const lineData = useMemo(() => {
    return Object.entries(data?.leases_over_time ?? {}).map(
      ([name, value]: any) => ({
        name,
        value,
      })
    );
  }, [data]);

  const buildingLocations = data?.building_locations ?? [];
  const cards = Object.entries(data?.cards ?? {});

  // Total for pie chart summary
  const totalLeases = pieData.reduce(
    (sum: number, item: any) => sum + Number(item.value || 0),
    0
  );

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-800">
          Could not load dashboard data
        </p>
        <p className="text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  // Loading state
  // Changed:
  // - Replaced plain text loader with polished skeletons
  if (!data) {
    return (
      <div className="min-h-full space-y-6 p-6 lg:p-8">
        <div>
          <div className="mb-2 h-7 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[360px] animate-pulse rounded-[28px] border border-slate-100 bg-white shadow-sm" />
          <div className="h-[360px] animate-pulse rounded-[28px] border border-slate-100 bg-white shadow-sm" />
        </div>

        <div className="h-[360px] animate-pulse rounded-[28px] border border-slate-100 bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 p-6 lg:p-8">
      {/* Top hero / dashboard intro */}
      {/* Changed:
          - Added premium header block
          - Gives the page stronger first impression
          - No dynamic date here to avoid hydration mismatch
      */}
     
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Portfolio Overview
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>

    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      Live Data
    </span>
  </div>


      {/* KPI cards */}
      {/* Changed:
          - Better spacing
          - Better hierarchy
          - Better radius/shadows
          - Cleaner premium look
      */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(([key, value]: any, index: number) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]"
          >
            {/* Premium top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {formatLabel(key)}
            </p>

            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950 [font-variant-numeric:tabular-nums]">
              {formatValue(value)}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Live
              </span>
              <span className="text-xs text-slate-400">Updated now</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_1.18fr]">
        {/* Pie chart */}
        <SectionCard
          title="Lease Status Composition"
          subtitle="Distribution across all active lease states"
        >
          {/* min-w-0 prevents flex/grid width issues with recharts */}
          <div className="grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            {/* Fixed height is important for ResponsiveContainer */}
            <div className="relative w-full min-w-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={120}
                    paddingAngle={4}
                    cornerRadius={10}
                    stroke="#ffffff"
                    strokeWidth={5}
                  >
                    {pieData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>

                  <Tooltip
                  cursor={false} // Prevents "ghosting" artifacts
        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    formatter={(value: any) => [formatFullValue(value), "Leases"]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center summary */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Total
                </span>
                <span className="text-2xl font-bold text-slate-950">
                  {formatFullValue(totalLeases)}
                </span>
                <span className="text-xs text-slate-500">Active leases</span>
              </div>
            </div>

            {/* Legend panel */}
            <div className="space-y-3">
              {pieData.map((item: any) => {
                const percent = totalLeases
                  ? ((Number(item.value) / totalLeases) * 100).toFixed(1)
                  : "0";

                return (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="mt-1 h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div>
                          <p className="text-sm font-semibold capitalize text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {percent}% of total
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-slate-950 [font-variant-numeric:tabular-nums]">
                        {formatFullValue(item.value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* Map */}
        <SectionCard
          title="Portfolio Footprint"
          subtitle={`${buildingLocations.length} mapped locations across your portfolio`}
        >
          <div className="rounded-[26px] border border-slate-100 bg-[linear-gradient(180deg,#fbfdff,#f8fafc)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Geography
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Asset distribution view
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400">Locations</p>
                <p className="text-sm font-bold text-slate-900 [font-variant-numeric:tabular-nums]">
                  {buildingLocations.length}
                </p>
              </div>
            </div>

            <div className="h-[280px] overflow-hidden rounded-[22px] border border-white/80 bg-white">
              <WorldMap locations={buildingLocations} />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Line chart */}
      <SectionCard
        title="Lease Activity Over Time"
        subtitle="Monthly lease trend with cleaner executive styling"
      >
        <div className="rounded-[26px] border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),#ffffff)] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Trend analysis
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Lease volume trajectory
              </p>
            </div>

            <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Active series
            </div>
          </div>

          {/* Fixed parent height solves Recharts width/height warning */}
          <div className="w-full min-w-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="leaseStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="60%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0F766E" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 8"
                  stroke="#E2E8F0"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  width={34}
                />

                <Tooltip
                  formatter={(value: any) => [formatFullValue(value), "Leases"]}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#leaseStroke)"
                  strokeWidth={4}
                  dot={{ r: 0 }}
                  activeDot={{
                    r: 7,
                    fill: "#ffffff",
                    stroke: "#2563EB",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}