import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";

export default async function DukuhRekapPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtIds = await prisma.wilayah
    .findMany({ where: { parentId: user.wilayahId, jenis: "RT" }, include: { _count: { select: { kkList: true } }, kkList: { include: { _count: { select: { anggota: true } } } } } })
    .then((list) =>
      list.map((rt) => ({
        id: rt.id,
        nama: rt.nama,
        totalKK: rt._count.kkList,
        totalWarga: rt.kkList.reduce((s, kk) => s + kk._count.anggota, 0),
      }))
    );

  const totalKK = rtIds.reduce((s, r) => s + r.totalKK, 0);
  const totalWarga = rtIds.reduce((s, r) => s + r.totalWarga, 0);

  const totalBansos = await prisma.dataBansos.aggregate({
    where: {
      penduduk: { kk: { wilayahId: { in: rtIds.map((r) => r.id) } } },
      status: "AKTIF",
    },
    _sum: { nilaiManfaat: true },
    _count: true,
  });

  return (
    <>
      <Header title="Rekap Dukuh" subtitle={`Dukuh ${user.wilayahNama}`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{totalKK}</p>
            <p className="text-sm text-gray-500 mt-1">Total KK</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-secondary-600">{totalWarga}</p>
            <p className="text-sm text-gray-500 mt-1">Total Penduduk</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-accent-500">{totalBansos._count}</p>
            <p className="text-sm text-gray-500 mt-1">Penerima Bansos</p>
            <p className="text-xs text-gray-400">{formatCurrency(totalBansos._sum.nilaiManfaat ?? 0)}</p>
          </div>
        </div>

        {/* Per RT */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Rekap Per RT</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Wilayah RT</th>
                  <th className="text-center px-3 py-2">Jumlah KK</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">Jumlah Warga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rtIds.map((rt) => (
                  <tr key={rt.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{rt.nama}</td>
                    <td className="px-3 py-3 text-center text-gray-700">{rt.totalKK}</td>
                    <td className="px-3 py-3 text-center text-gray-700">{rt.totalWarga}</td>
                  </tr>
                ))}
                <tr className="bg-primary-50 font-semibold">
                  <td className="px-3 py-3 text-primary-700">Total</td>
                  <td className="px-3 py-3 text-center text-primary-700">{totalKK}</td>
                  <td className="px-3 py-3 text-center text-primary-700">{totalWarga}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
