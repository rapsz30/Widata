import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";
import { TambahPendudukModal } from "./TambahPendudukModal";

export default async function DukuhPendudukPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtList = await prisma.wilayah.findMany({
    where: { parentId: user.wilayahId, jenis: "RT" },
    select: { id: true },
  });
  const rtIds = rtList.map((r) => r.id);

  const [pendudukList, kkList] = await Promise.all([
    prisma.penduduk.findMany({
      where: { kk: { wilayahId: { in: [user.wilayahId, ...rtIds] } } },
      include: { kk: { include: { wilayah: true } } },
      orderBy: { nama: "asc" },
    }),
    prisma.kartuKeluarga.findMany({
      where: { wilayahId: { in: [user.wilayahId, ...rtIds] } },
      select: { id: true, noKK: true, kepalaKeluarga: true },
      orderBy: { kepalaKeluarga: "asc" },
    }),
  ]);

  const aktif = pendudukList.filter((p) => p.statusHidup === "HIDUP" && p.statusTinggal === "TETAP");

  return (
    <>
      <Header
        title="Data Penduduk"
        subtitle={`${aktif.length} aktif dari ${pendudukList.length} total`}
      />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 text-xs flex-wrap">
            <span className="badge bg-secondary-100 text-secondary-700">
              {aktif.length} Aktif
            </span>
            <span className="badge bg-gray-100 text-gray-600">
              {pendudukList.filter((p) => p.statusHidup === "MENINGGAL").length} Meninggal
            </span>
            <span className="badge bg-accent-100 text-accent-600">
              {pendudukList.filter((p) => p.statusTinggal === "PINDAH").length} Pindah
            </span>
          </div>
          <TambahPendudukModal kkList={kkList} />
        </div>

        {/* Mobile: Card */}
        <div className="sm:hidden space-y-2">
          {pendudukList.map((p) => (
            <div key={p.id} className="card p-3 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${p.jenisKelamin === "P" ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"}`}>
                {p.nama.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{p.nama}</p>
                  <StatusBadge status={p.statusHidup} />
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{p.nik}</p>
                <p className="text-xs text-gray-500">{p.kk?.kepalaKeluarga} · {p.kk?.wilayah?.nama}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Tabel */}
        <div className="card hidden sm:block">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">NIK</th>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">L/P</th>
                  <th className="text-left px-3 py-2">Agama</th>
                  <th className="text-left px-3 py-2">Pendidikan</th>
                  <th className="text-left px-3 py-2">Pekerjaan</th>
                  <th className="text-left px-3 py-2">KK</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendudukList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                      Belum ada data penduduk. Tambahkan melalui Kartu Keluarga atau tombol di atas.
                    </td>
                  </tr>
                ) : (
                  pendudukList.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{p.nik?.startsWith("TEMP") ? "—" : p.nik}</td>
                      <td className="px-3 py-3 font-medium text-gray-800">{p.nama}</td>
                      <td className="px-3 py-3 text-gray-600">{p.jenisKelamin === "L" ? "L" : "P"}</td>
                      <td className="px-3 py-3 text-gray-600">{p.agama}</td>
                      <td className="px-3 py-3 text-gray-600">{p.pendidikan}</td>
                      <td className="px-3 py-3 text-gray-600">{p.pekerjaan}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{p.kk?.kepalaKeluarga}</td>
                      <td className="px-3 py-3"><StatusBadge status={p.statusHidup} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
