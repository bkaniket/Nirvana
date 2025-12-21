"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  username: string;
  roles: string[];
};

type Permissions = {
  [module: string]: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
   const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    const storedPermissions = sessionStorage.getItem("permissions");

    if (!token || !storedUser || !storedPermissions) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    setPermissions(JSON.parse(storedPermissions));
  }, [router]);

  if (!user || !permissions) return null;

  const can = (module: string, action: string) =>
    permissions[module]?.includes(action);

  const isAdmin = user.roles.includes("ADMIN");

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}</p>

      <hr />

      {/* Admin Actions */}
      {isAdmin && can("USER", "create") && (
        <div>
          <h2>Admin Actions</h2>
          <button onClick={() => router.push("/register")}>
            ➕ Create User
          </button>
        </div>
      )}

      <hr />

      <div>
        <h2>Management</h2>
        <ul>
          {can("BUILDING", "view") && (
            <li>
              <button onClick={() => router.push("/buildings")}>
                🏢 Buildings
              </button>
            </li>
          )}

          {can("LEASE", "view") && (
            <li>
              <button onClick={() => router.push("/leases")}>
                📄 Leases
              </button>
            </li>
          )}
        </ul>
      </div>

      <hr />
    </div>
  );
}
