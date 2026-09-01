import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";

export default async function DukuhWilayahPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtList = await prisma.wilayah.findMany({
    where: { parentId: user.wilayahId, jenis: "RT" },
    include: {
      _count: { select: { kkList: true } },
      users: { select: { nama: true } },
    },
    orderBy: { kode: "asc" },
  });

  return (
    <>
      <Header title="Data Wilayah RT" subtitle={`Dukuh ${user.wilayahNama}`} />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rtList.map((rt) => (
            <div key={rt.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                  {rt.nama.replace("RT ", "")}
                </div>
                <span className="text-xs text-gray-400">{rt.kode}</span>
              </div>
              <p className="font-semibold text-gray-800">{rt.nama}</p>
              <p className="text-sm text-gray-500">Dukuh {user.wilayahNama}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">{rt._count.kkList} KK</span>
                <span className="text-gray-400 text-xs">
                  {rt.users[0]?.nama ?? "Belum ada akun"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
