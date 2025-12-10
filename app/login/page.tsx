"use client";

import { useState } from "react";
import { useRouter } from"next/navigation";

export default function LoginPage() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e: any) => {
        e.preventDefault();

        const res = await fetch("http://127.0.0.1:8000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_id, password }),
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
            alert("Login Successful!");
            localStorage.setItem("token", data.token);
            // ✅ Redirect to dashboard
            router.push("/dashboard");
        } else {
            alert(data.message || "Login failed");
        }
    };

    return (

        <div style={{ padding: "40px" }}>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>
            </form>
        </div>
    );
}
