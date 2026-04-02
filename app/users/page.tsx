"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";
import {
  BadgeCheck,
  Info,
  Loader2,
  Plus,
  Shield,
  ShieldAlert,
  UserCog,
  Users,
} from "lucide-react";

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

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

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
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data: User[] = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch(`${BASE_URL}/admin/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch roles");
    const data: Role[] = await res.json();
    setRoles(data);
  };

  const toggleRole = async (userId: number, roleCode: string) => {
    setUpdatingUserId(userId);

    const user = users.find((u) => u.user_id === userId);
    if (!user) {
      setUpdatingUserId(null);
      return;
    }

    const targetRole = roles.find((r) => r.code === roleCode);
    if (!targetRole) {
      setUpdatingUserId(null);
      return;
    }

    const hasRole = user.roles.some((r) => r.code === roleCode);

    const updatedRoles = hasRole
      ? user.roles.filter((r) => r.code !== roleCode).map((r) => r.id)
      : [...user.roles.map((r) => r.id), targetRole.id];

    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_ids: updatedRoles }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update roles");
      }

      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalUsers = users.length;

  const adminCount = useMemo(
    () => users.filter((user) => user.roles.some((role) => role.code === "ADMIN")).length,
    [users]
  );

  const multiRoleCount = useMemo(
    () => users.filter((user) => user.roles.length > 1).length,
    [users]
  );

  const totalAssignments = useMemo(
    () => users.reduce((acc, user) => acc + user.roles.length, 0),
    [users]
  );

  if (loading) {
    return (
      <div className="space-y-6 text-[color:var(--text-primary)]">
        <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl">
          <div className="h-8 w-64 animate-pulse rounded-2xl bg-black/10" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded-xl bg-black/10" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[24px] border border-white/10 bg-white/10"
            />
          ))}
        </div>

        <div className="h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              <UserCog className="h-3.5 w-3.5" />
              Access Governance
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                User Access Management
              </h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Assign roles to users and control inherited permissions from one place.
              </p>
            </div>
          </div>

          {isAdmin && canCreateUser && (
            <button
              onClick={() => router.push("/register")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.30)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(79,70,229,0.38)]"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total users"
          value={String(totalUsers)}
          tint="from-blue-500/15 to-cyan-500/15"
          iconColor="text-blue-700"
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="Active roles"
          value={String(roles.length)}
          tint="from-violet-500/15 to-fuchsia-500/15"
          iconColor="text-violet-700"
        />
        <StatCard
          icon={<BadgeCheck className="h-5 w-5" />}
          label="Admins"
          value={String(adminCount)}
          tint="from-emerald-500/15 to-green-500/15"
          iconColor="text-emerald-700"
        />
        <StatCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Multi-role users"
          value={String(multiRoleCount)}
          tint="from-amber-500/15 to-orange-500/15"
          iconColor="text-amber-700"
        />
      </section>

      <section className="rounded-[24px] border border-blue-200/40 bg-blue-500/10 p-4 shadow-[0_8px_24px_rgba(59,130,246,0.08)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-blue-500/15 p-2 text-blue-700">
            <Info className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[color:var(--text-primary)]">
              Permissions come from roles
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              To change module actions like create, view, edit, or approve, update the role permissions instead of changing user-level access directly.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Role assignment matrix</h2>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {totalAssignments} total role assignments across {totalUsers} users.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-[color:var(--text-muted)]">
            Toggle a role to update access
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl">
              <tr className="border-b-2 border-white/20">
                <th className="min-w-[220px] border-r-2 border-white/20 px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  User
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)] border-l-2 border-white/20 first:border-l-0 last:border-r-2"
                  >
                    <div className="mx-auto inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1">
                      {role.code}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.user_id}
                  className={[
                    "border-b-2 border-white/15 transition hover:bg-white/5",
                    index === users.length - 1 ? "border-b-0" : "",
                  ].join(" ")}
                >
                  <td className="border-r-2 border-white/20 bg-white/5 backdrop-blur-sm">
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-700">
                          <Users className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
                            {user.username}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600"
                                >
                                  {role.code}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[color:var(--text-muted)]">
                                No roles assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {roles.map((role) => {
                    const checked = user.roles.some((r) => r.code === role.code);
                    const disabled =
                      updatingUserId === user.user_id ||
                      (user.user_id === loggedInUserId && role.code === "ADMIN");

                    return (
                      <td
                        key={role.id}
                        className={[
                          "py-4 px-3 text-center align-middle",
                          "border-l-2 border-white/20 first:border-l-0",
                          checked ? "bg-green-500/5" : "",
                          disabled ? "opacity-50" : "",
                        ].join(" ")}
                      >
                        {/* Uiverse-style toggle - EXACT copy */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleRole(user.user_id, role.code)}
                          />
                          <div className={`
                            group peer bg-white/80 backdrop-blur-sm rounded-full duration-300 w-16 h-8 
                            ring-2 ring-red-500/60 after:duration-300 after:bg-red-500/80 
                            peer-checked:after:bg-green-500/80 peer-checked:ring-green-500/60 
                            after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 
                            after:flex after:justify-center after:items-center 
                            peer-checked:after:translate-x-8 peer-hover:after:scale-95 
                            shadow-lg ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                          `}>
                            {updatingUserId === user.user_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500 mt-0.5" />
                            ) : checked ? (
                              <BadgeCheck className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                            ) : null}
                          </div>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  iconColor: string;
}) {
  return (
    <div className="group rounded-[24px] border border-white/15 bg-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
            {value}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br",
            tint,
            iconColor,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}