"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
const BASE_URL = process.env.Backend_API;

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

    const res = await fetch(`${BASE_URL}/api/register`, {
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
    <div>
      <label>Username</label>
      <br />
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
    </div>

    <br />

    <div>
      <label>First Name</label>
      <br />
      <input
        type="text"
        placeholder="Enter first name"
        value={user_firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
    </div>

    <br />

    <div>
      <label>Last Name</label>
      <br />
      <input
        type="text"
        placeholder="Enter last name"
        value={user_lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
    </div>

    <br />

    <div>
      <label>Email</label>
      <br />
      <input
        type="email"
        placeholder="Enter email"
        value={email_id}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    <br />

    <div>
      <label>Password</label>
      <br />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    <br />

    <div>
      <label>Role</label>
      <br />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="REVIEWER">Reviewer</option>
        <option value="EMPLOYEE">Employee</option>
      </select>
    </div>

    <br />

    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create User</button>
  </form>
</div>

  );
}
