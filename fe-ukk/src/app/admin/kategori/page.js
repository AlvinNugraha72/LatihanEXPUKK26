import { redirect } from "next/navigation";
import Link from "next/link";
import { getMeAction, getKategoriAction, createKategoriAction, deleteKategoriAction, updateKategoriAction } from "@/lib/actions";

export default async function KategoriPage({ searchParams }) {
  const user = await getMeAction();
  if (!user || user.role !== "Admin") redirect("/");

  const res = await getKategoriAction();
  const data = res.data || [];

  // Modal State via URL
  const mode = (await searchParams)?.mode; // "create" or "edit"
  const editId = (await searchParams)?.id;
  const editItem = editId ? data.find(i => i.documentId === editId) : null;

  return (
    <div className="flex min-h-screen bg-gray-50 text-black font-sans">
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Kelola Kategori</h1>
            <p className="opacity-70 mt-2 font-medium">Tambah atau edit kategori laporan.</p>
          </div>
          <Link 
            href="/admin/kategori?mode=create"
            className="btn btn-neutral font-black rounded-none border-2 border-black hover:bg-black hover:text-white"
            scroll={false}
          >
            + Tambah Kategori
          </Link>
        </header>

        <section className="bg-white border-2 border-black p-0">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-black text-white rounded-none">
                <tr className="uppercase font-black text-sm tracking-wider border-b-4 border-black">
                  <th className="py-4 pl-6 rounded-none w-20">No</th>
                  <th className="py-4">Nama Kategori</th>
                  <th className="py-4 text-right pr-6 rounded-none w-48">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                   <tr><td colSpan={3} className="text-center py-8 opacity-50 font-bold">Belum ada kategori</td></tr>
                ) : (
                    data.map((item, index) => (
                        <tr key={item.documentId} className="hover:bg-gray-50 border-b-2 border-gray-100 font-bold">
                            <td className="pl-6">{index + 1}</td>
                            <td className="text-lg">{item.ket_kategori}</td>
                            <td className="pr-6 text-right space-x-2 flex justify-end">
                                <Link 
                                    href={`/admin/kategori?mode=edit&id=${item.documentId}`}
                                    className="btn btn-sm btn-outline rounded-none border-2 hover:bg-black hover:text-white"
                                    scroll={false}
                                >
                                    Edit
                                </Link>
                                <form action={async () => {
                                    "use server";
                                    await deleteKategoriAction(item.documentId);
                                }}>
                                    <button className="btn btn-sm btn-error text-white rounded-none border-2 border-black hover:bg-red-600 hover:border-black">
                                        Hapus
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Create/Edit */}
      {(mode === "create" || (mode === "edit" && editItem)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Link href="/admin/kategori" className="absolute inset-0 cursor-default" scroll={false} />
            <div className="bg-white w-full max-w-md border-2 border-black p-8 relative z-10">
                <h2 className="text-2xl font-black uppercase mb-6 bg-yellow-300 inline-block px-2 border-2 border-black">
                    {mode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                
                <form action={async (formData) => {
                    "use server";
                    if (mode === 'create') {
                        await createKategoriAction(formData);
                    } else {
                        await updateKategoriAction(formData);
                    }
                    redirect("/admin/kategori");
                }} className="space-y-4">
                    
                    {mode === 'edit' && <input type="hidden" name="documentId" value={editItem.documentId} />}

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold uppercase">Nama Kategori</span>
                        </label>
                        <input 
                            name="nama_kategori"
                            type="text" 
                            placeholder="Contoh: Infrastruktur" 
                            className="input input-bordered w-full rounded-none border-2 border-black focus:outline-none font-bold bg-gray-50"
                            defaultValue={mode === 'edit' ? editItem.ket_kategori : ""}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/admin/kategori" className="btn btn-ghost font-bold text-gray-500 hover:bg-gray-200 rounded-none border-0" scroll={false}>
                            Batal
                        </Link>
                        <button type="submit" className="btn btn-neutral text-white rounded-none border-2 border-black hover:bg-black">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
