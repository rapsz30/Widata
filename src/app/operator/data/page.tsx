import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function OperatorDataPage() {
  const [penduduk, laporan] = await Promise.all([
    prisma.penduduk.findMany({
      include: { kk: { include: { wilayah: { include: { parent: true } } } } },
      orderBy: { nama: "asc" },
      take: 100,
    }),
    prisma.laporanWarga.findMany({
      include: {
        penduduk: true,
        pelapor: true,
        wilayah: { include: { parent: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <Header title="Seluruh Data" subtitle={`${penduduk.length} penduduk terdaftar`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Data Penduduk */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Data Penduduk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">NIK</th>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">L/P</th>
                  <th className="text-left px-3 py-2">Agama</th>
                  <th className="text-left px-3 py-2">Pekerjaan</th>
                  <th className="text-left px-3 py-2">RT</th>
                  <th className="text-left px-3 py-2">Dukuh</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {penduduk.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      Belum ada data penduduk
                    </td>
                  </tr>
                ) : (
                  penduduk.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{p.nik}</td>
                      <td className="px-3 py-3 font-medium text-gray-800">{p.nama}</td>
                      <td className="px-3 py-3 text-gray-600">{p.jenisKelamin}</td>
                      <td className="px-3 py-3 text-gray-600">{p.agama}</td>
                      <td className="px-3 py-3 text-gray-600">{p.pekerjaan}</td>
                      <td className="px-3 py-3 text-gray-500">{p.kk?.wilayah?.nama ?? "—"}</td>
                      <td className="px-3 py-3 text-gray-500">{p.kk?.wilayah?.parent?.nama ?? "—"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={p.statusHidup} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Laporan Terbaru */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Laporan Warga Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Jenis</th>
                  <th className="text-left px-3 py-2">Warga</th>
                  <th className="text-left px-3 py-2">Pelapor</th>
                  <th className="text-left px-3 py-2">Wilayah</th>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laporan.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <span
                        className={`badge ${
                          l.jenis === "BARU"
                            ? "bg-secondary-100 text-secondary-700"
                            : l.jenis === "PINDAH"
                            ? "bg-accent-100 text-accent-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {l.jenis}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{l.penduduk?.nama ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{l.pelapor.nama}</td>
                    <td className="px-3 py-3 text-gray-500">
                      {l.wilayah.nama} · {l.wilayah.parent?.nama}
                    </td>
                    <td className="px-3 py-3 text-gray-500">{formatDate(l.createdAt)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

