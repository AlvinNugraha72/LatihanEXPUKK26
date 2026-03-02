import { redirect } from "next/navigation";
import Link from "next/link";
import { getLaporanAction, getMeAction, updateFeedbackAction, updateStatusAction, getKategoriAction } from "@/lib/actions";
import AdminFilters from "./AdminFilters";
import ActionDropdown from "./ActionDropdown";
import Pagination from "./Pagination";
import AdminDetailModal from "./AdminDetailModal";

export default async function AdminPage({ searchParams }) {
  const user = await getMeAction();
  if (!user || user.role !== "Admin") redirect("/");

  const sParams = await searchParams;
  const page = Number(sParams?.page) || 1;
  const kategori = sParams?.kategori || "Semua";
  const status = sParams?.status || "Semua";
  const hideInvalid = sParams?.hideInvalid === "true";

  // Fetch Stats (All data)
  const allRes = await getLaporanAction({}, 1, 1000);
  const allData = allRes.data || [];
  const stats = {
    total: allData.length,
    waiting: allData.filter(i => i.status_laporan === "Menunggu").length,
    completed: allData.filter(i => i.status_laporan === "Selesai").length,
    invalid: allData.filter(i => i.status_laporan === "Invalid").length,
  };

  // Fetch Table Data (Paginated & Filtered)
  const res = await getLaporanAction({ 
    idKategori: kategori, 
    status: status
  }, page, 10);
  
  let data = res.data || [];
  const meta = res.meta || { pagination: { pageCount: 0 } };

  if (hideInvalid) {
    data = data.filter(item => item.status_laporan !== "Invalid");
  }

  const katRes = await getKategoriAction();
  const categories = katRes.data || [];

  const showModalId = sParams?.id;
  const selectedReport = showModalId ? data.find(item => item.documentId === showModalId) : null;

  const getCategoryName = (item) => {
     let cat = item.kategori || item.kategoris;
     if (Array.isArray(cat) && cat.length > 0) return cat[0].ket_kategori;
     if (cat && typeof cat === 'object') return cat.ket_kategori;
     return "-";
  };

  return (
    <div className="p-8">
        <header className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard Admin</h1>
                <p className="opacity-70 mt-2 font-medium">Monitoring sistem pengaduan secara real-time.</p>
            </div>
            <div className="text-right">
                <span className="badge badge-neutral rounded-none border-2 border-black font-black p-4 uppercase">{user.username}</span>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
                <div className="font-black text-xs opacity-50 uppercase tracking-widest mb-2">TOTAL LAPORAN</div>
                <div className="text-5xl font-black">{stats.total}</div>
            </div>
            <div className="p-6 border-2 border-black bg-blue-100 shadow-[8px_8px_0_0_#000]">
                <div className="font-black text-xs opacity-50 uppercase tracking-widest mb-2">MENUNGGU</div>
                <div className="text-5xl font-black">{stats.waiting}</div>
            </div>
            <div className="p-6 border-2 border-black bg-green-100 shadow-[8px_8px_0_0_#000]">
                <div className="font-black text-xs opacity-50 uppercase tracking-widest mb-2">SELESAI</div>
                <div className="text-5xl font-black">{stats.completed}</div>
            </div>
            <div className="p-6 border-2 border-black bg-red-100 shadow-[8px_8px_0_0_#000]">
                <div className="font-black text-xs opacity-50 uppercase tracking-widest mb-2">INVALID</div>
                <div className="text-5xl font-black">{stats.invalid}</div>
            </div>
        </div>

        {/* Filters */}
        <AdminFilters 
            categories={categories} 
            currentKategori={kategori} 
            currentStatus={status} 
            hideInvalid={hideInvalid} 
        />

        {/* Reports Table */}
        <div className="bg-white border-2 border-black overflow-hidden shadow-[12px_12px_0_0_#000] mb-10">
            <div className="p-4 bg-yellow-300 border-b-2 border-black flex justify-between items-center">
                <h2 className="text-xl font-black uppercase">Daftar Laporan Seluruhnya</h2>
                <div className="badge badge-outline border-2 border-black font-black uppercase text-xs">PAGINATION ENABLED</div>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-black text-white uppercase font-black text-sm">
                        <tr>
                            <th className="py-4 pl-6">No</th>
                            <th>Pelapor</th>
                            <th>Lokasi</th>
                            <th>Kategori</th>
                            <th>Status</th>
                            <th className="text-center pr-6">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-black font-bold">
                        {data.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 opacity-50 uppercase font-black text-2xl">Tidak ada data ditemukan</td></tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={item.documentId || index} className="border-b-2 border-black last:border-none hover:bg-gray-50">
                                    <td className="pl-6">{(page - 1) * 10 + index + 1}</td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span>{item.siswa?.nama || "Anonim"}</span>
                                            <span className="text-[10px] opacity-50">NIS: {item.siswa?.nis || "-"}</span>
                                        </div>
                                    </td>
                                    <td>{item.lokasi}</td>
                                    <td>{getCategoryName(item)}</td>
                                    <td>
                                        <div className={`badge rounded-none font-black border-2 border-black text-xs uppercase
                                            ${item.status_laporan === "Menunggu" ? "bg-gray-200" : 
                                              item.status_laporan === "Proses" ? "bg-blue-300" : 
                                              item.status_laporan === "Selesai" ? "bg-green-300" : "bg-red-300"}`}
                                        >
                                            {item.status_laporan}
                                        </div>
                                    </td>
                                    <td className="text-center pr-6 flex justify-center gap-2">
                                        <Link 
                                            href={`?id=${item.documentId}&kategori=${kategori}&status=${status}&hideInvalid=${hideInvalid}&page=${page}`}
                                            className="btn btn-xs btn-info rounded-none border-2 border-black text-white font-black hover:bg-blue-600 uppercase"
                                            scroll={false}
                                        >
                                            Detail
                                        </Link>
                                        <ActionDropdown 
                                            docId={item.documentId} 
                                            currentStatus={item.status_laporan}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <Pagination page={page} pageCount={meta.pagination.pageCount} />

        {/* Modal Detail (Refined Shared Component) */}
        <AdminDetailModal 
            report={selectedReport} 
            basePath="/admin" 
            searchParams={sParams} 
        />
    </div>
  );
}
