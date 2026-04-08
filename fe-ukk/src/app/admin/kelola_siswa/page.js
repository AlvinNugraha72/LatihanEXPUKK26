"use client"

import { useState, useEffect } from "react"
import { getSiswaAction, createSiswaAction, updateSiswaAction, deleteSiswaAction } from "@/lib/actions"
import Sidebar from "../Sidebar"

export default function KelolaSiswa() {
    const [siswas, setSiswas] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalMode, setModalMode] = useState("add") // "add" or "edit"
    const [selectedSiswa, setSelectedSiswa] = useState(null)
    const [msg, setMsg] = useState({ type: "", content: "" })

    // Fetch data
    const fetchSiswa = async () => {
        setLoading(true)
        const res = await getSiswaAction()
        if (res.data) {
            setSiswas(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSiswa()
    }, [])

    // Handle Form Submit (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        let res;

        if (modalMode === "add") {
            res = await createSiswaAction(formData)
        } else {
            formData.append("documentId", selectedSiswa.documentId)
            res = await updateSiswaAction(formData)
        }

        if (res.success) {
            setMsg({ type: "success", content: `Berhasil ${modalMode === "add" ? "menambah" : "mengupdate"} siswa!` })
            document.getElementById("modal_siswa").close()
            fetchSiswa()
        } else {
            setMsg({ type: "error", content: res.error || "Terjadi kesalahan" })
        }
    }

    // Handle Delete
    const handleDelete = async (docId) => {
        if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
            const res = await deleteSiswaAction(docId)
            if (res.success) {
                setMsg({ type: "success", content: "Berhasil menghapus siswa!" })
                fetchSiswa()
            } else {
                setMsg({ type: "error", content: res.error || "Gagal menghapus siswa" })
            }
        }
    }

    const openModal = (mode, siswa = null) => {
        setModalMode(mode)
        setSelectedSiswa(siswa)
        setMsg({ type: "", content: "" })
        document.getElementById("modal_siswa").showModal()
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex justify-center p-4 md:p-12">
            <div className="w-full max-w-4xl">
                <div className="bg-white border-2 border-black p-8 shadow-[12px_12px_0_0_#000]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b-2 border-black pb-6">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tight">Kelola Siswa</h1>
                            <p className="opacity-70 mt-1 font-bold italic uppercase text-xs">Administrasi Data Master Siswa</p>
                        </div>
                        <button 
                            className="btn btn-neutral rounded-none border-2 border-black font-black uppercase hover:bg-black hover:text-white"
                            onClick={() => openModal("add")}
                        >
                            + Tambah Siswa Baru
                        </button>
                    </div>

                    {msg.content && (
                        <div className={`alert rounded-none border-2 border-black font-black uppercase text-xs mb-8 shadow-[4px_4px_0_0_#000] 
                            ${msg.type === "success" ? "bg-green-300" : "bg-red-300"}`}>
                            <span>{msg.content}</span>
                        </div>
                    )}

                    <div className="overflow-x-auto border-2 border-black">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-black text-white uppercase font-black text-sm">
                                    <th className="py-4 pl-6">No</th>
                                    <th>NIS</th>
                                    <th>Nama Siswa</th>
                                    <th className="text-center pr-6">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-black border-t-2 border-black">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-16">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </td>
                                    </tr>
                                ) : siswas.length > 0 ? (
                                    siswas.map((s, idx) => (
                                        <tr key={s.id} className="border-b-2 border-black last:border-none hover:bg-gray-50">
                                            <td className="pl-6 py-4">{idx + 1}</td>
                                            <td className="font-black tracking-widest">{s.nis}</td>
                                            <td className="uppercase">{s.nama}</td>
                                            <td className="text-center pr-6 flex justify-center gap-3">
                                                <button 
                                                    className="btn btn-xs btn-info text-white rounded-none border-2 border-black font-black uppercase hover:bg-blue-600"
                                                    onClick={() => openModal("edit", s)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-xs btn-error text-white rounded-none border-2 border-black font-black uppercase hover:bg-red-600"
                                                    onClick={() => handleDelete(s.documentId)}
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 opacity-50 uppercase font-black text-2xl">Belum ada data siswa.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Add/Edit (Neobrutalism Style) */}
            <dialog id="modal_siswa" className="modal backdrop-blur-sm">
                <div className="modal-box rounded-none border-4 border-black p-10 bg-white shadow-[16px_16px_0_0_#000] max-w-lg">
                    <h3 className="font-black text-3xl uppercase mb-8 bg-yellow-300 inline-block px-2 border-2 border-black">
                        {modalMode === "add" ? "Tambah Siswa" : "Edit Siswa"}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label pb-1"><span className="label-text font-black uppercase">Nomor Induk Siswa (NIS)</span></label>
                            <input 
                                name="nis" 
                                type="text" 
                                placeholder="Contoh: 12345"
                                className="input input-bordered w-full rounded-none border-2 border-black focus:outline-none font-bold bg-gray-50 h-14" 
                                defaultValue={selectedSiswa?.nis || ""} 
                                required 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label pb-1"><span className="label-text font-black uppercase">Nama Lengkap Siswa</span></label>
                            <input 
                                name="nama" 
                                type="text" 
                                placeholder="Contoh: Alvin Nugraha"
                                className="input input-bordered w-full rounded-none border-2 border-black focus:outline-none font-bold bg-gray-50 h-14" 
                                defaultValue={selectedSiswa?.nama || ""} 
                                required 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label pb-1">
                                <span className="label-text font-black uppercase">Kata Sandi (Password)</span>
                            </label>
                            <input 
                                name="password" 
                                type="password" 
                                className="input input-bordered w-full rounded-none border-2 border-black focus:outline-none font-bold bg-gray-50 h-14" 
                                placeholder={modalMode === "add" ? "Default: 123" : "Kosongkan jika tetap"}
                                required={modalMode === "add"}
                            />
                            {modalMode === "edit" && <span className="text-[10px] font-bold mt-2 opacity-60 uppercase italic">* Biarkan kosong jika tidak ingin mengubah kata sandi</span>}
                        </div>
                        
                        <div className="flex gap-4 pt-6 border-t-2 border-black mt-4">
                            <button type="button" className="btn btn-ghost font-black flex-1 rounded-none border-2 border-transparent hover:border-black uppercase" onClick={() => document.getElementById("modal_siswa").close()}>Batal</button>
                            <button type="submit" className="btn btn-neutral font-black flex-1 rounded-none border-2 border-black uppercase bg-black text-white hover:bg-neutral-800">
                                {modalMode === "add" ? "💾 Simpan Baru" : "🔄 Perbarui Data"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}
