import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function OperatorWilayahPage() {
  const kalurahan = await prisma.wilayah.findFirst({ where: { jenis: "KALURAHAN" } });
  const dukuhList = await prisma.wilayah.findMany({
    where: { jenis: "DUKUH" },
    include: {
      children: { orderBy: { kode: "asc" } },
      _count: { select: { children: true, kkList: true } },
    },
    orderBy: { kode: "asc" },
  });

  return (
    <>
      <Header title="Master Wilayah" subtitle="Struktur wilayah Kalurahan Widodomartani" />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Kalurahan */}
        <div className="card border-l-4 border-l-primary-500">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">Kalurahan</p>
          <p className="text-xl font-bold text-gray-800">{kalurahan?.nama ?? "Widodomartani"}</p>
          <p className="text-sm text-gray-500">Kec. Ngemplak · Kab. Sleman · DIY</p>
        </div>

        {/* Dukuh & RT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dukuhList.map((dukuh) => (
            <div key={dukuh.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                    {dukuh.kode}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Dukuh {dukuh.nama}</p>
                    <p className="text-xs text-gray-400">{dukuh._count.children} RT · {dukuh._count.kkList} KK</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {dukuh.children.map((rt) => (
                  <div key={rt.id} className="bg-primary-50 rounded-lg py-1.5 text-center">
                    <p className="text-xs font-medium text-primary-700">{rt.nama}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
