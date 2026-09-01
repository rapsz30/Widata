import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";

export default async function OperatorStatistikPage() {
  const [
    totalPenduduk,
    lakiLaki,
    perempuan,
    perAgama,
    perPendidikan,
    perPekerjaan,
    perDukuh,
    bansosStats,
  ] = await Promise.all([
    prisma.penduduk.count({ where: { statusHidup: "HIDUP" } }),
    prisma.penduduk.count({ where: { statusHidup: "HIDUP", jenisKelamin: "L" } }),
    prisma.penduduk.count({ where: { statusHidup: "HIDUP", jenisKelamin: "P" } }),
    prisma.penduduk.groupBy({
      by: ["agama"],
      where: { statusHidup: "HIDUP" },
      _count: true,
      orderBy: { _count: { agama: "desc" } },
    }),
    prisma.penduduk.groupBy({
      by: ["pendidikan"],
      where: { statusHidup: "HIDUP" },
      _count: true,
      orderBy: { _count: { pendidikan: "desc" } },
    }),
    prisma.penduduk.groupBy({
      by: ["pekerjaan"],
      where: { statusHidup: "HIDUP" },
      _count: true,
      orderBy: { _count: { pekerjaan: "desc" } },
      take: 8,
    }),
    prisma.wilayah.findMany({
      where: { jenis: "DUKUH" },
      include: {
        children: {
          include: { kkList: { include: { _count: { select: { anggota: true } } } } },
        },
      },
    }),
    prisma.dataBansos.groupBy({
      by: ["jenisBansos"],
      where: { status: "AKTIF" },
      _count: true,
      _sum: { nilaiManfaat: true },
    }),
  ]);

  return (
    <>
      <Header title="Statistik" subtitle="Data statistik kependudukan Kalurahan Widodomartani" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-4xl font-bold text-primary-600">{totalPenduduk}</p>
            <p className="text-sm text-gray-500 mt-1">Total Penduduk Hidup</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-blue-500">{lakiLaki}</p>
            <p className="text-sm text-gray-500 mt-1">Laki-laki</p>
            <p className="text-xs text-gray-400">
              {totalPenduduk > 0 ? ((lakiLaki / totalPenduduk) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-pink-500">{perempuan}</p>
            <p className="text-sm text-gray-500 mt-1">Perempuan</p>
            <p className="text-xs text-gray-400">
              {totalPenduduk > 0 ? ((perempuan / totalPenduduk) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Per Dukuh */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Penduduk per Dukuh</h3>
          <div className="space-y-3">
            {perDukuh.map((dukuh) => {
              const total = dukuh.children.reduce(
                (s, rt) => s + rt.kkList.reduce((ss, kk) => ss + kk._count.anggota, 0),
                0
              );
              const pct = totalPenduduk > 0 ? (total / totalPenduduk) * 100 : 0;
              return (
                <div key={dukuh.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Dukuh {dukuh.nama}</span>
                    <span className="text-gray-500">{total} jiwa</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Agama */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Distribusi Agama</h3>
            <div className="space-y-2">
              {perAgama.map((a) => (
                <div key={a.agama} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{a.agama}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary-500 rounded-full"
                        style={{ width: `${totalPenduduk > 0 ? (a._count / totalPenduduk) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-600 w-8 text-right">{a._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pekerjaan */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Top Pekerjaan</h3>
            <div className="space-y-2">
              {perPekerjaan.map((p) => (
                <div key={p.pekerjaan} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{p.pekerjaan}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-400 rounded-full"
                        style={{ width: `${totalPenduduk > 0 ? (p._count / totalPenduduk) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-600 w-8 text-right">{p._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bansos */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Rekap Bansos per Jenis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bansosStats.map((b) => (
              <div key={b.jenisBansos} className="bg-accent-50 border border-accent-200 rounded-xl p-3">
                <p className="font-bold text-accent-700 text-lg">{b._count}</p>
                <p className="text-xs font-semibold text-accent-600">{b.jenisBansos}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(b._sum.nilaiManfaat ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

