import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function OperatorValidasiPage() {
  const usulan = await prisma.usulanPerubahan.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      penduduk: true,
      pengusul: { include: { wilayah: { include: { parent: true } } } },
    },
  });

  const pending = usulan.filter((u) => u.status === "PENDING");
  const selesai = usulan.filter((u) => u.status !== "PENDING");

  const fieldLabels: Record<string, string> = {
    nama: "Nama", pekerjaan: "Pekerjaan", pendidikan: "Pendidikan",
    agama: "Agama", statusKawin: "Status Kawin", tempatLahir: "Tempat Lahir",
  };

  return (
    <>
      <Header title="Validasi Data" subtitle={`${pending.length} usulan menunggu validasi`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Usulan Perubahan Pending</h3>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada usulan pending</p>
            ) : (
              pending.map((u) => (
                <div key={u.id} className="border border-primary-100 bg-primary-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-800">{u.penduduk.nama}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Diusulkan oleh: {u.pengusul.nama} · {u.pengusul.wilayah?.nama} · {u.pengusul.wilayah?.parent?.nama}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="badge bg-gray-200 text-gray-700">{fieldLabels[u.field] ?? u.field}</span>
                        <span className="text-red-400 line-through">{u.nilaiLama}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-secondary-600 font-medium">{u.nilaiBaru}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 italic">"{u.alasan}"</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Riwayat</h3>
          <div className="space-y-2">
            {selesai.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{u.penduduk.nama} — {fieldLabels[u.field] ?? u.field}</p>
                  <p className="text-xs text-gray-400">{formatDate(u.createdAt)}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
