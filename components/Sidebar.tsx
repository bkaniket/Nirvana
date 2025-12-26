"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Buildings", path: "/buildings" },
    { label: "Leases", path: "/leases" },
    { label: "User Management", path: "/users" },
    { label: "Role Management", path: "/roles" },
    // Add more pages here in the future
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button
              onClick={() => router.push(item.path)}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
