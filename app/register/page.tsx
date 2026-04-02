"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  Shield,
  Check,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

const roleOptions = [
  { id: 1, value: "ADMIN", label: "Admin", code: "ADMIN" },
  { id: 2, value: "MANAGER", label: "Manager", code: "MANAGER" },
  { id: 3, value: "REVIEWER", label: "Reviewer", code: "REVIEWER" },
  { id: 4, value: "EMPLOYEE", label: "Employee", code: "EMPLOYEE" },
];

type RoleOption = typeof roleOptions[number];


export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [user_firstName, setFirstName] = useState("");
  const [user_lastName, setLastName] = useState("");
  const [email_id, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setRole((prev) => prev || null); // Keep selected but close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Unauthorized");
      router.push("/login");
      return;
    }


    if (!role) {
      alert("Please select a role");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          user_firstName,
          user_lastName,
          email_id,
          password,
          roles: [role.value],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("User created successfully");
      router.push("/users");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[color:var(--text-primary)]">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              <UserPlus className="h-3.5 w-3.5" />
              User Onboarding
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create New User
              </h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Add a new account, assign a role, and prepare access in one place.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Default role
              </p>
              <p className="mt-1 text-sm font-semibold">{role?.label || "Not selected"}</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Access mode
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Controlled creation
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Main Form */}
        <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_12px_35px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Account details</h2>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Fill in the user information below.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 md:inline-flex">
              Admin Form
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Username"
                placeholder="Enter username"
                value={username}
                onChange={setUsername}
                icon={<User className="h-4 w-4" />}
              />

              {/* Animated Role Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--text-primary)]">
                  Role
                </label>
                <RoleSelect
                  ref={wrapperRef}
                  options={roleOptions}
                  selectedRole={role}
                  onSelect={(selected) => setRole(selected)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="First name"
                placeholder="Enter first name"
                value={user_firstName}
                onChange={setFirstName}
                icon={<User className="h-4 w-4" />}
              />

              <FormField
                label="Last name"
                placeholder="Enter last name"
                value={user_lastName}
                onChange={setLastName}
                icon={<Users className="h-4 w-4" />}
              />
            </div>

            <FormField
              label="Email address"
              type="email"
              placeholder="Enter email"
              value={email_id}
              onChange={setEmail}
              icon={<Mail className="h-4 w-4" />}
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              onTogglePassword={setShowPassword}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/users")}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-[color:var(--text-primary)] backdrop-blur-xl transition hover:bg-white/15"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !role}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.30)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(79,70,229,0.38)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? "Creating User..." : "Create User"}
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
            <h3 className="text-lg font-semibold">Preview</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Live summary of the account being created.
            </p>

            <div className="mt-5 rounded-[24px] border border-white/15 bg-white/10 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-700">
                  <User className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user_firstName || user_lastName
                      ? `${user_firstName} ${user_lastName}`.trim()
                      : "New team member"}
                  </p>
                  <p className="truncate text-xs text-[color:var(--text-muted)]">
                    {email_id || "user@email.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <PreviewRow label="Username" value={username || "Not entered"} />
                <PreviewRow label="Role" value={role?.label || "Not selected"} />
                <PreviewRow
                  label="Password"
                  value={password ? `${password.length} characters` : "Not entered"}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
            <h3 className="text-lg font-semibold">Tips</h3>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--text-muted)]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                Use a unique username for easier identification.
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                Assign the minimum role needed for the user.
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                Verify email format before submitting access.
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

// Animated Role Dropdown Component (Exact copy from RolePermissionEditor)
function RoleSelect({
  options,
  selectedRole,
  onSelect,
}: {
  options: RoleOption[];
  selectedRole: RoleOption | null;
  onSelect: (role: RoleOption) => void;
}) {
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
              {selectedRole?.label || "Choose a role"}
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
              {options.map((roleOption) => {
                const active = selectedRole?.id === roleOption.id;

                return (
                  <motion.button
                    key={roleOption.id}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelect(roleOption);
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
                        {roleOption.label}
                      </p>
                      <p
                        className={[
                          "mt-0.5 text-xs",
                          active ? "text-white/80" : "text-[color:var(--text-muted)]",
                        ].join(" ")}
                      >
                        {roleOption.code} role permission profile
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

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
};

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[color:var(--text-primary)]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-white py-3 pl-11 pr-4 text-sm font-medium text-[color:var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline-none ring-1 ring-black/5 placeholder:text-[color:var(--text-muted)] transition duration-200 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/15"
        />
      </div>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: (show: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[color:var(--text-primary)]">
        Password
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-white py-3 pl-11 pr-12 text-sm font-medium text-[color:var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline-none ring-1 ring-black/5 placeholder:text-[color:var(--text-muted)] transition duration-200 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/15"
        />

        <button
          type="button"
          onClick={() => onTogglePassword(!showPassword)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[color:var(--text-muted)] transition hover:bg-black/5"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
      <span className="text-[color:var(--text-muted)]">{label}</span>
      <span className="max-w-[60%] truncate font-semibold text-[color:var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}