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

const COLORS = ["#2563EB", "#0F766E", "#F59E0B", "#F43F5E", "#10B981"];

function formatLabel(label: string) {
  return label.replace(/_/g, " ");
}

function formatValue(value: any) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
}

function formatFullValue(value: any) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN").format(num);
}

function SectionCard({ title, subtitle, children }: any) {
  return (
    <section className="rounded-[28px] border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function FinanceDashboard() {
  const [data, setData] = useState<any>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/finance-dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  const pieData = useMemo(() => {
    return Object.entries(data?.expense_category_pie ?? {}).map(
      ([name, value]: any, i) => ({
        name,
        value,
        fill: COLORS[i % COLORS.length],
      })
    );
  }, [data]);

  const lineData = useMemo(() => {
    return Object.entries(data?.expenses_over_time ?? {}).map(
      ([name, value]: any) => ({
        name,
        value,
      })
    );
  }, [data]);

  const cards = Object.entries(data?.cards ?? {});

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-6 p-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(([key, value]: any, i) => (
          <div key={key} className="p-5 bg-white rounded-xl shadow">
            <p className="text-xs uppercase text-gray-400">
              {formatLabel(key)}
            </p>
            <p className="text-2xl font-bold mt-2">
              {formatValue(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-6">

        {/* Expense Category Pie */}
        <SectionCard title="Expense Distribution">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value">
                  {pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatFullValue(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Expense Trend */}
        <SectionCard title="Expense Trend">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatFullValue(v)} />
                <Line dataKey="value" stroke="#2563EB" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Tables Section */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Expiring Leases */}
        <SectionCard title="Expiring Leases">
          {data.expiring_leases_table.map((l: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>{l.tenant}</span>
              <span className="text-sm text-gray-500">{l.expiry}</span>
            </div>
          ))}
        </SectionCard>

        {/* Certificate Alerts */}
        <SectionCard title="Certificate Alerts">
          {data.certificate_alerts.map((b: any, i: number) => (
            <div key={i} className="py-2 border-b">
              <p>{b.name}</p>
              <p className="text-xs text-gray-500">{b.city}</p>
            </div>
          ))}
        </SectionCard>

        {/* Overdue Invoices */}
        <SectionCard title="Overdue Invoices">
          {data.overdue_invoices_table.map((inv: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>{inv.invoice}</span>
              <span className="text-sm text-red-500">
                ₹{formatFullValue(inv.amount)}
              </span>
            </div>
          ))}
        </SectionCard>

      </div>
    </div>
  );
}