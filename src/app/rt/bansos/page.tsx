import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { CatatBansosModal } from "./CatatBansosModal";

export default async function RTBansosPage() {
  const session = await auth();
  const user = session!.user as any;

  const [bansos, pendudukList] = await Promise.all([
    prisma.dataBansos.findMany({
      where: { penduduk: { kk: { wilayahId: user.wilayahId } } },
      include: { penduduk: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.penduduk.findMany({
      where: { kk: { wilayahId: user.wilayahId }, statusHidup: "HIDUP" },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  const totalNilai = bansos
    .filter((b) => b.status === "AKTIF")
    .reduce((sum, b) => sum + b.nilaiManfaat, 0);

  return (
    <>
      <Header title="Data Bansos" subtitle="Kelola data bantuan sosial di wilayah RT Anda" />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-3">
            <p className="text-xs text-accent-600 font-medium">Total Nilai Bansos Aktif</p>
            <p className="text-xl font-bold text-accent-700">{formatCurrency(totalNilai)}</p>
          </div>
          <CatatBansosModal pendudukList={pendudukList} />
        </div>

        {/* Tabel */}
        <div className="card">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[450px]">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Nama Warga</th>
                  <th className="text-left px-3 py-2">Jenis Bansos</th>
                  <th className="text-left px-3 py-2">Tahun/Sem</th>
                  <th className="text-left px-3 py-2">Nilai</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bansos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                      Belum ada data bansos. Klik "Catat Bantuan" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  bansos.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{b.penduduk.nama}</td>
                      <td className="px-3 py-3">
                        <span className="badge bg-accent-100 text-accent-700">{b.jenisBansos}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{b.tahun} / Sem {b.semester}</td>
                      <td className="px-3 py-3 font-medium text-gray-700">{formatCurrency(b.nilaiManfaat)}</td>
                      <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
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
