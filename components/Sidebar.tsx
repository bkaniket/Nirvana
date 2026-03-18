"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";


import {
  LayoutDashboard,
  Building2,
  FileText,
  Receipt,
  Wallet,
  RefreshCw,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  } from "lucide-react";



type MenuItemProps = {
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  collapsed: boolean;
  go: (path: string) => void;
  isActive: (path: string) => boolean;
};



function MenuItem({ path, icon: Icon, label, collapsed, go, isActive }: MenuItemProps) {
  const active = isActive(path);

  return (
    <button
      onClick={() => go(path)}
      className={clsx(
        "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 overflow-hidden",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "bg-blue-500/15 text-white border border-blue-400/20"
          : "text-slate-400 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon size={18} />

      <span
        className={clsx(
          "whitespace-nowrap transition-all duration-200",
          collapsed
            ? "opacity-0 translate-x-2 w-0"
            : "opacity-100 translate-x-0 w-auto"
        )}
      >
        {label}
      </span>
    </button>
  );
}


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

  
  const [openAccounts, setOpenAccounts] = useState(true);

 const isActive = (path: string) => {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
};

  const go = (path: string) => {
    router.push(path);
    onClose(); // close on mobile after click
  };

  return (
    <>
      {/* 🔹 Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[#3C6FA3]/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        className={clsx(
          "fixed md:static top-0 left-0 h-full bg-[#0a172a] border-r border-white/10 shadow-[4px_0_30px_rgba(0,0,0,0.4)] text-white flex flex-col z-50",
          "transform transition-[width] duration-300 ease-in-out",
          // Width control
          collapsed ? "md:w-[80px]" : "md:w-[260px]",
          "w-[64px]", // mobile always full width
          // Slide for mobile
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <h2
  className={clsx(
    "text-xl font-bold whitespace-nowrap transition-all",
    collapsed && "opacity-0 -translate-x-2 w-0 overflow-hidden"
  )}
>
  EstateFlow
</h2>

          {/* Desktop collapse toggle */}
          <button
  onClick={onToggleCollapse}
  className="
  hidden md:flex items-center justify-center
  w-9 h-9 rounded-lg
  bg-white/10 backdrop-blur-md
  border border-white/20
  shadow-[0_4px_20px_rgba(0,0,0,0.25)]
  hover:bg-white/20
  hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]
  transition-all duration-200
  "
>
  {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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

          <li>
  <MenuItem
    path="/dashboard"
    icon={LayoutDashboard}
    label="Dashboard"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>

<li>
  <MenuItem
    path="/buildings"
    icon={Building2}
    label="Buildings"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>

<li>
  <MenuItem
    path="/leases"
    icon={FileText}
    label="Leases"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>

<li>
  <MenuItem
    path="/workflow"
    icon={RefreshCw}
    label="Workflow"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>

          {/* 🔹 Accounts Section */}
<li>
  <button
    onClick={() => setOpenAccounts(!openAccounts)}
    className={clsx(
  "flex items-center w-full px-3 py-2 rounded text-gray-300 hover:bg-white/10",
  collapsed ? "justify-center" : "justify-between"
)}
  >
    <div className={clsx("flex items-center gap-3", collapsed && "justify-center w-full")}>
      <Wallet size={18} />
      {!collapsed && <span>Accounts</span>}
    </div>
    {!collapsed && <span>{openAccounts ? "▾" : "▸"}</span>}
  </button>

  {openAccounts && !collapsed && (
    <ul
    className={clsx(
      "ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300",
      openAccounts ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
    )}
  >
      <li>
        <MenuItem
          path="/accounts"
          icon={Receipt}
          label="Expenses"
          collapsed={collapsed}
          go={go}
          isActive={isActive}
        />
      </li>

      <li>
        <MenuItem
          path="/invoices"
          icon={FileText}
          label="Invoices"
          collapsed={collapsed}
          go={go}
          isActive={isActive}
        />
      </li>
    </ul>
  )}
</li>



{/* Users */}
<li>
  <MenuItem
    path="/users"
    icon={Users}
    label="User Management"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>

{/* Roles */}
<li>
  <MenuItem
    path="/roles"
    icon={Shield}
    label="Role Management"
    collapsed={collapsed}
    go={go}
    isActive={isActive}
  />
</li>
</ul>
</aside>

    </>
  );
}

