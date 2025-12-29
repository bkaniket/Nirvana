"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email_id, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email_id, password }),
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
        <div className="width-full max-w-md mx-auto p-6 border border-gray-300 rounded mt-50 height-full border-rounded-lg shadow-lg">

      <h1 className="text-center m-2 mb-4">Login Page </h1>

      <form onSubmit={handleLogin}>
        <div className="flex flex-col">

        <label className="mb-1.5 ">Email Id</label>
        <input
        className=" font-medium mb-3 p-2 border border-gray-300 rounded"
          type="email"
          placeholder="Email"
           value={email_id}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <label className="mb-1.5">Password</label>
        <input
        className=" font-medium mb-3 p-2 border border-gray-300 rounded"
          type="password"
          placeholder="Password"
            value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        </div>

        <button className="px-5 py-2.5 text-lg bg-gray-300" type="submit"
          disabled={loading} >
        {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      </div>
  );
}
