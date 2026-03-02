import { redirect } from "next/navigation";
import Link from "next/link";
import { getLaporanAction, getMeAction, updateFeedbackAction, updateStatusAction, getKategoriAction } from "@/lib/actions";
import ActionDropdown from "../ActionDropdown";
import Pagination from "../Pagination";
import AdminDetailModal from "../AdminDetailModal";
import ArsipFilters from "./ArsipFilters";

export default async function ArsipPage({ searchParams }) {
  const user = await getMeAction();
  if (!user || user.role !== "Admin") redirect("/");

  const sParams = await searchParams;
  const page = Number(sParams?.page) || 1;
  const statusParam = sParams?.status || "Selesai,Invalid";
  const selectedStatuses = statusParam.split(",");

  // Arsip only shows Selesai or Invalid based on checklist
  const res = await getLaporanAction({ status: selectedStatuses }, page, 10);
  let data = res.data || [];
  const meta = res.meta || { pagination: { pageCount: 0 } };

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
            <h1 className="text-4xl font-black uppercase tracking-tight text-gray-400">Arsip Laporan</h1>
            <p className="opacity-70 mt-2 font-medium">Hanya menampilkan laporan yang sudah selesai atau ditandai sebagai tidak valid.</p>
        </div>

        <ArsipFilters currentStatuses={selectedStatuses} />

        <div className="overflow-x-auto border-2 border-black bg-white rounded-none shadow-[12px_12px_0_0_#999] mb-8">
            <table className="table">
                <thead className="bg-gray-400 text-black uppercase font-black text-sm border-b-2 border-black">
                    <tr>
                        <th className="py-4 pl-6">No</th>
                        <th>Pelapor</th>
                        <th>Lokasi</th>
                        <th>Kategori</th>
                        <th>Status Akhir</th>
                        <th className="text-center pr-6">Aksi</th>
                    </tr>
                </thead>
                <tbody className="text-black font-bold">
                    {data.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 opacity-50 uppercase font-black text-2xl">Arsip Kosong</td></tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.documentId || index} className="border-b-2 border-gray-200 last:border-none hover:bg-gray-50">
                                <td className="pl-6">{(page - 1) * 10 + index + 1}</td>
                                <td>{item.siswa?.nama || "Anonim"}</td>
                                <td>{item.lokasi}</td>
                                <td>{getCategoryName(item)}</td>
                                <td>
                                    <div className={`badge rounded-none font-black border-2 border-black text-xs uppercase
                                        ${item.status_laporan === "Selesai" ? "bg-green-300" : "bg-red-300"}`}
                                    >
                                        {item.status_laporan}
                                    </div>
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
            basePath="/admin/arsip" 
            searchParams={sParams} 
        />
    </div>
  );
}
