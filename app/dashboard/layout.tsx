"use client";

import { useState } from "react";
import NavBar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Controls mobile sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Controls desktop sidebar collapsed state
  const [collapsed, setCollapsed] = useState(false);

  return (
    // Full screen app shell
    // Changed:
    // - Added a premium light background
    // - Kept overflow hidden so only main content scrolls
    <div className="h-screen overflow-hidden bg-[#F6F8FB] text-slate-900">
      <div className="flex h-full">
        {/* Sidebar stays exactly as your logic needs, only UI shell is improved */}
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />

        {/* Main content area */}
        {/* min-w-0 is important in flex layouts to prevent chart/content overflow issues */}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
          {/* Sticky top navbar */}
          {/* Changed:
              - Added glass effect using backdrop blur
              - Added soft bottom border
              - Makes the dashboard feel premium and stable on scroll
          */}
          <div className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <NavBar onMenuClick={() => setSidebarOpen(true)} />
          </div>

          {/* Main scroll area */}
          {/* Changed:
              - Only this section scrolls
              - Better UX than making entire page and shell scroll together
          */}
          <main className="flex-1 overflow-y-auto overscroll-contain">
            {/* Background layer */}
            {/* Changed:
                - Replaced flat gray with soft gradients
                - Makes page look more expensive without being flashy
            */}
            <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.06),transparent_24%),radial-gradient(circle_at_top_right,rgba(13,148,136,0.05),transparent_20%),linear-gradient(to_bottom,#f8fafc,#f4f7fb)]">
              {/* Content container */}
              {/* Changed:
                  - Added max width so content feels structured on large screens
                  - Prevents dashboard from looking too stretched
              */}
              <div className="mx-auto w-full max-w-[1600px]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}