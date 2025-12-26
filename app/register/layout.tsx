import NavBar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Right content */}
      <div className="flex flex-col flex-1">
        {/* Top Navbar */}
        <NavBar />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
