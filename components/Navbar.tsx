"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef ,useState } from "react";
import { createPortal } from "react-dom";

type User = {
  user_id: number;
  username: string;
  email_id: string;
  roles: string[];
};

type NavbarProps = {
  onMenuClick: () => void;
};
export default function NavBar({onMenuClick}: NavbarProps) {
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
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  return (
    <nav className="relative z-[999] w-full h-20 bg-gradient-to-b from-slate-900 to-[#0a172a] border-b border-white/10 text-white flex items-center justify-between px-6 shadow-2xl">

      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-4">
        {/* Hamburger only on small screens */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-white focus:outline-none"
        >
          ☰
        </button>

        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >

          {/* 
          Logo
          <Image src="/icons/close.png"
                        alt="Cross"
                        width={18}
                        height={18}
                        className="object-contain" /> */}
          
        </div>
        </div>
      
      {/* Professional Profile Dropdown */}
<div className="relative" ref={dropdownRef}>
  <button
  onClick={() => setOpen((prev) => !prev)}
  className="flex items-center gap-3 px-3 py-2 rounded-lg 
  bg-white/5 backdrop-blur-sm border border-white/10 
  shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
  focus:outline-none focus:ring-0 transition-all duration-200 group"
>
  {/* Avatar */}
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
  ring-2 ring-blue-400/30 shadow-[0_4px_16px_rgba(59,130,246,0.4)]
  flex items-center justify-center text-white font-semibold text-sm 
  relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/10 rounded-full" />
    {user?.username
      ? user.username.split(" ").map((n) => n[0]).join("").toUpperCase()
      : "U"}
  </div>

  {/* Username */}
  <div className="hidden md:block min-w-0 flex-1 max-w-28">
        <p className="text-sm font-medium text-white truncate">
          {user?.username || "User"}
        </p>
      </div>

  {/* Chevron */}
  <svg
    className={`w-4 h-4 text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>

  {open && (
    <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl 
shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-gray-200 
z-[9999] overflow-hidden animate-[fadeIn_.2s_ease]">

      {/* Email + Roles (Same Box) */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user?.email_id || "email@example.com"}
        </p>

        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {roles.slice(0, 3).map((role) => (
              <span
                key={role}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-2">

        {/* About */}
       <button
  onClick={() => {
    setOpen(false);
    router.push("/about");
  }}
  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
>
  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
    {/* Question Mark Icon */}
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
  <span>About</span>
</button>


        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" viewBox="0 0 512 512" fill="currentColor">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
            </svg>
          </div>
          <span>Sign out</span>
        </button>

      </div>
    </div>
  )}
</div>

    </nav>
  );
}
