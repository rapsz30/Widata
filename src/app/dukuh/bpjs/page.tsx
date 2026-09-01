import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";

export default async function DukuhBPJSPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtIds = await prisma.wilayah
    .findMany({ where: { parentId: user.wilayahId, jenis: "RT" }, select: { id: true } })
    .then((list) => list.map((r) => r.id));

  const bpjsData = await prisma.dataBPJS.findMany({
    where: { penduduk: { kk: { wilayahId: { in: rtIds } } } },
    include: { penduduk: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Data BPJS" subtitle={`Dukuh ${user.wilayahNama}`} />
      <div className="p-6">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Nama Peserta</th>
                  <th className="text-left px-3 py-2">No. Kartu</th>
                  <th className="text-left px-3 py-2">Jenis</th>
                  <th className="text-left px-3 py-2">Kelas</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bpjsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">Belum ada data BPJS</td>
                  </tr>
                ) : (
                  bpjsData.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{b.penduduk.nama}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{b.noKartu}</td>
                      <td className="px-3 py-3"><span className="badge bg-primary-100 text-primary-700">{b.jenis}</span></td>
                      <td className="px-3 py-3 text-gray-600">Kelas {b.kelas}</td>
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
