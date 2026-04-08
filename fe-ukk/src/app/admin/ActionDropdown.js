"use client";

import { updateStatusAction } from "@/lib/actions";

export default function ActionDropdown({ docId, currentStatus }) {
  const handleStatusUpdate = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    if (confirm(`Ubah status laporan menjadi "${newStatus}"?`)) {
      await updateStatusAction(docId, newStatus);
    } else {
        // Force refresh to current status if cancelled
        e.target.value = currentStatus;
    }
  };

  return (
    <select 
        value={currentStatus}
        onChange={handleStatusUpdate}
        className={`select select-xs rounded-none border-2 border-black font-black uppercase focus:outline-none transition-all cursor-pointer
            ${currentStatus === "Menunggu" ? "bg-gray-200" : 
              currentStatus === "Proses" ? "bg-blue-300" : 
              currentStatus === "Selesai" ? "bg-green-300" : "bg-red-300"}`}
    >
        <option value="Menunggu" className="bg-white text-black">⏳ Menunggu</option>
        <option value="Proses" className="bg-white text-blue-600">⚡ Proses</option>
        <option value="Selesai" className="bg-white text-green-600">✅ Selesai</option>
        <option value="Invalid" className="bg-white text-red-600">❌ Invalid</option>
    </select>
  );
}
