"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

/* ---------------- Types ---------------- */

type Permission = {
  id: number;
  action: string;
};

type Module = {
  id: number;
  code: string;
};

type RoleModulePermission = {
  id: number;
  action: string;
};

type Role = {
  id: number;
  code: string;
  modules: {
    id: number;
    code: string;
    permissions: Permission[];
  }[];
};

/* ---------------- Component ---------------- */

export default function RolePermissionEditor() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
 const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [matrix, setMatrix] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
const canEditUser = hasPermission("USER", "edit");
  /* ---------------- Load initial data ---------------- */

  useEffect(() => {
    if (!hasPermission("USER", "edit")) {
      alert("You do not have permission to edit roles.");
      router.replace("/dashboard");
      return;
    }
    },[]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`${BASE_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

      fetch(`${BASE_URL}/admin/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

      fetch(`${BASE_URL}/admin/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([rolesData, modulesData, permissionsData]) => {
        setRoles(rolesData);
        setModules(modulesData);
        setPermissions(permissionsData);
      })
      .finally(() => setLoading(false));
  }, [router, token]);

  /* ---------------- Role select ---------------- */

  const selectRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const map: Record<number, number[]> = {};

    role.modules.forEach((m) => {
      map[m.id] = m.permissions.map((p) => p.id);
    });

    setMatrix(map);
    setSelectedRole(role);
  };

  /* ---------------- Toggle permission ---------------- */

  const togglePermission = (
    moduleId: number,
    permissionId: number
  ) => {
    setMatrix((prev) => {
      const current = prev[moduleId] || [];
      return {
        ...prev,
        [moduleId]: current.includes(permissionId)
          ? current.filter((id) => id !== permissionId)
          : [...current, permissionId],
      };
    });
  };

  /* ---------------- Save permissions ---------------- */

  const saveModulePermissions = async (moduleId: number) => {
    if (!selectedRole) return;

    await fetch(
      `${BASE_URL}/admin/assign-permissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role_id: selectedRole.id,
          module_id: moduleId,
          permission_ids: matrix[moduleId] || [],
        }),
      }
    );

    alert("Permissions updated");
  };

  if (loading) return <p>Loading RBAC editor...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Role → Module → Permission</h1>

      {/* Role Selector */}
      <select
        className="border p-2 rounded"
        onChange={(e) => selectRole(Number(e.target.value))}
      >
        <option value="">Select Role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.code}
          </option>
        ))}
      </select>

      {/* Matrix */}
      {selectedRole &&
        modules.map((module) => (
          <div key={module.id} className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">{module.code}</h2>

            <div className="flex flex-wrap gap-4">
              {permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={matrix[module.id]?.includes(perm.id) || false}
                    onChange={() =>
                      togglePermission(module.id, perm.id)
                    }
                  />
                  {perm.action}
                </label>
              ))}
            </div>

            <button
              className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
              onClick={() => saveModulePermissions(module.id)}
            >
              Save {module.code}
            </button>
          </div>
        ))}
    </div>
  );
}
