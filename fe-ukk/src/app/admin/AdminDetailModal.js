import Link from "next/link";
import { updateFeedbackAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export default function AdminDetailModal({ report, basePath, searchParams }) {
  if (!report) return null;

  const getCategoryName = (item) => {
    let cat = item.kategori || item.kategoris;
    if (Array.isArray(cat) && cat.length > 0) return cat[0].ket_kategori;
    if (cat && typeof cat === 'object') return cat.ket_kategori;
    return "-";
  };

  // Construct redirect URL string (serializable)
  const params = new URLSearchParams(searchParams);
  params.delete("id"); // Remove modal ID
  const redirectPath = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Overlay Link to Close */}
      <Link href={redirectPath} className="absolute inset-0 cursor-default" scroll={false} />
      
      <div className="bg-white w-full max-w-5xl border-4 border-black p-0 z-10 shadow-[20px_20px_0_0_#000] overflow-hidden">
        <div className="bg-black text-white p-6 flex justify-between items-start">
          <div>
            <h3 className="font-black text-2xl uppercase italic">Detail Laporan Admin</h3>
            <p className="text-xs opacity-70 mt-1 uppercase tracking-widest">ID: {report.documentId}</p>
          </div>
          <Link href={redirectPath} className="btn btn-sm btn-circle btn-ghost text-white text-xl" scroll={false}>✕</Link>
        </div>

        <form action={async (formData) => {
          "use server";
          await updateFeedbackAction(formData);
          redirect(redirectPath);
        }}>
          <input type="hidden" name="documentId" value={report.documentId} />
          
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 text-black max-h-[70vh] overflow-y-auto lg:overflow-visible">
            
            {/* COLUMN 1: REPORT INFO */}
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-black uppercase bg-black text-white px-3 py-1 w-fit mb-4 italic">Informasi Laporan</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Pelapor</span>
                            <div className="font-bold text-base border-b-2 border-black pb-1">{report.siswa?.nama || "Anonim"}</div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Waktu</span>
                            <div className="font-bold text-base border-b-2 border-black pb-1">
                            {new Date(report.createdAt).toLocaleDateString("id-ID", { dateStyle: 'medium' })}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Lokasi</span>
                            <div className="font-bold text-base border-b-2 border-black pb-1">{report.lokasi}</div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Kategori</span>
                            <div className="font-bold text-base border-b-2 border-black pb-1">{getCategoryName(report)}</div>
                        </div>
                    </div>
                </div>
                
                <div>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Isi Pengaduan</span>
                <div className="p-4 bg-gray-50 border-2 border-black font-medium min-h-[120px] mt-1 text-sm">
                    {report.ket}
                </div>
                </div>

                {/* Foto Kejadian */}
                {report.foto && (
                  <div>
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Foto Kejadian</span>
                    <div className="mt-1 border-2 border-black overflow-hidden bg-gray-100">
                      <img 
                        src={report.foto.url.startsWith('http') ? report.foto.url : `http://127.0.0.1:1337${report.foto.url}`} 
                        alt="Foto Kejadian" 
                        className="w-full h-auto object-contain max-h-[300px]"
                      />
                    </div>
                  </div>
                )}

                <div>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Status Saat Ini</span>
                <div className={`p-2 border-2 border-black font-black text-center uppercase mt-1 text-xs ${
                    report.status_laporan === 'Selesai' ? 'bg-green-400' : 
                    report.status_laporan === 'Proses' ? 'bg-yellow-400' :
                    report.status_laporan === 'Invalid' ? 'bg-red-500 text-white' : 
                    'bg-gray-200'
                }`}>
                    {report.status_laporan}
                </div>
                </div>
            </div>

            {/* COLUMN 2: ADMIN RESPONSE */}
            <div className="space-y-6 lg:border-l-2 lg:border-black lg:pl-10">
                <h4 className="text-sm font-black uppercase bg-blue-600 text-white px-3 py-1 w-fit mb-4 italic">Tanggapan Petugas</h4>
                
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-black uppercase text-xs text-blue-600">Update Status Laporan</span></label>
                    <select 
                        name="status_baru"
                        defaultValue={report.status_laporan}
                        className="select select-bordered border-2 border-black font-bold rounded-none focus:outline-none bg-yellow-50 w-full"
                    >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Proses">Proses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Invalid">Invalid</option>
                    </select>
                </div>

                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-black uppercase text-xs text-blue-600">Feedback / Tanggapan Admin</span></label>
                    <textarea 
                        name="feedback_admin"
                        defaultValue={report.feedback || ""}
                        className="textarea textarea-bordered border-2 border-black rounded-none focus:outline-none font-bold h-[180px] bg-blue-50 w-full text-base"
                        placeholder="Berikan tanggapan resmi untuk laporan ini..."
                    ></textarea>
                </div>
            </div>
          </div>

          <div className="p-6 bg-gray-100 border-t-2 border-black flex justify-end gap-3">
            <Link href={redirectPath} className="btn btn-ghost font-black text-gray-500 hover:bg-gray-200" scroll={false}>BATAL</Link>
            <button type="submit" className="btn bg-black text-white hover:bg-neutral rounded-none border-0 px-10 font-black h-14">
              SIMPAN PERUBAHAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
