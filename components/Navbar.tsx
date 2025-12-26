"use client";

import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <nav className="w-full h-20 bg-gray-800 text-white flex items-center justify-between px-6">
      <div className="text-xl font-bold cursor-pointer" onClick={() => router.push("/dashboard")}>
        MyLogo
      </div>

      <div className="relative">
        <button className="focus:outline-none">
          <img
            src="/person_17111697.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg hidden group-hover:block">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
