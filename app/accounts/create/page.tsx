"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/app/lib/permission";

export default function CreateExpensePage() {
  const router = useRouter();
  const canCreate = hasPermission("EXPENSE", "create");
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const [form, setForm] = useState({
      
    expense_year: "",
    expense_period: "",
    expense_category: "",
    amount: "",
    currency: "USD",
    status: "Active",
  });

  useEffect(() => {
    if (!canCreate) router.replace("/accounts");
  }, [canCreate, router]);

  const submit = async () => {
    const token = sessionStorage.getItem("token");

    await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    router.push("/accounts");
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Create Expense</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key.replace("_", " ")}
          className="w-full border p-2 rounded"
          value={(form as any)[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
        />
      ))}

      <button
        onClick={submit}
        className="px-6 py-2 bg-blue-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
