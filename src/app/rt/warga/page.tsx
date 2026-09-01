import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/features/StatusBadge";

export default async function RTWargaPage() {
  const session = await auth();
  const user = session!.user as any;

  const warga = await prisma.penduduk.findMany({
    where: { kk: { wilayahId: user.wilayahId } },
    include: { kk: true },
    orderBy: { nama: "asc" },
  });

  return (
    <>
      <Header title="Data Warga" subtitle="Daftar penduduk di wilayah RT Anda" />
      <div className="p-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-800">{warga.length} warga</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">NIK</th>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">L/P</th>
                  <th className="text-left px-3 py-2">Tgl Lahir</th>
                  <th className="text-left px-3 py-2">Pekerjaan</th>
                  <th className="text-left px-3 py-2">No KK</th>
                  <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {warga.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Belum ada data warga
                    </td>
                  </tr>
                ) : (
                  warga.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{w.nik}</td>
                      <td className="px-3 py-3 font-medium text-gray-800">{w.nama}</td>
                      <td className="px-3 py-3 text-gray-600">{w.jenisKelamin}</td>
                      <td className="px-3 py-3 text-gray-500">{formatDate(w.tanggalLahir)}</td>
                      <td className="px-3 py-3 text-gray-600">{w.pekerjaan}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{w.kk?.noKK ?? "—"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={w.statusHidup} />
                      </td>
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
