"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [user_firstName, setFirstName] = useState("");
    const [user_lastName, setLastName] = useState("");
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user_type, setUserType] = useState("user");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // If no token, redirect to login
    useEffect(() => {
        if (!token) {
            alert("You must be logged in as admin to create users.");
            router.push("/login");
        }
    }, [token]);

    const handleRegister = async (e: any) => {
        e.preventDefault();

        if (!token) {
            alert("Unauthorized. No token found.");
            return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,   // <-- TOKEN ADDED HERE
            },
            body: JSON.stringify({
                username,
                user_firstName,
                user_lastName,
                email_id,
                password,
                user_type,
            }),
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
            alert("User created successfully!");
            router.push("/dashboard");
        } else {
            alert(data.message || "Registration failed");
        }
    };

    return (
        <div style={{ padding: "40px" }}>
            <h1>Register New User</h1>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br />

                <input
                    type="text"
                    placeholder="First Name"
                    value={user_firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                /><br />

                <input
                    type="text"
                    placeholder="Last Name"
                    value={user_lastName}
                    onChange={(e) => setLastName(e.target.value)}
                /><br />

                <input
                    type="email"
                    placeholder="Email"
                    value={email_id}
                    onChange={(e) => setEmail(e.target.value)}
                /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br />

                <select
                    value={user_type}
                    onChange={(e) => setUserType(e.target.value)}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="admin">Finance</option>
                    <option value="admin">Default</option>
                </select><br />

                <button type="submit">Create User</button>
            </form>
        </div>
    );
}
