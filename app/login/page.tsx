"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const errors = { username: "", password: "" };
    if (!trimmedUsername) errors.username = "Username is required";
    if (!trimmedPassword) errors.password = "Password is required";

    setFieldErrors(errors);
    setErrorMsg("");
    if (errors.username || errors.password) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.message || "Invalid username or password");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("user_name", data.user.username || "");
      localStorage.setItem("roles", JSON.stringify(data.user.roles || []));
      localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg("Your username or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/login-bg.jpg"
          alt="Login background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Center Content */}
      <div className="relative flex items-center justify-end min-h-screen pr-72">
        <div
          className="w-[420px] p-6 rounded-lg
          bg-gradient-to-bl from-[#3C6FA3] via-[#274A7C] to-[#1E2F5E]
          border border-white/30
          ring-1 ring-black/40
          shadow-[0_10px_30px_rgba(0,0,0,0.6)]
          backdrop-blur-md"
        >
          {/* ── Brand title – Syne font with gradient ── */}
          <h1 className="text-3xl [font-family:var(--font-syne)] font-bold tracking-wide text-center mb-8 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent drop-shadow-lg">
            EstateFlow
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Username */}
            <div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-white/90 font-medium w-20">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: "" }));
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  required
                  placeholder="Username Here..."
                  className={`flex-1 h-9 px-3 text-sm font-semibold font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]
                    bg-white text-gray-900 placeholder:text-gray-400 placeholder:font-normal
                    border focus:outline-none focus:ring-1 focus:ring-cyan-400
                    ${fieldErrors.username ? "border-red-400" : "border-gray-300"}`}
                />
              </div>
              {fieldErrors.username && (
                <p className="ml-[96px] mt-1 text-xs font-medium text-red-300 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-white/90 font-medium w-20">
                  Password
                </label>
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                      if (errorMsg) setErrorMsg("");
                    }}
                    disabled={loading}
                    required
                    placeholder="Password Here..."
                    className={`w-full h-9 pl-3 pr-9 text-sm font-semibold font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]
                      bg-white text-gray-900 placeholder:text-gray-400 placeholder:font-normal
                      border focus:outline-none focus:ring-1 focus:ring-cyan-400
                      ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
                  />
                  {/* Eye toggle */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      /* Eye-off */
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                        strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      /* Eye */
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                        strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {fieldErrors.password && (
                <p className="ml-[96px] mt-1 text-xs font-medium text-red-300 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit + error */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="ml-[96px] w-[220px] h-9 mt-4
                  bg-gradient-to-bl from-blue-600 to-cyan-500
                  text-white text-sm font-semibold
                  hover:opacity-90 transition
                  cursor-pointer
                  active:scale-95 transform
                  disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign in"}
              </button>

              {/* Auth error banner */}
              {errorMsg && (
                <div className="ml-[96px] mt-3 flex items-center gap-2 rounded-md border border-red-400/40 bg-red-500/20 px-3 py-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth={2}
                    strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 flex-shrink-0">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-xs font-semibold text-red-200">{errorMsg}</p>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}