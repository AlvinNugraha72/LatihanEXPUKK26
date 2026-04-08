"use client";

import Link from "next/link";
import { deleteKategoriAction } from "@/lib/actions";

export default function KategoriActionDropdown({ docId }) {
  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      await deleteKategoriAction(docId);
    }
  };

  return (
    <div className="dropdown dropdown-left dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-xs btn-neutral rounded-none border-2 border-black font-black uppercase">Opsi ▾</div>
      <ul tabIndex={0} className="dropdown-content z-[2] menu p-2 shadow-xl bg-white border-2 border-black rounded-none w-44 text-black font-black uppercase text-[10px]">
        <li>
            <button 
                onClick={handleDelete}
                className="hover:bg-red-50 text-red-600 font-bold"
            >
                🗑️ Hapus Kategori
            </button>
        </li>
      </ul>
    </div>
  );
}
