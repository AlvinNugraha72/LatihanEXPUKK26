"use server"

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Mengambil URL dari environment variable (.env.local)
const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

/**
 * 1. LOGIKA LOGIN (MULTI-ROLE)
 * Mengecek NIS ke tabel Siswa atau Username ke tabel Admin (Case-Insensitive)
 */
export async function loginAction(prevState, formData) {
  const identifier = formData.get("identifier")?.trim();
  const password = formData.get("password");
  const BASE_URL = process.env.STRAPI_URL || "http://localhost:1337/api";

  let userData = null;
  let targetPath = "";

  try {
    // 1. TAHAP SISWA (Cek berdasarkan NIS)
    const resSiswa = await fetch(
      `${BASE_URL}/siswas?filters[nis][$eq]=${identifier}&filters[password][$eq]=${password}`,
      { cache: "no-store" }
    );

    if (resSiswa.ok) {
      const dataSiswa = await resSiswa.json();
      if (dataSiswa.data && dataSiswa.data.length > 0) {
        userData = { ...dataSiswa.data[0], role: "Siswa" };
        targetPath = "/siswa";
      }
    }

    // 2. TAHAP ADMIN (Hanya jalankan jika Siswa tidak ditemukan)
    if (!userData) {
      // Gunakan $eq agar konsisten dengan siswa, atau pastikan Strapi mendukung $eqi
      const resAdmin = await fetch(
        `${BASE_URL}/admins?filters[username][$eq]=${identifier}&filters[password][$eq]=${password}`,
        { cache: "no-store" }
      );

      if (resAdmin.ok) {
        const dataAdmin = await resAdmin.json();
        if (dataAdmin.data && dataAdmin.data.length > 0) {
          userData = { ...dataAdmin.data[0], role: "Admin" };
          targetPath = "/admin";
        }
      }
    }

    // 3. JIKA USER DITEMUKAN, SET COOKIE
    if (userData) {
      const cookieStore = await cookies();
      cookieStore.set("user", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Hari
      });
    } else {
      return { error: "NIS/Username atau Password salah" };
    }

  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Terjadi kesalahan pada koneksi server" };
  }

  // 4. REDIRECT WAJIB DI LUAR TRY-CATCH
  // Next.js menggunakan 'throw' untuk redirect, jika di dalam try-catch, 
  // dia akan dianggap sebagai error biasa.
  if (targetPath) {
    redirect(targetPath);
  }
}

/**
 * 2. GET USER SESSION & LOGOUT
 */
export async function getMeAction() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user");
    return user ? JSON.parse(user.value) : null;
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("user");
    redirect("/");
}

/**
 * 3. GET LAPORAN (DENGAN PAGINATION & FILTER)
 */
export async function getLaporanAction(filters = {}, page = 1, pageSize = 10) {
    let url = `${BASE_URL}/pengaduans?populate=*&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    if (filters.idSiswa) {
        url += `&filters[siswa][id][$eq]=${filters.idSiswa}`;
    }
    
    if (filters.status) {
        if (Array.isArray(filters.status)) {
            filters.status.forEach((st, idx) => {
                url += `&filters[status_laporan][$in][${idx}]=${st}`;
            });
        } else if (filters.status !== "Semua") {
            url += `&filters[status_laporan][$eq]=${filters.status}`;
        }
    }

    if (filters.idKategori && filters.idKategori !== "Semua") {
        url += `&filters[kategoris][id][$eq]=${filters.idKategori}`;
    }
    
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const result = await res.json();
        return result; 
    } catch (e) {
        console.error("Get Laporan Error:", e);
        return { data: [], meta: { pagination: { pageCount: 0 } } };
    }
}

/**
 * 4. GET KATEGORI
 */
export async function getKategoriAction() {
    try {
        const res = await fetch(`${BASE_URL}/kategoris`, { cache: 'no-store' });
        return await res.json();
    } catch (e) {
        console.error("Get Kategori Error:", e);
        return { data: [] };
    }
}

/**
 * 5. UPLOAD GAMBAR KE STRAPI MEDIA LIBRARY
 * Return ID file yang berhasil diupload
 */
export async function uploadImageAction(file) {
    if (!file || file.size === 0) return null;
    const fd = new FormData();
    fd.append("files", file);
    try {
        const res = await fetch(`${BASE_URL}/upload`, { 
            method: "POST", 
            body: fd 
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            console.error("Upload Image Failed:", res.status, errBody);
            return null;
        }
        const result = await res.json();
        return result[0]?.id || null;
    } catch (e) {
        console.error("Upload Image Exception:", e);
        return null;
    }
}

/**
 * 6. CREATE PENGADUAN (SISWA) — dengan dukungan foto_laporan
 */
export async function createPengaduanAction(prevState, formData) {
    const idSiswa = formData.get("idSiswa");
    const idKategori = formData.get("idKategori");
    const lokasi = formData.get("lokasi");
    const ket = formData.get("keterangan");
    const fotoFile = formData.get("foto_laporan");

    if (!idSiswa || !idKategori || !lokasi || !ket) {
        return { error: "Semua field harus diisi!" };
    }

    // Upload gambar dulu jika ada
    let fotoId = null;
    if (fotoFile && fotoFile.size > 0) {
        fotoId = await uploadImageAction(fotoFile);
    }

    const payload = {
        data: {
          lokasi: lokasi,
          ket: ket,
          status_laporan: "Menunggu",
          siswa: { connect: [Number(idSiswa)] },
          kategoris: { connect: [Number(idKategori)] },
          ...(fotoId && { foto_laporan: fotoId }),
        }
    };
    
    try {
        const res = await fetch(`${BASE_URL}/pengaduans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();

        if (!res.ok) {
            return { error: result.error?.message || "Gagal membuat laporan." };
        }
        
        revalidatePath("/siswa");
        return { success: true };
    } catch (e) {
        console.error("Create Error:", e);
        return { error: "Terjadi kesalahan koneksi server." };
    }
}

/**
 * 7. DELETE PENGADUAN SISWA (TERKONDISI)
 * Hapus hanya jika status masih 'Menunggu'
 */
export async function deletePengaduanSiswaAction(docId) {
    try {
        // Cek status terlebih dahulu
        const checkRes = await fetch(`${BASE_URL}/pengaduans/${docId}`, { cache: 'no-store' });
        const report = await checkRes.json();
        const statusSekarang = report.data?.status_laporan;

        if (statusSekarang === "Menunggu") {
            await fetch(`${BASE_URL}/pengaduans/${docId}`, { method: "DELETE" });
            revalidatePath("/siswa");
            return { success: true };
        } else {
            return { error: "Laporan sudah diproses admin, tidak bisa dihapus!" };
        }
    } catch (e) {
        return { error: "Gagal menghapus laporan." };
    }
}

/**
 * 7. DELETE PENGADUAN ADMIN (TANPA SYARAT)
 */
export async function deletePengaduanAdminAction(docId) {
     try {
        const res = await fetch(`${BASE_URL}/pengaduans/${docId}`, { method: "DELETE" });
        if (res.ok) {
            revalidatePath("/admin", "layout");
            return { success: true };
        }
        return { error: "Gagal menghapus laporan." };
     } catch (e) {
         return { error: e.message };
     }
}

/**
 * 9. UPDATE FEEDBACK & STATUS (ADMIN) — dengan dukungan foto_feedback
 */
export async function updateFeedbackAction(formData) {
    const docId = formData.get("documentId");
    const fotoFile = formData.get("foto_feedback");

    // Upload foto feedback jika ada
    let fotoFeedbackId = null;
    if (fotoFile && fotoFile.size > 0) {
        fotoFeedbackId = await uploadImageAction(fotoFile);
    }

    const payload = {
        data: {
          status_laporan: formData.get("status_baru"),
          feedback: formData.get("feedback_admin"),
          ...(fotoFeedbackId && { foto_feedback: fotoFeedbackId }),
        }
    };
    
    try {
        const res = await fetch(`${BASE_URL}/pengaduans/${docId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            revalidatePath("/admin", "layout");
            revalidatePath("/admin/menunggu");
            revalidatePath("/admin/arsip");
            return { success: true };
        }
        const errResult = await res.json().catch(() => ({})); console.error("Update Feedback Failed:", res.status, errResult); return { success: false, error: errResult?.error?.message || "Gagal update status." };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * 8.5 QUICK UPDATE STATUS (ADMIN)
 */
export async function updateStatusAction(docId, newStatus) {
    const payload = {
        data: {
          status_laporan: newStatus,
        }
    };
    
    try {
        const res = await fetch(`${BASE_URL}/pengaduans/${docId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            revalidatePath("/admin", "layout");
            revalidatePath("/admin/menunggu");
            revalidatePath("/admin/arsip");
            return { success: true };
        }
        const errResult = await res.json().catch(() => ({})); console.error("Update Feedback Failed:", res.status, errResult); return { success: false, error: errResult?.error?.message || "Gagal update status." };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * 9. MANAJEMEN KATEGORI (ADMIN)
 */
export async function createKategoriAction(formData) {
    try {
        const res = await fetch(`${BASE_URL}/kategoris`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: { ket_kategori: formData.get("nama_kategori") }
            }),
        });
        if (res.ok) {
            revalidatePath("/admin/kategori");
            return { success: true };
        }
    } catch (e) {
        return { error: e.message };
    }
}

export async function deleteKategoriAction(docId) {
    try {
        const res = await fetch(`${BASE_URL}/kategoris/${docId}`, { method: "DELETE" });
        if (res.ok) {
            revalidatePath("/admin/kategori");
            return { success: true };
        }
    } catch (e) {
        return { error: e.message };
    }
}

export async function updateKategoriAction(formData) {
    const docId = formData.get("documentId");
    try {
        const res = await fetch(`${BASE_URL}/kategoris/${docId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: { ket_kategori: formData.get("nama_kategori") }
            }),
        });
        if (res.ok) {
            revalidatePath("/admin/kategori");
            return { success: true };
        }
        return { error: "Gagal update kategori" };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * 10. MANAJEMEN SISWA (ADMIN)
 */
export async function getSiswaAction() {
    try {
        const res = await fetch(`${BASE_URL}/siswas`, { cache: 'no-store' });
        return await res.json();
    } catch (e) {
        console.error("Get Siswa Error:", e);
        return { data: [] };
    }
}

export async function createSiswaAction(formData) {
    const payload = {
        data: {
            nis: formData.get("nis"),
            nama: formData.get("nama"),
            password: formData.get("password") || "123", // Default password if not provided
        }
    };

    try {
        const res = await fetch(`${BASE_URL}/siswas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            revalidatePath("/admin/kelola_siswa");
            return { success: true };
        }
        const result = await res.json();
        return { error: result.error?.message || "Gagal menambah siswa" };
    } catch (e) {
        return { error: e.message };
    }
}

export async function updateSiswaAction(formData) {
    const docId = formData.get("documentId");
    const payload = {
        data: {
            nis: formData.get("nis"),
            nama: formData.get("nama"),
        }
    };

    // If password is provided, update it too
    const password = formData.get("password");
    if (password) {
        payload.data.password = password;
    }

    try {
        const res = await fetch(`${BASE_URL}/siswas/${docId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            revalidatePath("/admin/kelola_siswa");
            return { success: true };
        }
        const result = await res.json();
        return { error: result.error?.message || "Gagal update siswa" };
    } catch (e) {
        return { error: e.message };
    }
}

export async function deleteSiswaAction(docId) {
    try {
        const res = await fetch(`${BASE_URL}/siswas/${docId}`, { method: "DELETE" });
        if (res.ok) {
            revalidatePath("/admin/kelola_siswa");
            return { success: true };
        }
        return { error: "Gagal menghapus siswa" };
    } catch (e) {
        return { error: e.message };
    }
}

