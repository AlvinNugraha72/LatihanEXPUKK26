"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMeAction, createPengaduanAction } from "@/lib/actions";

export default function TambahLaporanPageClient({ kategoriList, userId }) {
  const [state, formAction, isPending] = useActionState(createPengaduanAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/siswa");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border-2 border-black p-8">
          <h1 className="text-3xl font-black uppercase mb-8 border-b-2 border-black pb-4">Buat Laporan Baru</h1>

          <form action={formAction} className="space-y-6">
              {state?.error && (
                <div role="alert" className="alert alert-error rounded-none font-bold border-2 border-black">
                  <span>{state.error}</span>
                </div>
              )}

              <input type="hidden" name="idSiswa" value={userId} />
              
              {/* Row 1: Lokasi & Kategori (Side by Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control w-full">
                      <label className="label pb-1">
                          <span className="label-text font-black uppercase text-lg">Lokasi Kejadian</span>
                      </label>
                      <input 
                        name="lokasi"
                        type="text" 
                        placeholder="Contoh: Kelas X RPL 1" 
                        className="input input-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50 h-14 text-lg"
                        required
                      />
                  </div>

                  <div className="form-control w-full">
                      <label className="label pb-1">
                          <span className="label-text font-black uppercase text-lg">Kategori Laporan</span>
                      </label>
                      <select 
                        name="idKategori"
                        className="select select-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50 h-14 text-lg w-full"
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

              {/* Row 2: Keterangan (Half Width) */}
              <div className="form-control w-full md:w-1/2">
                  <label className="label pb-1">
                      <span className="label-text font-black uppercase text-lg">Keterangan Detail</span>
                  </label>
                  <textarea 
                    name="keterangan"
                    className="textarea textarea-bordered border-2 border-black rounded-none focus:outline-none font-bold h-40 bg-gray-50 text-lg"
                    placeholder="Jelaskan detail laporanmu di sini..."
                    required
                  ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                  <Link href="/siswa" className="btn btn-ghost font-black flex-1 border-2 border-transparent hover:border-black rounded-none">
                      BATAL
                  </Link>
                  <button type="submit" className="btn btn-primary font-black flex-1 border-2 border-black rounded-none hover:bg-neutral hover:text-white" disabled={isPending}>
                      {isPending ? <span className="loading loading-spinner"></span> : "KIRIM LAPORAN"}
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
}
