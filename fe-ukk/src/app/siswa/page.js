import { redirect } from "next/navigation";
import Link from "next/link";
import { getLaporanAction, getMeAction, logoutAction, deletePengaduanSiswaAction, getKategoriAction } from "@/lib/actions";
import SiswaFilters from "./SiswaFilters";
import Pagination from "../admin/Pagination";

export default async function SiswaPage({ searchParams }) {
  // 1. Auth & Data (Server Side)
  const user = await getMeAction();
  if (!user || user.role !== "Siswa") redirect("/");

  const sParams = await searchParams;
  const page = Number(sParams?.page) || 1;
  const idKategori = sParams?.kategori || "Semua";
  const status = sParams?.status || "Semua";

  const res = await getLaporanAction({ idSiswa: user.id, idKategori, status }, page, 10);
  const data = res.data || [];
  const meta = res.meta || { pagination: { pageCount: 0 } };

  const katRes = await getKategoriAction();
  const categories = katRes.data || [];

  // 2. Modal Logic (URL Based)
  const showModalId = sParams?.id;
  const selectedReport = showModalId ? data.find(item => item.documentId === showModalId) : null;

  // Helper for Category Name
  const getCategoryName = (item) => {
     let cat = item.kategori || item.kategoris;
     if (Array.isArray(cat) && cat.length > 0) return cat[0].ket_kategori;
     if (cat && typeof cat === 'object') return cat.ket_kategori;
     return "-";
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
        {/* Navbar */}
        <div className="bg-white border-b-4 border-black px-6 py-4 flex flex-row justify-between items-center sticky top-0 z-40">
            <Link href="/siswa" className="text-2xl font-black uppercase tracking-tighter italic hover:opacity-70 transition-opacity">
                📢 Pengaduan Siswa
            </Link>
            
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase opacity-40 leading-none mb-1 text-right">Tersambung Sebagai</span>
                    <span className="font-black uppercase text-sm leading-none">{user.nama}</span>
                </div>
                
                <form action={async () => {
                    "use server";
                    await logoutAction();
                }}>
                    <button type="submit" className="btn btn-sm btn-error rounded-none border-2 border-black font-black uppercase px-6 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none translate-y-[-2px] hover:translate-y-0 text-white">
                        Log Out
                    </button>
                </form>
            </div>
        </div>

        <main className="container mx-auto p-6 md:p-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black mb-2 uppercase">Halo, {user.nama}</h1>
                    <p className="opacity-75 font-medium">Laporkan kerusakan atau masalah di sekitarmu.</p>
                </div>
                <Link href="/siswa/tambah" className="btn btn-primary font-black border-2 border-black rounded-none hover:bg-neutral hover:text-white">
                    + BUAT LAPORAN
                </Link>
            </div>

            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-black uppercase">Riwayat Laporan Saya</h2>
                    
                    {/* Siswa Filters */}
                    <SiswaFilters 
                        categories={categories} 
                        currentKategori={idKategori} 
                        currentStatus={status} 
                    />
                </div>
                
                {/* TABLE (Server Rendered) */}
                <div className="overflow-x-auto border-2 border-black bg-white rounded-none shadow-[12px_12px_0_0_#000] mb-6">
                    <table className="table">
                        <thead className="bg-black text-white uppercase font-black text-sm">
                            <tr>
                                <th className="rounded-none py-4 pl-6">No</th>
                                <th>Lokasi</th>
                                <th>Kategori</th>
                                <th>Status</th>
                                <th className="text-center rounded-none">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-black font-bold text-sm">
                            {data.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 font-black text-2xl uppercase opacity-20">Belum ada laporan</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.documentId || index} className="border-b-2 border-gray-100 last:border-none hover:bg-gray-50">
                                        <td className="pl-6">{(page - 1) * 10 + index + 1}</td>
                                        <td>{item.lokasi}</td>
                                        <td>{getCategoryName(item)}</td>
                                        <td>
                                            <div className={`badge rounded-none font-bold border-2 border-black ${
                                                item.status_laporan === 'Selesai' ? 'bg-green-400 text-black' : 
                                                item.status_laporan === 'Proses' ? 'bg-yellow-400 text-black' :
                                                item.status_laporan === 'Invalid' ? 'bg-red-500 text-white' : 
                                                'bg-gray-200 text-black'
                                            }`}>
                                                {item.status_laporan}
                                            </div>
                                        </td>
                                        <td className="flex justify-center gap-2">
                                            {/* Link to open modal via URL */}
                                            <Link 
                                                href={`/siswa?id=${item.documentId}`}
                                                className="btn btn-sm btn-info rounded-none border-2 border-black text-white font-black hover:bg-blue-600"
                                                scroll={false}
                                            >
                                                DETAIL
                                            </Link>
                                            
                                            {/* Delete Action (Server Form) */}
                                            {item.status_laporan === "Menunggu" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await deletePengaduanSiswaAction(item.documentId);
                                                }}>
                                                    <button 
                                                        type="submit"
                                                        className="btn btn-sm btn-error rounded-none border-2 border-black text-white font-black hover:bg-red-600"
                                                    >
                                                        HAPUS
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} pageCount={meta.pagination.pageCount} />
            </div>
        </main>

        {/* MODAL (Server Rendered) */}
        {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                {/* Overlay Link to Close */}
                <Link 
                    href={`/siswa?kategori=${idKategori}&status=${status}&page=${page}`} 
                    className="absolute inset-0 cursor-default" 
                    scroll={false} 
                />
                
                <div className="bg-white w-full max-w-xl border-4 border-black p-0 z-10 shadow-[20px_20px_0_0_#000]">
                    <div className="bg-black text-white p-6 flex justify-between items-start">
                         <div>
                            <h3 className="font-black text-2xl uppercase italic">Detail Laporan Siswa</h3>
                            <p className="text-xs opacity-70 mt-1 uppercase tracking-widest">ID: {selectedReport.documentId}</p>
                         </div>
                         <Link 
                            href={`/siswa?kategori=${idKategori}&status=${status}&page=${page}`} 
                            className="btn btn-sm btn-circle btn-ghost text-white text-xl" 
                            scroll={false}
                         >✕</Link>
                    </div>

                    <div className="p-8 space-y-6 text-black">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Lokasi Kejadian</span>
                                <div className="font-bold text-lg border-b-2 border-black pb-2">{selectedReport.lokasi}</div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Kategori Laporan</span>
                                <div className="font-bold text-lg border-b-2 border-black pb-2">{getCategoryName(selectedReport)}</div>
                            </div>
                         </div>
                         
                         <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Deskripsi Laporan</span>
                            <div className="p-4 bg-gray-50 border-2 border-black font-medium min-h-[100px] mt-2 rotate-1">
                                {selectedReport.ket}
                            </div>
                         </div>

                         {/* Foto Kejadian */}
                         {selectedReport.foto && (
                            <div>
                              <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Foto Kejadian</span>
                              <div className="mt-2 border-2 border-black overflow-hidden bg-gray-100 flex justify-center">
                                <img 
                                  src={selectedReport.foto.url.startsWith('http') ? selectedReport.foto.url : `http://127.0.0.1:1337${selectedReport.foto.url}`} 
                                  alt="Foto Kejadian" 
                                  className="w-full h-auto object-contain max-h-[250px]"
                                />
                              </div>
                            </div>
                         )}

                         <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Status Progres Laporan</span>
                            <div className={`p-2 border-2 border-black font-black text-center uppercase mt-1 ${
                                selectedReport.status_laporan === 'Selesai' ? 'bg-green-400' : 
                                selectedReport.status_laporan === 'Proses' ? 'bg-yellow-400' :
                                selectedReport.status_laporan === 'Invalid' ? 'bg-red-500 text-white' : 
                                'bg-gray-100'
                            }`}>
                                {selectedReport.status_laporan}
                            </div>
                         </div>
                         
                         {selectedReport.feedback && (
                             <div>
                                <div className="divider before:bg-black after:bg-black font-black uppercase text-xs italic tracking-widest py-2 text-blue-600">Respon Petugas</div>
                                <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-400 font-bold text-sm">
                                    {selectedReport.feedback}
                                </div>
                             </div>
                         )}
                    </div>

                    <div className="p-6 bg-gray-100 border-t-2 border-black flex justify-end gap-3">
                        <Link 
                            href={`/siswa?kategori=${idKategori}&status=${status}&page=${page}`} 
                            className="btn bg-black text-white hover:bg-neutral rounded-none border-0 px-10 font-black" 
                            scroll={false}
                        >TUTUP DETAIL</Link>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
