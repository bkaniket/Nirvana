"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [user_firstName, setFirstName] = useState("");
  const [user_lastName, setLastName] = useState("");
  const [email_id, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Unauthorized");
      router.push("/login");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        user_firstName,
        user_lastName,
        email_id,
        password,
        roles: [role], // ✅ REQUIRED BY BACKEND
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("User created successfully");
    router.push("/users");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create New User</h1>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br />

        <input
          placeholder="First Name"
          value={user_firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        /><br />

        <input
          placeholder="Last Name"
          value={user_lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        /><br />

        <input
          type="email"
          placeholder="Email"
          value={email_id}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="REVIEWER">Reviewer</option>
          <option value="EMPLOYEE">Employee</option>
        </select><br />

        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
