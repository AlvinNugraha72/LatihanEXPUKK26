import Link from "next/link";
import { updateFeedbackAction } from "@/lib/actions";
import { redirect } from "next/navigation";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace("/api", "") || "http://localhost:1337";

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

      <div className="bg-white w-full max-w-5xl border-4 border-black p-0 z-10 shadow-[20px_20px_0_0_#000] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black text-white p-6 flex justify-between items-start">
          <div>
            <h3 className="font-black text-2xl uppercase italic">Detail Laporan Admin</h3>
            <p className="text-xs opacity-70 mt-1 uppercase tracking-widest">ID: {report.documentId}</p>
          </div>
          <Link href={redirectPath} className="btn btn-sm btn-circle btn-ghost text-white text-xl" scroll={false}>✕</Link>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await updateFeedbackAction(formData);
            redirect(redirectPath);
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <input type="hidden" name="documentId" value={report.documentId} />

          <div className="p-8 grid grid-cols-1 gap-10 text-black overflow-y-auto flex-1">

            {/* ─── KOLOM KIRI: INFO LAPORAN ─── */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black uppercase bg-black text-white px-3 py-1 w-fit mb-4 italic">Informasi Laporan</h4>
                <div className="grid grid-cols-1 gap-6">
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
                <div className="p-4 bg-gray-50 border-2 border-black font-medium min-h-[100px] mt-1 text-sm">
                  {report.ket}
                </div>
              </div>

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

              {/* Foto Bukti dari Siswa */}
              {report.foto_laporan?.url && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Foto Bukti Siswa</span>
                    <span className="badge badge-xs bg-yellow-300 border border-black font-black uppercase">BUKTI</span>
                  </div>
                  <a
                    href={`${STRAPI_URL}${report.foto_laporan.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative border-2 border-black overflow-hidden group"
                  >
                    <img
                      src={`${STRAPI_URL}${report.foto_laporan.url}`}
                      alt="Foto bukti laporan dari siswa"
                      className="w-full object-cover max-h-52 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs font-black px-3 py-1.5 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      🔍 Klik untuk perbesar
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* ─── KOLOM KANAN: TANGGAPAN PETUGAS ─── */}
            <div className="space-y-6 md:border-t-2 md:border-black md:pt-10">
              <h4 className="text-sm font-black uppercase bg-blue-600 text-white px-3 py-1 w-fit mb-4 italic">Tanggapan Petugas</h4>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-black uppercase text-xs text-blue-600">Update Status Laporan</span>
                </label>
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
                <label className="label py-1">
                  <span className="label-text font-black uppercase text-xs text-blue-600">Feedback / Tanggapan Admin</span>
                </label>
                <textarea
                  name="feedback_admin"
                  defaultValue={report.feedback || ""}
                  className="textarea textarea-bordered border-2 border-black rounded-none focus:outline-none font-bold h-[140px] bg-blue-50 w-full text-base"
                  placeholder="Berikan tanggapan resmi untuk laporan ini..."
                ></textarea>
              </div>

              {/* Upload Foto Feedback */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-black uppercase text-xs text-blue-600">
                    Foto Respons
                    <span className="ml-2 font-normal normal-case text-xs opacity-60">(opsional)</span>
                  </span>
                </label>

                {/* Jika sudah ada foto feedback sebelumnya, tampilkan thumbnail */}
                {report.foto_feedback?.url && (
                  <div className="mb-3 relative border-2 border-dashed border-blue-400 overflow-hidden group">
                    <img
                      src={`${STRAPI_URL}${report.foto_feedback.url}`}
                      alt="Foto feedback sebelumnya"
                      className="w-full object-cover max-h-36"
                    />
                    <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 uppercase tracking-widest">
                      ✓ Foto respons terpasang — unggah baru untuk mengganti
                    </div>
                  </div>
                )}

                <label
                  htmlFor="foto-feedback-input"
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-blue-400 bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-600 transition-all"
                >
                  <span className="text-2xl">📎</span>
                  <div>
                    <p className="font-black text-sm uppercase text-blue-700">
                      {report.foto_feedback?.url ? "Ganti Foto Respons" : "Lampirkan Foto Respons"}
                    </p>
                    <p className="text-xs opacity-50">JPG, PNG, WEBP — maks. 5MB</p>
                  </div>
                </label>
                <input
                  id="foto-feedback-input"
                  name="foto_feedback"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
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
