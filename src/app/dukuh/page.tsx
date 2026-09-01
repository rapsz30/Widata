import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/features/StatCard";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Users, FolderOpen, CheckSquare, Heart, Clock } from "lucide-react";
import Link from "next/link";

export default async function DukuhDashboard() {
  const session = await auth();
  const user = session!.user as any;

  const rtList = await prisma.wilayah.findMany({
    where: { parentId: user.wilayahId, jenis: "RT" },
    select: { id: true },
  });
  const rtIds = rtList.map((r) => r.id);

  const [totalKK, totalPenduduk, pendingLaporan, totalBansos] = await Promise.all([
    prisma.kartuKeluarga.count({ where: { wilayahId: { in: rtIds } } }),
    prisma.penduduk.count({
      where: { kk: { wilayahId: { in: rtIds } }, statusHidup: "HIDUP", statusTinggal: "TETAP" },
    }),
    prisma.laporanWarga.count({ where: { wilayahId: { in: rtIds }, status: "PENDING" } }),
    prisma.dataBansos.count({
      where: { penduduk: { kk: { wilayahId: { in: rtIds } } }, status: "AKTIF" },
    }),
  ]);

  const laporanPending = await prisma.laporanWarga.findMany({
    where: { wilayahId: { in: rtIds }, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { penduduk: true, wilayah: true, pelapor: true },
  });

  return (
    <>
      <Header title="Dashboard Dukuh" subtitle={`Dukuh ${user.wilayahNama}`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total KK" value={totalKK} subtitle="Kartu keluarga" icon={FolderOpen} color="primary" />
          <StatCard title="Total Penduduk" value={totalPenduduk} subtitle="Warga aktif" icon={Users} color="secondary" />
          <StatCard title="Penerima Bansos" value={totalBansos} subtitle="Program aktif" icon={Heart} color="accent" />
          <StatCard title="Laporan Pending" value={pendingLaporan} subtitle="Perlu verifikasi" icon={Clock} color="gray" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/dukuh/kk" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-primary-50 group-hover:bg-primary-500 flex items-center justify-center transition-colors flex-shrink-0">
              <FolderOpen size={20} className="text-primary-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Kelola KK</p>
              <p className="text-xs text-gray-500 hidden sm:block">Data Kartu Keluarga</p>
            </div>
          </Link>
          <Link href="/dukuh/penduduk" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-secondary-50 group-hover:bg-secondary-500 flex items-center justify-center transition-colors flex-shrink-0">
              <Users size={20} className="text-secondary-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Kelola Penduduk</p>
              <p className="text-xs text-gray-500 hidden sm:block">Data warga dukuh</p>
            </div>
          </Link>
          <Link href="/dukuh/verifikasi" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-accent-50 group-hover:bg-accent-400 flex items-center justify-center transition-colors flex-shrink-0">
              <CheckSquare size={20} className="text-accent-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Verifikasi</p>
              <p className="text-xs text-gray-500 hidden sm:block">{pendingLaporan} laporan pending</p>
            </div>
          </Link>
        </div>

        {/* Laporan Pending */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Laporan Menunggu Verifikasi</h3>
            <Link href="/dukuh/verifikasi" className="text-xs sm:text-sm text-primary-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          {laporanPending.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Tidak ada laporan pending</p>
          ) : (
            <div className="space-y-2">
              {laporanPending.map((lap) => (
                <div key={lap.id} className="flex items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {lap.jenis === "BARU" ? "Warga Baru" : lap.jenis === "PINDAH" ? "Warga Pindah" : "Warga Meninggal"}
                      {lap.penduduk && ` — ${lap.penduduk.nama}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {lap.pelapor.nama} · {lap.wilayah.nama} · {formatDate(lap.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={lap.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
