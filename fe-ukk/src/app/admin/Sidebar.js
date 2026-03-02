"use client";

import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
        await logoutAction();
    }
  };

  const menuItems = [
    { label: "DASHBOARD", path: "/admin" },
    { label: "KELOLA KATEGORI", path: "/admin/kategori" },
    { label: "LAPORAN MASUK", path: "/admin/menunggu" },
    { label: "ARSIP LAPORAN", path: "/admin/arsip" },
    { label: "SISWA/I", path: "/admin/kelola_siswa"},
  ];

  return (
      <aside className="w-64 bg-white border-r-2 border-black hidden md:flex flex-col p-6 fixed h-full z-10">
        <div className="text-2xl font-black tracking-tighter mb-10">ADMIN PANEL</div>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`font-black cursor-pointer px-4 py-3 border-2 transition-all uppercase tracking-wide ${
                pathname === item.path
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-transparent hover:border-black"
              }`}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="font-black cursor-pointer px-4 py-3 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all text-left w-full uppercase tracking-wide"
        >
          LOGOUT
        </button>
      </aside>
  );
}
