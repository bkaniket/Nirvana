"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      router.push("/login");
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

  if (loading) return <p>Loading RBAC data...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>User Management (RBAC)</h1>

      <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>User</th>
            {roles.map((role) => (
              <th key={role.id}>{role.code}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.username}</td>
              {roles.map((role) => (
                <td key={role.id} style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    disabled={updatingUserId === user.user_id}
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
  );
}
