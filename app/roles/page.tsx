"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import { Check, ChevronDown, Save, Shield, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

type Permission = {
  id: number;
  action: string;
};

type Module = {
  id: number;
  code: string;
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

type RoleSelectProps = {
  roles: Role[];
  selectedRole: Role | null;
  selectRole: (roleId: number) => void;
};

function RoleSelect({ roles, selectedRole, selectRole }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative min-w-[260px]">
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.985 }}
        className="group flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-white/60 backdrop-blur-xl transition-colors duration-200 hover:bg-white"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-700">
            <Shield className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Select Role
            </p>
            <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
              {selectedRole?.code || "Choose a role"}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="ml-3 shrink-0 text-[color:var(--text-muted)]"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] ring-1 ring-black/5 backdrop-blur-2xl"
          >
            <div className="max-h-72 overflow-y-auto p-2">
              {roles.map((role) => {
                const active = selectedRole?.id === role.id;

                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      selectRole(role.id);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition",
                      active
                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
                        : "text-[color:var(--text-primary)] hover:bg-black/[0.04]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {role.code}
                      </p>
                      <p
                        className={[
                          "mt-0.5 text-xs",
                          active ? "text-white/80" : "text-[color:var(--text-muted)]",
                        ].join(" ")}
                      >
                        Role permission profile
                      </p>
                    </div>

                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [savingModule, setSavingModule] = useState<number | null>(null);

  const canEditUser = hasPermission("USER", "edit");

  useEffect(() => {
    if (!canEditUser) {
      alert("You do not have permission to edit roles.");
      router.replace("/dashboard");
    }
  }, [canEditUser, router]);

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
        console.log("rolesData", rolesData);
        setModules(modulesData);
        console.log("modulesData", modulesData);
        setPermissions(permissionsData);
        console.log("permissionsData", permissionsData);
      })
      .finally(() => setLoading(false));
  }, [BASE_URL, router, token]);

 const selectRole = (roleId: number) => {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return;

  const map: Record<number, number[]> = {};

  modules.forEach((mod) => {
    const roleModule = role.modules?.find((m) => m.id === mod.id);

    map[mod.id] = roleModule?.permissions?.map((p) => p.id) || [];
  });

  setMatrix(map);
  setSelectedRole(role);
};

  const togglePermission = (moduleId: number, permissionId: number) => {
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

const saveModulePermissions = async (moduleId: number) => {
  if (!selectedRole) return;

  try {
    setSavingModule(moduleId);

    await fetch(`${BASE_URL}/admin/roles/permissions`, {
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
    });

    // ✅ Update roles state (important)
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRole.id) return role;

        return {
          ...role,
          modules: role.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;

            return {
              ...mod,
              permissions: permissions.filter((p) =>
                (matrix[moduleId] || []).includes(p.id)
              ),
            };
          }),
        };
      })
    );

    // ✅ Also update selectedRole so UI stays in sync
    setSelectedRole((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;

          return {
            ...mod,
            permissions: permissions.filter((p) =>
              (matrix[moduleId] || []).includes(p.id)
            ),
          };
        }),
      };
    });

    toast.success("Permission Changed");
  } finally {
    setSavingModule(null);
  }
};

  const selectedCount = useMemo(() => {
    return Object.values(matrix).reduce((acc, arr) => acc + arr.length, 0);
  }, [matrix]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-black/10" />
        <div className="h-14 w-64 animate-pulse rounded-2xl bg-black/10" />
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-3xl border border-white/10 bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[color:var(--text-primary)]">
      <section className="sticky top-0 z-20 -mx-2 rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              RBAC Control Center
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">
                Role · Module · Permission
              </h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Manage access with a cleaner, faster permission matrix.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Selected permissions
              </p>
              <p className="mt-1 text-lg font-semibold">{selectedCount}</p>
            </div>

            <RoleSelect
              roles={roles}
              selectedRole={selectedRole}
              selectRole={selectRole}
            />
          </div>
        </div>
      </section>

      {!selectedRole ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/10 px-6 text-center backdrop-blur-xl">
          <div className="mb-4 rounded-full border border-white/15 bg-white/10 p-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Choose a role to begin</h2>
          <p className="mt-2 max-w-md text-sm text-[color:var(--text-muted)]">
            Select a role from the dropdown to view and edit module-level permissions.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {modules.map((module) => {
            const activeCount = matrix[module.id]?.length || 0;

            return (
              <section
                key={module.id}
                className="group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.10)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(0,0,0,0.16)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />

                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Module
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {module.code}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {activeCount} permission{activeCount !== 1 ? "s" : ""} enabled
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                      Role
                    </p>
                    <p className="text-sm font-semibold">{selectedRole.code}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {permissions.map((perm) => {
                    const checked =
                      matrix[module.id]?.includes(perm.id) || false;

                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(module.id, perm.id)}
                        className={[
                          "rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200",
                          checked
                            ? "border-blue-500/30 bg-blue-500/15 text-blue-700 shadow-[0_6px_20px_rgba(59,130,246,0.16)]"
                            : "border-white/15 bg-white/10 text-[color:var(--text-primary)] hover:bg-white/15",
                        ].join(" ")}
                      >
                        {perm.action}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => saveModulePermissions(module.id)}
                    disabled={savingModule === module.id}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(79,70,229,0.36)] disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {savingModule === module.id ? "Saving..." : `Save ${module.code}`}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}