import { redirect } from "next/navigation";
import Link from "next/link";
import { getLaporanAction, getMeAction, updateFeedbackAction, updateStatusAction, getKategoriAction } from "@/lib/actions";
import ActionDropdown from "../ActionDropdown";
import Pagination from "../Pagination";
import AdminDetailModal from "../AdminDetailModal";
import AdminFilters from "../AdminFilters";

export default async function MenungguPage({ searchParams }) {
  const user = await getMeAction();
  if (!user || user.role !== "Admin") redirect("/");

  const sParams = await searchParams;
  const page = Number(sParams?.page) || 1;
  const idKategori = sParams?.kategori || "Semua";

  const res = await getLaporanAction({ status: "Menunggu", idKategori }, page, 10);
  let data = res.data || [];
  const meta = res.meta || { pagination: { pageCount: 0 } };

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
        <div className="mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tight">Laporan Masuk</h1>
            <p className="opacity-70 mt-2 font-medium">Daftar laporan baru yang memerlukan konfirmasi segera.</p>
        </div>

        <AdminFilters 
            categories={categories} 
            currentKategori={idKategori} 
            showStatus={false} 
            showHideInvalid={false} 
        />

        <div className="overflow-x-auto border-2 border-black bg-white rounded-none shadow-[12px_12px_0_0_#000] mb-8">
            <table className="table">
                <thead className="bg-black text-white uppercase font-black text-sm">
                    <tr>
                        <th className="py-4 pl-6">No</th>
                        <th>Pelapor</th>
                        <th>Lokasi</th>
                        <th>Kategori</th>
                        <th>Waktu</th>
                        <th className="text-center pr-6">Aksi</th>
                    </tr>
                </thead>
                <tbody className="text-black font-bold">
                    {data.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 opacity-50 uppercase font-black text-2xl">Tidak ada laporan menunggu</td></tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.documentId || index} className="border-b-2 border-black last:border-none hover:bg-gray-50">
                                <td className="pl-6">{(page - 1) * 10 + index + 1}</td>
                                <td>{item.siswa?.nama || "Anonim"}</td>
                                <td>{item.lokasi}</td>
                                <td>{getCategoryName(item)}</td>
                                <td className="text-xs uppercase opacity-70">
                                    {new Date(item.createdAt).toLocaleDateString("id-ID", { dateStyle: 'short' })}
                                </td>
                                <td className="text-center pr-6 flex justify-center gap-2">
                                    <Link 
                                        href={`?id=${item.documentId}&page=${page}`}
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

        <Pagination page={page} pageCount={meta.pagination.pageCount} />

        {/* Modal Detail (Refined Shared Component) */}
        <AdminDetailModal 
            report={selectedReport} 
            basePath="/admin/menunggu" 
            searchParams={sParams} 
        />
    </div>
  );
}
