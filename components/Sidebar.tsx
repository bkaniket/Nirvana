"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [openLease, setOpenLease] = useState(true);
  const [openAccounts, setOpenAccounts] = useState(true);

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    clsx(
      "w-full text-left px-3 py-2 rounded transition",
      isActive(path)
        ? "bg-gray-800 text-white font-semibold"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    );

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">Nirvana</h2>

      <ul className="space-y-1 text-sm">

        {/* Dashboard */}
        <li>
          <button
            onClick={() => router.push("/dashboard")}
            className={linkClass("/dashboard")}
          >
            Dashboard
          </button>
        </li>

        {/* Buildings */}
        <li className="m-2 p-1">
          <button
            onClick={() => router.push("/buildings")}
            className={linkClass("/buildings")}
          >
            Buildings
          </button>
        </li>

        {/* 🔹 Lease Section */}
        <li className="m-2 p-1">
          <button
            onClick={() => setOpenLease(!openLease)}
            className="w-full flex justify-between items-center px-3 py-2 rounded text-gray-300 hover:bg-gray-700"
          >
            <span>Leases</span>
            <span>{openLease ? "▾" : "▸"}</span>
          </button>

          {openLease && (
            <ul className="ml-4 mt-1 space-y-1">
              <li className="m-2 p-1">
                <button
                  onClick={() => router.push("/leases")}
                  className={linkClass("/leases")}
                >
                  All Leases
                </button>
              </li>

              <li className="m-2 p-1">
                <button
                  onClick={() => router.push("/documents")}
                  className={linkClass("/documents")}
                >
                  Documents
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* 🔹 Accounts Section */}
        <li className="m-2 p-1">
          <button
            onClick={() => setOpenAccounts(!openAccounts)}
            className="w-full flex justify-between items-center px-3 py-2 rounded text-gray-300 hover:bg-gray-700"
          >
            <span>Accounts</span>
            <span>{openAccounts ? "▾" : "▸"}</span>
          </button>

          {openAccounts && (
            <ul className="ml-4 mt-1 space-y-1">
              <li className="m-2 p-1">
                <button
                  onClick={() => router.push("/accounts")}
                  className={linkClass("/accounts")}
                >
                  Expenses
                </button>
              </li>

              <li className="m-2 p-1">
                <button
                  onClick={() => router.push("/invoices")}
                  className={linkClass("/invoices")}
                >
                  Invoices
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* Workflow */}
        <li className="m-2 p-1">
          <button
            onClick={() => router.push("/workflow")}
            className={linkClass("/workflow")}
          >
            Workflow
          </button>
        </li>

        {/* User Management */}
        <li className="m-2 p-1">
          <button
            onClick={() => router.push("/users")}
            className={linkClass("/users")}
          >
            User Management
          </button>
        </li>

        {/* Role Management */}
        <li className="m-2 p-1">
          <button
            onClick={() => router.push("/roles")}
            className={linkClass("/roles")}
          >
            Role Management
          </button>
        </li>
      </ul>
    </aside>
  );
}
