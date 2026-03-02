"use client";

import { useRouter } from "next/navigation";

export default function ArsipFilters({ currentStatuses }) {
  const router = useRouter();
  
  // currentStatuses is an array like ["Selesai", "Invalid"]
  const statuses = currentStatuses || ["Selesai", "Invalid"];

  const toggleStatus = (status) => {
    let newStatuses = [...statuses];
    if (newStatuses.includes(status)) {
      newStatuses = newStatuses.filter(s => s !== status);
    } else {
      newStatuses.push(status);
    }
    
    // If none selected, maybe default back to both or handle empty state
    const params = new URLSearchParams(window.location.search);
    if (newStatuses.length === 0) {
        params.delete("status");
    } else {
        params.set("status", newStatuses.join(","));
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-6 items-center mb-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#999]">
      <span className="font-black uppercase text-xs tracking-widest italic">Pilih Status Arsip:</span>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            className="checkbox checkbox-success rounded-none border-2 border-black" 
            checked={statuses.includes("Selesai")}
            onChange={() => toggleStatus("Selesai")}
          />
          <span className="font-bold uppercase text-xs group-hover:underline">Selesai</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            className="checkbox checkbox-error rounded-none border-2 border-black" 
            checked={statuses.includes("Invalid")}
            onChange={() => toggleStatus("Invalid")}
          />
          <span className="font-bold uppercase text-xs group-hover:underline">Invalid</span>
        </label>
      </div>
    </div>
  );
}
