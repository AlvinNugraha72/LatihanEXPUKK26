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
        <div className="flex bg-slate-50 min-h-screen">
            {/* <Sidebar /> */}
            <div className="flex-1 p-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Kelola Siswa</h1>
                            <p className="text-slate-500">Manajemen data siswa</p>
                        </div>
                        <button 
                            className="btn btn-primary rounded-xl"
                            onClick={() => openModal("add")}
                        >
                            + Tambah Siswa
                        </button>
                    </div>

                    {msg.content && (
                        <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-error"} mb-4 rounded-xl`}>
                            <span>{msg.content}</span>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th>No</th>
                                    <th>NIS</th>
                                    <th>Nama Siswa</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10">
                                            <span className="loading loading-spinner loading-md"></span>
                                        </td>
                                    </tr>
                                ) : siswas.length > 0 ? (
                                    siswas.map((s, idx) => (
                                        <tr key={s.id}>
                                            <td>{idx + 1}</td>
                                            <td className="font-mono font-semibold">{s.nis}</td>
                                            <td>{s.nama}</td>
                                            <td className="flex justify-center gap-2">
                                                <button 
                                                    className="btn btn-sm btn-info text-white rounded-lg"
                                                    onClick={() => openModal("edit", s)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-error text-white rounded-lg"
                                                    onClick={() => handleDelete(s.documentId)}
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-slate-400">Belum ada data siswa.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <dialog id="modal_siswa" className="modal">
                <div className="modal-box rounded-2xl">
                    <h3 className="font-bold text-lg mb-4">
                        {modalMode === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">NIS</span></label>
                            <input 
                                name="nis" 
                                type="text" 
                                className="input input-bordered w-full rounded-xl" 
                                defaultValue={selectedSiswa?.nis || ""} 
                                required 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Nama Lengkap</span></label>
                            <input 
                                name="nama" 
                                type="text" 
                                className="input input-bordered w-full rounded-xl" 
                                defaultValue={selectedSiswa?.nama || ""} 
                                required 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Password</span>
                                {modalMode === "edit" && <span className="label-text-alt text-slate-400">Biarkan kosong jika tidak ingin mengubah</span>}
                            </label>
                            <input 
                                name="password" 
                                type="password" 
                                className="input input-bordered w-full rounded-xl" 
                                placeholder={modalMode === "add" ? "Password default: 123" : "****"}
                                required={modalMode === "add"}
                            />
                        </div>
                        
                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost rounded-xl" onClick={() => document.getElementById("modal_siswa").close()}>Batal</button>
                            <button type="submit" className="btn btn-primary rounded-xl px-8">Simpan</button>
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
