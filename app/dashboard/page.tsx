"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import dynamic from "next/dynamic";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
});

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [BASE_URL]);

  if (!data) return <p>Loading dashboard...</p>;

  const pieData = Object.entries(data.lease_status_pie ?? {}).map(
    ([name, value]: any) => ({ name, value })
  );

  const lineData = Object.entries(data.leases_over_time ?? {}).map(
    ([name, value]: any) => ({ name, value })
  );

  const buildingLocations = data.building_locations ?? [];

  return (
    <div className="p-6 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(data.cards ?? {}).map(([k, v]: any) => (
          <div key={k} className="bg-white p-4 rounded shadow text-center">
            <h3 className="text-gray-500 capitalize">
              {k.replace("_", " ")}
            </h3>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="mb-4 font-semibold">Lease Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name">
                {pieData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Globe */}
        <div className="bg-white p-4 rounded shadow overflow-hidden">
          <h3 className="mb-4 font-semibold">Buildings Worldwide</h3>
          <div className="w-full h-[320px]">
            <WorldMap locations={buildingLocations} />
          </div>
        </div>
      </div> {/* ✅ THIS WAS MISSING */}

      {/* Line */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-semibold">Leases Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}