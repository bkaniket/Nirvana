"use client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

type SidebarProps = {
  open: boolean;                 // mobile open
  collapsed: boolean;           // desktop collapsed
  onClose: () => void;
  onToggleCollapse: () => void; // desktop toggle
};

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [openLease, setOpenLease] = useState(true);
  const [openAccounts, setOpenAccounts] = useState(true);

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    clsx(
      "flex items-center gap-3 w-full px-3 py-2 rounded transition text-sm",
      isActive(path)
        ? "bg-gray-800 text-white font-semibold"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    );

  const go = (path: string) => {
    router.push(path);
    onClose(); // close on mobile after click
  };

  return (
    <>
      {/* 🔹 Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        className={clsx(
          "fixed md:static top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-50",
          "transform transition-all duration-300",
          // Width control
          collapsed ? "md:w-20" : "md:w-64",
          "w-64", // mobile always full width
          // Slide for mobile
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && <h2 className="text-xl font-bold">Nirvana</h2>}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:block text-gray-400 hover:text-white"
            title="Toggle sidebar"
          >
            {collapsed ? "»" : <Image src="/icons/close.png"
              alt="Cross"
              width={18}
              height={18}
              className="object-contain" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <ul className="flex-1 space-y-1 p-2">

          {/* Dashboard */}
          <li>
            <button onClick={() => go("/dashboard")} className={linkClass("/dashboard")}>
              <span>🏠

              </span>
              {!collapsed && <span>Dashboard</span>}
            </button>
          </li>

          {/* Buildings */}
          <li>
            <button onClick={() => go("/buildings")} className={linkClass("/buildings")}>
              <span>🏢</span>
              {!collapsed && <span>Buildings</span>}
            </button>
          </li>

          {/* 🔹 Lease Section */}
          <li>
            <button
              onClick={() => setOpenLease(!openLease)}
              className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-300 hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <span>📄</span>
                {!collapsed && <span>Leases</span>}
              </div>
              {!collapsed && <span>{openLease ? "▾" : "▸"}</span>}
            </button>

            {openLease && !collapsed && (
              <ul className="ml-6 mt-1 space-y-1">
                <li>
                  <button onClick={() => go("/leases")} className={linkClass("/leases")}>
                    All Leases
                  </button>
                </li>

                <li>
                  <button onClick={() => go("/documents")} className={linkClass("/documents")}>
                    Documents
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* 🔹 Accounts Section */}
          <li>
            <button
              onClick={() => setOpenAccounts(!openAccounts)}
              className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-300 hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <span>💰</span>
                {!collapsed && <span>Accounts</span>}
              </div>
              {!collapsed && <span>{openAccounts ? "▾" : "▸"}</span>}
            </button>

            {openAccounts && !collapsed && (
              <ul className="ml-6 mt-1 space-y-1">
                <li>
                  <button onClick={() => go("/accounts")} className={linkClass("/accounts")}>
                    Expenses
                  </button>
                </li>

                <li>
                  <button onClick={() => go("/invoices")} className={linkClass("/invoices")}>
                    Invoices
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Workflow */}
          <li>
            <button onClick={() => go("/workflow")} className={linkClass("/workflow")}>
              <span>🔄</span>
              {!collapsed && <span>Workflow</span>}
            </button>
          </li>

          {/* Users */}
          <li>
            <button onClick={() => go("/users")} className={linkClass("/users")}>
              <span>👤</span>
              {!collapsed && <span>User Management</span>}
            </button>
          </li>

          {/* Roles */}
          <li>
            <button onClick={() => go("/roles")} className={linkClass("/roles")}>
              <span>🛡️</span>
              {!collapsed && <span>Role Management</span>}
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}
