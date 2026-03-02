"use client";

import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPengaduanAction } from "@/lib/actions";

export default function TambahLaporanPageClient({ kategoriList, userId }) {
  const [state, formAction, isPending] = useActionState(createPengaduanAction, null);
  const router = useRouter();
  const fileInputRef = useRef(null);

  // State untuk preview gambar
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fotoError, setFotoError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push("/siswa");
    }
  }, [state, router]);

  // Cleanup object URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (file) => {
    setFotoError(null);
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      setFotoError("Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
      return;
    }
    if (file.size > maxSize) {
      setFotoError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => handleFileChange(e.target.files?.[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange(file);
    }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setFotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border-2 border-black p-8 shadow-[12px_12px_0_0_#000]">
        <h1 className="text-3xl font-black uppercase mb-2 border-b-4 border-black pb-4">Buat Laporan Baru</h1>
        <p className="text-sm opacity-60 font-medium mb-8">Isi data laporan dengan lengkap dan jelas.</p>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div role="alert" className="alert alert-error rounded-none font-bold border-2 border-black">
              <span>⚠ {state.error}</span>
            </div>
          )}

          <input type="hidden" name="idSiswa" value={userId} />

          {/* Row 1: Lokasi & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-black uppercase text-sm tracking-widest">Lokasi Kejadian</span>
              </label>
              <input
                name="lokasi"
                type="text"
                placeholder="Contoh: Kelas X RPL 1"
                className="input input-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50 h-14"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-black uppercase text-sm tracking-widest">Kategori Laporan</span>
              </label>
              <select
                name="idKategori"
                className="select select-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50 h-14 w-full"
                defaultValue=""
                required
              >
                <option value="" disabled>Pilih Kategori...</option>
                {kategoriList.map(k => (
                  <option key={k.id} value={k.id}>{k.ket_kategori}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Keterangan */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-black uppercase text-sm tracking-widest lg:pr-10">Keterangan Detail</span>
            </label>
            <textarea
              name="keterangan"
              className="textarea textarea-bordered border-2 border-black rounded-none focus:outline-none font-bold h-36 bg-gray-50"
              placeholder="Jelaskan detail laporanmu di sini..."
              required
            ></textarea>
          </div>

          {/* Row 3: Upload Foto Bukti */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-black uppercase text-sm tracking-widest">
                Foto Bukti
                <span className="ml-2 font-normal normal-case text-xs opacity-50 tracking-normal">(opsional, maks. 5MB)</span>
              </span>
            </label>

            {/* Input File Tersembunyi */}
            <input
              ref={fileInputRef}
              name="foto_laporan"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="foto-laporan-input"
            />

            {/* Area Drop / Preview */}
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  flex flex-col items-center justify-center gap-3 h-44 border-2 border-dashed cursor-pointer transition-all
                  ${isDragging ? "border-black bg-yellow-50 scale-[1.01]" : "border-gray-400 bg-gray-50 hover:border-black hover:bg-gray-100"}
                `}
              >
                <div className="text-4xl">{isDragging ? "📂" : "🖼️"}</div>
                <div className="text-center">
                  <p className="font-black text-sm uppercase">{isDragging ? "Lepaskan file di sini" : "Klik atau drag foto ke sini"}</p>
                  <p className="text-xs opacity-50 mt-1">JPG, PNG, WEBP, GIF</p>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-black">
                <img src={previewUrl} alt="Preview foto laporan" className="w-full max-h-64 object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-xs bg-white border-2 border-black rounded-none font-black hover:bg-gray-100"
                  >
                    ✏️ Ganti
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-xs bg-red-500 text-white border-2 border-black rounded-none font-black hover:bg-red-600"
                  >
                    ✕ Hapus
                  </button>
                </div>
                <div className="bg-black text-white text-xs font-black px-3 py-1 uppercase tracking-widest">
                  ✓ Foto siap dikirim
                </div>
              </div>
            )}

            {fotoError && (
              <p className="text-red-600 font-bold text-xs mt-2 flex items-center gap-1">⚠ {fotoError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t-2 border-black">
            <Link href="/siswa" className="btn btn-ghost font-black flex-1 border-2 border-black rounded-none hover:bg-gray-100">
              BATAL
            </Link>
            <button
              type="submit"
              className="btn btn-primary font-black flex-1 border-2 border-black rounded-none hover:bg-neutral hover:text-white h-14 text-base"
              disabled={isPending || !!fotoError}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  {previewUrl ? "Mengupload foto..." : "Mengirim..."}
                </span>
              ) : "📤 KIRIM LAPORAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
