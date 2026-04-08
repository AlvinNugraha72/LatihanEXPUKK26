"use client";

export default function SiswaActionDropdown({ onDelete }) {
  return (
    <div className="dropdown dropdown-left dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-xs btn-neutral rounded-none border-2 border-black font-black uppercase">Opsi ▾</div>
      <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-xl bg-white border-2 border-black rounded-none w-40 text-black font-black uppercase text-[10px]">
        <li>
            <button 
                onClick={onDelete}
                className="hover:bg-red-50 text-red-600 font-bold"
            >
                🗑️ Hapus Siswa
            </button>
        </li>
      </ul>
    </div>
  );
}
