"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  user_id: number;
  username: string;
  email_id: string;
  roles: string[];
};

export default function NavBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedRoles = sessionStorage.getItem("roles");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setOpen(false);
    router.push("/login");
  };

  return (
    <nav className="w-full h-20 bg-gray-800 text-white flex items-center justify-between px-6">
      {/* Logo */}
      <div
        className="text-xl font-bold cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        MyLogo
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="focus:outline-none"
        >
          <img
            src="/person_17111697.png"
            alt="Profile"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded shadow-lg z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b">
              <p className="font-semibold">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {roles.length > 0 ? roles.join(", ") : "No roles"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {user?.email_id}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
