"use client";

import { useState } from "react";
import NavBar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile
  const [collapsed, setCollapsed] = useState(false);     // desktop

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <NavBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
