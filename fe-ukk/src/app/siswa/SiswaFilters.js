"use client";

import { useRouter } from "next/navigation";

export default function SiswaFilters({ categories, currentKategori, currentStatus }) {
  const router = useRouter();

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(window.location.search);
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === "Semua" || newFilters[key] === null) {
        params.delete(key);
      } else {
        params.set(key, newFilters[key]);
      }
    });
    // Reset page on filter change
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#000]">
      <div className="form-control">
        <label className="label py-0"><span className="label-text font-black uppercase text-[10px] opacity-50">Filter Kategori</span></label>
        <select 
          className="select select-sm select-bordered border-2 border-black rounded-none font-bold focus:outline-none bg-white"
          value={currentKategori || "Semua"}
          onChange={(e) => updateFilters({ kategori: e.target.value })}
        >
          <option value="Semua">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.ket_kategori}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label py-0"><span className="label-text font-black uppercase text-[10px] opacity-50">Filter Status</span></label>
        <select 
          className="select select-sm select-bordered border-2 border-black rounded-none font-bold focus:outline-none bg-white"
          value={currentStatus || "Semua"}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="Semua">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Proses">Proses</option>
          <option value="Selesai">Selesai</option>
          <option value="Invalid">Invalid</option>
        </select>
      </div>

      <button 
        onClick={() => router.push("/siswa")}
        className="btn btn-sm btn-ghost font-black hover:bg-gray-100 uppercase text-[10px] border-2 border-transparent hover:border-black rounded-none"
      >
        Reset Filter
      </button>
    </div>
  );
}
