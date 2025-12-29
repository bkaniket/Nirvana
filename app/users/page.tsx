"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";


type Role = {
  id: number;
  code: string;
  name: string;
};

type User = {
  user_id: number;
  username: string;
  roles: Role[];
};

export default function RBACUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const sessionRoles =
  typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("roles") || "[]")
    : [];

const isAdmin = sessionRoles.includes("ADMIN");
const canCreateUser = hasPermission("USER", "create");

  const loggedInUserId =
  typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("user") || "{}")?.user_id
    : null;
  // Redirect if not logged in
useEffect(() => {
  if (!token) {
    router.push("/login");
    return;
  }

  if (!hasPermission("USER", "view")) {
    router.replace("/dashboard");
    return;
  }

  fetchData();
}, [router, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchRoles()]);
    } catch (err) {
      console.error("Error fetching RBAC data:", err);
      alert("Failed to load RBAC data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data: User[] = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/admin/roles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch roles");
    const data: Role[] = await res.json();
    setRoles(data);
  };

  const toggleRole = async (userId: number, roleCode: string) => {
    setUpdatingUserId(userId);

    const user = users.find((u) => u.user_id === userId);
    if (!user) return;

    const hasRole = user.roles.some((r) => r.code === roleCode);

    // Prepare updated roles as an array of role codes
    const updatedRoles = hasRole
      ? user.roles.filter((r) => r.code !== roleCode).map((r) => r.id)
      : [...user.roles.map((r) => r.id), roles.find((r) => r.code === roleCode)!.id];

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/users/${userId}/roles`,
        {
          method: "POST", // matches backend route
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role_ids: updatedRoles }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update roles");
      }

      // Refresh users after update
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

 if (loading) {
  return (
    <div className="p-10">
      <h2 className="text-xl font-semibold">Loading user permissions…</h2>
      <p className="text-gray-500 mt-2">Please wait</p>
    </div>
  );
}

  return (
    <div className="p-6 space-y-6">
 <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">User Access Management</h1>
    <p className="text-gray-600">
      Assign roles to users. Permissions are inherited from roles.
    </p>
  </div>

  {isAdmin && canCreateUser && (
    <button
      onClick={() => router.push("/register")}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      ➕ Create User
    </button>
  )}
</div>
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded">
  <strong>Note:</strong> Permissions are derived from roles.
  To change module actions (create, view, approve), edit role permissions.
</div>
      <div className="bg-white rounded shadow overflow-x-auto">
  <table className="min-w-full border-collapse">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3 border text-left">User</th>
        {roles.map((role) => (
          <th key={role.id} className="p-3 border text-center">
            {role.code}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {users.map((user) => (
        <tr key={user.user_id} className="hover:bg-gray-50">
          <td className="p-3 border font-medium">
            {user.username}
          </td>

          {roles.map((role) => (
            <td key={role.id} className="p-3 border text-center">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                disabled={
                  updatingUserId === user.user_id ||
                  (user.user_id === loggedInUserId && role.code === "ADMIN")
                }
                checked={user.roles.some((r) => r.code === role.code)}
                onChange={() => toggleRole(user.user_id, role.code)}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
}
