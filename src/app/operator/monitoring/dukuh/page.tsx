import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function OperatorMonitoringDukuh() {
  const dukuhList = await prisma.wilayah.findMany({
    where: { jenis: "DUKUH" },
    include: {
      children: {
        include: {
          _count: { select: { kkList: true } },
          kkList: { include: { _count: { select: { anggota: true } } } },
        },
      },
      users: { select: { nama: true, aktif: true } },
    },
    orderBy: { kode: "asc" },
  });

  return (
    <>
      <Header title="Monitoring Dukuh" subtitle="Kalurahan Widodomartani" />
      <div className="p-4 sm:p-6 space-y-4">
        {dukuhList.map((dukuh) => {
          const totalKK = dukuh.children.reduce((s, rt) => s + rt._count.kkList, 0);
          const totalWarga = dukuh.children.reduce(
            (s, rt) => s + rt.kkList.reduce((ss, kk) => ss + kk._count.anggota, 0),
            0
          );

          return (
            <div key={dukuh.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    {dukuh.kode}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Dukuh {dukuh.nama}</p>
                    <p className="text-xs text-gray-500">
                      Petugas: {dukuh.users[0]?.nama ?? "Belum ada"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary-600">{totalKK}</p>
                    <p className="text-xs text-gray-400">KK</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-secondary-600">{totalWarga}</p>
                    <p className="text-xs text-gray-400">Warga</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-600">{dukuh.children.length}</p>
                    <p className="text-xs text-gray-400">RT</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {dukuh.children.map((rt) => (
                  <div key={rt.id} className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs font-medium text-gray-700">{rt.nama}</p>
                    <p className="text-sm font-bold text-primary-600">{rt._count.kkList} KK</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
