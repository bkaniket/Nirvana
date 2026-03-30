"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.button
      onClick={() => go(path)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "group relative flex items-center w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "text-white"
          : "text-slate-400 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
      )}
    >
        {/* Active background */}
      {active && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/25 via-blue-400/10 to-transparent border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
        {/* Icon */}
      <Icon
        size={18}
        className="relative z-10 transition-transform group-hover:scale-110"
      />

       {/* Label */}
      {!collapsed && (
        <span className="relative z-10 font-medium tracking-wide">
          {label}
        </span>
      )}

      {/* Tooltip */}
      {collapsed && (
        <span className="absolute left-full ml-3 z-50 bg-[#0f172a] border border-white/10 shadow-xl text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.button>
  );
}

  type SidebarProps = {
    open: boolean;
    collapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
  };

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [hovered, setHovered] = useState(false);
  const [openAccounts, setOpenAccounts] = useState(true);

  const expanded = !collapsed || hovered;

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

    return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

        {/* Sidebar */}
 
   <motion.aside
        onMouseEnter={() => window.innerWidth >= 768 && setHovered(true)}
onMouseLeave={() => window.innerWidth >= 768 && setHovered(false)}
        animate={{ width: expanded ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className={clsx(
          "fixed md:static top-0 left-0 h-screen z-50 flex flex-col",
          "bg-gradient-to-b from-slate-900 to-[#0a172a]",
          "border-r border-white/10 shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
   
 {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          {/* Logo */}
          <h2
            className={clsx(
              "text-lg font-semibold tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent transition-[width,opacity,transform] duration-300 ease-in-out",
              !expanded && "opacity-0 w-0 overflow-hidden"
            )}
          >
            EstateFlow
          </h2>

         
           {/* Desktop toggle - ALWAYS VISIBLE */}
  <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

          {/* Menu */}
           <ul className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          <MenuItem
            path="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />

          <MenuItem
            path="/buildings"
            icon={Building2}
            label="Buildings"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />

          <MenuItem
            path="/leases"
            icon={FileText}
            label="Leases"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />

          <MenuItem
            path="/workflow"
            icon={RefreshCw}
            label="Workflow"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />

            {/* Accounts */}
            <div>
            <button
              onClick={() => setOpenAccounts(!openAccounts)}
              className={clsx(
                "w-full flex items-center px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:backdrop-blur-sm transition",
                !expanded ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-3">
                <Wallet size={18} />
                {expanded && <span>Accounts</span>}
              </div>
              {expanded && (
                <span className="text-xs opacity-60">
                  {openAccounts ? "▾" : "▸"}
                </span>
              )}
            </button>

                  <AnimatePresence>
              {openAccounts && expanded && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 mt-1 space-y-1 overflow-hidden"
                >
                  <MenuItem
                    path="/accounts"
                    icon={Receipt}
                    label="Expenses"
                    collapsed={!expanded}
                    go={go}
                    isActive={isActive}
                  />
                  <MenuItem
                    path="/invoices"
                    icon={FileText}
                    label="Invoices"
                    collapsed={!expanded}
                    go={go}
                    isActive={isActive}
                  />
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <MenuItem
            path="/users"
            icon={Users}
            label="User Management"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />

          <MenuItem
            path="/roles"
            icon={Shield}
            label="Role Management"
            collapsed={!expanded}
            go={go}
            isActive={isActive}
          />
        </ul>
      </motion.aside>
    </>
  );
}