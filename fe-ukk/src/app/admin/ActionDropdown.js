"use client";

import Link from "next/link";
import { updateStatusAction } from "@/lib/actions";

export default function ActionDropdown({ docId, currentStatus, hideInvalid, kategori, statusFilter }) {
  const handleStatusUpdate = async (newStatus) => {
    if (confirm(`Ubah status menjadi ${newStatus}?`)) {
      await updateStatusAction(docId, newStatus);
    }
  };

  return (
    <div className="dropdown dropdown-left dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-xs btn-neutral rounded-none border-2 border-black font-black">AKSI ▾</div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-white border-2 border-black rounded-none w-40 text-black font-bold uppercase text-xs">
        <li className="menu-title text-[10px] opacity-50">Ubah Status</li>
        <li><button onClick={() => handleStatusUpdate("Proses")} className="text-blue-600">⚡ Proses</button></li>
        <li><button onClick={() => handleStatusUpdate("Selesai")} className="text-green-600">✅ Selesai</button></li>
        <li><button onClick={() => handleStatusUpdate("Invalid")} className="text-red-600">❌ Invalid</button></li>
        <li><button onClick={() => handleStatusUpdate("Menunggu")}>⏳ Menunggu</button></li>
      </ul>
    </div>
  );
}
