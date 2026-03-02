"use client";

import { useRouter } from "next/navigation";

export default function AdminFilters({ 
  categories, 
  currentKategori, 
  currentStatus, 
  hideInvalid, 
  showHideInvalid = true,
  showCategory = true,
  showStatus = true 
}) {
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white border-2 border-black p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {showCategory && (
          <div className="form-control">
            <label className="label py-0"><span className="label-text font-black uppercase text-xs">Kategori</span></label>
            <select 
              className="select select-sm select-bordered border-2 border-black rounded-none font-bold focus:outline-none"
              value={currentKategori || "Semua"}
              onChange={(e) => updateFilters({ kategori: e.target.value })}
            >
              <option value="Semua">Tampilkan Semua</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.ket_kategori}</option>
              ))}
            </select>
          </div>
        )}

        {showStatus && (
          <div className="form-control">
            <label className="label py-0"><span className="label-text font-black uppercase text-xs">Status</span></label>
            <select 
              className="select select-sm select-bordered border-2 border-black rounded-none font-bold focus:outline-none"
              value={currentStatus || "Semua"}
              onChange={(e) => updateFilters({ status: e.target.value })}
            >
              <option value="Semua">Tampilkan Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
              <option value="Invalid">Invalid</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {showHideInvalid && (
          <button 
            onClick={() => updateFilters({ hideInvalid: !hideInvalid })}
            className={`btn btn-sm font-black rounded-none border-2 border-black ${hideInvalid ? 'bg-yellow-400 text-black' : 'bg-white text-black hover:bg-gray-100'}`}
          >
            {hideInvalid ? "TAMPILKAN INVALID" : "SEMBUNYIKAN INVALID"}
          </button>
        )}
      </div>
    </div>
  );
}
