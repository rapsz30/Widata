import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export default async function DukuhBansosPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtIds = await prisma.wilayah
    .findMany({ where: { parentId: user.wilayahId, jenis: "RT" }, select: { id: true } })
    .then((list) => list.map((r) => r.id));

  const bansos = await prisma.dataBansos.findMany({
    where: { penduduk: { kk: { wilayahId: { in: rtIds } } } },
    include: { penduduk: { include: { kk: { include: { wilayah: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const totalAktif = bansos.filter((b) => b.status === "AKTIF").reduce((s, b) => s + b.nilaiManfaat, 0);

  return (
    <>
      <Header title="Data Bansos" subtitle={`Dukuh ${user.wilayahNama} — View Only`} />
      <div className="p-6">
        <div className="mb-4 bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-accent-600 font-medium">Total Nilai Bansos Aktif</p>
          <p className="text-2xl font-bold text-accent-700">{formatCurrency(totalAktif)}</p>
        </div>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Nama Warga</th>
                  <th className="text-left px-3 py-2">Wilayah RT</th>
                  <th className="text-left px-3 py-2">Jenis</th>
                  <th className="text-left px-3 py-2">Tahun/Sem</th>
                  <th className="text-left px-3 py-2">Nilai</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bansos.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{b.penduduk.nama}</td>
                    <td className="px-3 py-3 text-gray-500">{b.penduduk.kk?.wilayah?.nama ?? "—"}</td>
                    <td className="px-3 py-3"><span className="badge bg-accent-100 text-accent-700">{b.jenisBansos}</span></td>
                    <td className="px-3 py-3 text-gray-500">{b.tahun} / Sem {b.semester}</td>
                    <td className="px-3 py-3 font-medium">{formatCurrency(b.nilaiManfaat)}</td>
                    <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
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
