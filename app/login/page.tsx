"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
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
          className="w-[340px] p-6 rounded-lg
        bg-gradient-to-bl from-[#3C6FA3] via-[#274A7C] to-[#1E2F5E]
        border border-white/30
        ring-1 ring-black/40
shadow-[0_10px_30px_rgba(0,0,0,0.6)]
backdrop-blur-md"
        >
          <h1 className="text-3xl font-semibold font-sans text-center mb-8 text-white tracking-wide drop-shadow-lg">
            Estateflow
          </h1>






          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm text-white/90 font-medium block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="w-full h-8 px-2 text-sm
              bg-white text-black
              border border-gray-300
              focus:outline-none focus:ring-1 focus:ring-cyan-400"

              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/90 font-medium block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full h-8 px-2 text-sm
              bg-white text-black
              border border-gray-300
              focus:outline-none focus:ring-1 focus:ring-cyan-400"

              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-52 h-9 mt-2
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
