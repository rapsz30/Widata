import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";
import { FormUsulan } from "./FormUsulan";
import { FileEdit } from "lucide-react";

export default async function RTUsulanPage() {
  const session = await auth();
  const user = session!.user as any;

  const usulan = await prisma.usulanPerubahan.findMany({
    where: { pengusulId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Usulkan Perubahan Data"
        subtitle="Ajukan perubahan data kependudukan untuk diverifikasi Dukuh"
      />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Form Usulan */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <FileEdit size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800">Form Usulan Perubahan</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Jelaskan secara bebas data apa yang perlu diubah. Tidak perlu memilih warga dari daftar —
            cukup tulis nama/NIK dan keterangan perubahannya.
          </p>
          <FormUsulan />
        </div>

        {/* Riwayat */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">
            Riwayat Usulan
            <span className="ml-2 text-xs font-normal text-gray-400">({usulan.length} usulan)</span>
          </h3>
          <div className="space-y-3">
            {usulan.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada usulan perubahan yang dikirim.
              </p>
            ) : (
              usulan.map((u) => (
                <div
                  key={u.id}
                  className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{u.nilaiBaru}</p>
                    {u.nilaiLama && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Warga: {u.nilaiLama}
                      </p>
                    )}
                    {u.alasan && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{u.alasan}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(u.createdAt)}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
