"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoryFilter({ categories, currentId }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <span className="font-bold uppercase text-sm whitespace-nowrap">Filter Kategori:</span>
      <div className="flex gap-2 w-full md:w-auto">
        <Link 
          href="/siswa" 
          className={`btn btn-sm rounded-none border-2 border-black font-black ${currentId === "Semua" ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          SEMUA
        </Link>
        <select 
          className="select select-sm select-bordered border-2 border-black rounded-none font-bold focus:outline-none bg-white"
          onChange={(e) => {
            const val = e.target.value;
            router.push(val === "Semua" ? "/siswa" : `/siswa?kategori=${val}`);
          }}
          value={currentId}
        >
          <option value="Semua">Pilih Kategori...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.ket_kategori}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
