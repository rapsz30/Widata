import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/features/PrintButton";

export default async function OperatorLaporanPage() {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  const [totalPenduduk, totalKK, totalBansos, laporanBulanIni, dukuhStats] = await Promise.all([
    prisma.penduduk.count({ where: { statusHidup: "HIDUP", statusTinggal: "TETAP" } }),
    prisma.kartuKeluarga.count(),
    prisma.dataBansos.aggregate({ where: { status: "AKTIF" }, _sum: { nilaiManfaat: true }, _count: true }),
    prisma.laporanWarga.findMany({
      where: {
        createdAt: {
          gte: new Date(tahun, bulan - 1, 1),
          lt: new Date(tahun, bulan, 1),
        },
      },
      include: { wilayah: { include: { parent: true } }, penduduk: true },
    }),
    prisma.wilayah.findMany({
      where: { jenis: "DUKUH" },
      include: {
        children: {
          include: { kkList: { include: { _count: { select: { anggota: true } } } } },
        },
      },
      orderBy: { kode: "asc" },
    }),
  ]);

  const bulanNama = now.toLocaleString("id-ID", { month: "long" });

  return (
    <>
      <Header title="Buat Laporan" subtitle={`Laporan Bulanan — ${bulanNama} ${tahun}`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Print button */}
        <div className="flex justify-end">
          <PrintButton />
        </div>

        {/* Header Laporan */}
        <div className="card border-t-4 border-t-primary-500">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              LAPORAN DATA KEPENDUDUKAN
            </h2>
            <p className="text-gray-600">Kalurahan Widodomartani</p>
            <p className="text-gray-500 text-sm">
              Periode: {bulanNama} {tahun}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Penduduk", value: totalPenduduk.toLocaleString("id-ID") },
              { label: "Total KK", value: totalKK.toLocaleString("id-ID") },
              { label: "Penerima Bansos", value: totalBansos._count.toLocaleString("id-ID") },
              { label: "Nilai Bansos", value: formatCurrency(totalBansos._sum.nilaiManfaat ?? 0) },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Laporan Bulan Ini */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">
            Laporan Warga Bulan {bulanNama} {tahun}
          </h3>
          {laporanBulanIni.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Tidak ada laporan bulan ini
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-3 py-2 rounded-l-lg">Jenis</th>
                    <th className="text-left px-3 py-2">Warga</th>
                    <th className="text-left px-3 py-2">Wilayah</th>
                    <th className="text-left px-3 py-2 rounded-r-lg">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {laporanBulanIni.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2">{l.jenis}</td>
                      <td className="px-3 py-2">{l.penduduk?.nama ?? "—"}</td>
                      <td className="px-3 py-2">
                        {l.wilayah.nama} · {l.wilayah.parent?.nama}
                      </td>
                      <td className="px-3 py-2">{formatDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rekap per Dukuh */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Rekap Per Dukuh</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Dukuh</th>
                  <th className="text-center px-3 py-2">Jumlah RT</th>
                  <th className="text-center px-3 py-2">Jumlah KK</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">Jumlah Penduduk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dukuhStats.map((d) => {
                  const totalWarga = d.children.reduce(
                    (s, rt) => s + rt.kkList.reduce((ss, kk) => ss + kk._count.anggota, 0),
                    0
                  );
                  const totalKKDukuh = d.children.reduce((s, rt) => s + rt.kkList.length, 0);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{d.nama}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{d.children.length}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{totalKKDukuh}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{totalWarga}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card border border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Laporan dibuat otomatis oleh Sistem WIDATA · Kalurahan Widodomartani ·{" "}
            {formatDate(new Date())}
          </p>
        </div>
      </div>
    </>
  );
}

