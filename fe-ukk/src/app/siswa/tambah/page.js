import { redirect } from "next/navigation";
import { getMeAction, getKategoriAction } from "@/lib/actions";
import TambahLaporanPageClient from "./TambahLaporanClient";

export default async function TambahLaporanPage() {
  const user = await getMeAction();
  if (!user || user.role !== "Siswa") redirect("/");

  const kategoriRes = await getKategoriAction();
  const kategoriList = kategoriRes.data || [];

  return <TambahLaporanPageClient kategoriList={kategoriList} userId={user.id} />;
}
