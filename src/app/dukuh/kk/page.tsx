import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { TambahKKModal } from "./TambahKKModal";
import { FolderOpen, Users, ChevronRight } from "lucide-react";

export default async function DukuhKKPage() {
  const session = await auth();
  const user = session!.user as any;

  const kkList = await prisma.kartuKeluarga.findMany({
    where: { wilayahId: user.wilayahId },
    include: {
      _count: { select: { anggota: true } },
      anggota: {
        where: { statusHidup: "HIDUP" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Kartu Keluarga" subtitle={`${kkList.length} KK terdaftar di wilayah Anda`} />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <FolderOpen size={16} className="text-primary-500" />
              <span>{kkList.length} KK</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={16} className="text-secondary-500" />
              <span>
                {kkList.reduce((s, kk) => s + kk.anggota.length, 0)} jiwa aktif
              </span>
            </div>
          </div>
          <TambahKKModal wilayahId={user.wilayahId} />
        </div>

        {/* Daftar KK */}
        {kkList.length === 0 ? (
          <div className="card text-center py-12">
            <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada KK terdaftar</p>
            <p className="text-sm text-gray-400 mt-1">
              Klik "Tambah KK" untuk menambahkan data baru
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            <div className="sm:hidden space-y-2">
              {kkList.map((kk) => (
                <div key={kk.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={18} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{kk.kepalaKeluarga}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{kk.noKK}</p>
                    <p className="text-xs text-gray-400">{kk.anggota.length} jiwa aktif · {formatDate(kk.createdAt)}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Desktop: Tabel */}
            <div className="card hidden sm:block">
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-3 py-2 rounded-l-lg">No. KK</th>
                      <th className="text-left px-3 py-2">Kepala Keluarga</th>
                      <th className="text-left px-3 py-2">Alamat</th>
                      <th className="text-center px-3 py-2">Jiwa Aktif</th>
                      <th className="text-left px-3 py-2 rounded-r-lg">Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {kkList.map((kk) => (
                      <tr key={kk.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 font-mono text-xs text-gray-500">{kk.noKK}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{kk.kepalaKeluarga}</td>
                        <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">{kk.alamat}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="badge bg-primary-100 text-primary-700">
                            {kk.anggota.length} jiwa
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(kk.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
