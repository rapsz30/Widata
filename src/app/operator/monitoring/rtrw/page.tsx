import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";

export default async function OperatorMonitoringRTPage() {
  const rtList = await prisma.wilayah.findMany({
    where: { jenis: "RT" },
    include: {
      parent: true,
      users: { select: { nama: true, aktif: true } },
      _count: { select: { kkList: true } },
      laporanWarga: { select: { status: true } },
    },
    orderBy: [{ parent: { kode: "asc" } }, { kode: "asc" }],
  });

  return (
    <>
      <Header title="Monitoring RT/RW" subtitle={`${rtList.length} RT terdaftar`} />
      <div className="p-6">
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2 rounded-l-lg">Dukuh</th>
                <th className="text-left px-3 py-2">RT</th>
                <th className="text-left px-3 py-2">Petugas RT</th>
                <th className="text-center px-3 py-2">Total KK</th>
                <th className="text-center px-3 py-2">Laporan</th>
                <th className="text-center px-3 py-2 rounded-r-lg">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rtList.map((rt) => {
                const laporanPending = rt.laporanWarga.filter((l) => l.status === "PENDING").length;
                return (
                  <tr key={rt.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-600">{rt.parent?.nama ?? "—"}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{rt.nama}</td>
                    <td className="px-3 py-3 text-gray-600">{rt.users[0]?.nama ?? "—"}</td>
                    <td className="px-3 py-3 text-center font-medium text-gray-700">{rt._count.kkList}</td>
                    <td className="px-3 py-3 text-center">
                      {laporanPending > 0 ? (
                        <span className="badge bg-accent-100 text-accent-700">{laporanPending} pending</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {rt.users[0] ? (
                        <span className={`badge ${rt.users[0].aktif ? "bg-secondary-100 text-secondary-700" : "bg-red-100 text-red-600"}`}>
                          {rt.users[0].aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">Belum ada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
