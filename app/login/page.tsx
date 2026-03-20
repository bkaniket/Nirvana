"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        throw new Error("Login failed");
      }

      const data = await res.json();

      // ✅ Session storage (RBAC compatible)
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("user_name", data.user.username || "");
      sessionStorage.setItem("roles", JSON.stringify(data.user.roles || []));
      sessionStorage.setItem(
        "permissions",
        JSON.stringify(data.permissions || {})
      );

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg("Your password or username is incorrect");

      // auto hide after 3 seconds
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  return (

    <div className="relative min-h-screen w-full">
      {errorMsg && (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
          <div className="flex items-center gap-3 bg-[#232531] text-white px-5 py-3 rounded-lg shadow-lg border border-red-500/40 backdrop-blur-md animate-[toastSlide_0.4s_ease-out_0s_both]">
            <div className="text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.01" />
              </svg>
            </div>
            <div className="text-sm font-medium">
              {errorMsg}
            </div>
          </div>
        </div>
      )}

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
          className="w-[420px] h-[320px] p-6 rounded-lg
        bg-gradient-to-bl from-[#3C6FA3] via-[#274A7C] to-[#1E2F5E]
        border border-white/30
        ring-1 ring-black/40
shadow-[0_10px_30px_rgba(0,0,0,0.6)]
backdrop-blur-md"
        >
          <h1 className="text-3xl font-semibold font-sans text-center mb-8 text-white tracking-wide drop-shadow-lg">
            Estateflow
          </h1>






          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-white/90 font-medium w-20">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="flex-1 h-9 px-3 text-sm
              bg-white text-black
              border border-gray-300
              focus:outline-none focus:ring-1 focus:ring-cyan-400"

              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-white/90 font-medium w-20">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="flex-1 h-9 px-2 text-sm
              bg-white text-black
              border border-gray-300
              focus:outline-none focus:ring-1 focus:ring-cyan-400"

              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ml-[96px] w-[220px] h-9 mt-4
bg-gradient-to-bl from-blue-600 to-cyan-500
text-white text-sm
hover:opacity-90 transition
cursor-pointer
active:scale-95 transform
disabled:cursor-not-allowed
disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
