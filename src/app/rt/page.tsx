import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/features/StatCard";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Users, Heart, FileText, Clock, UserPlus, MapPin } from "lucide-react";
import Link from "next/link";

export default async function RTDashboard() {
  const session = await auth();
  const user = session!.user as any;

  const [totalWarga, totalKK, totalBansos, laporanTerbaru] = await Promise.all([
    prisma.penduduk.count({
      where: { kk: { wilayahId: user.wilayahId }, statusHidup: "HIDUP", statusTinggal: "TETAP" },
    }),
    prisma.kartuKeluarga.count({ where: { wilayahId: user.wilayahId } }),
    prisma.dataBansos.count({
      where: { penduduk: { kk: { wilayahId: user.wilayahId } }, status: "AKTIF" },
    }),
    prisma.laporanWarga.findMany({
      where: { wilayahId: user.wilayahId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { penduduk: true },
    }),
  ]);

  const now = new Date();
  const bulan = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

  return (
    <>
      <Header title="Dashboard RT" subtitle={`${user.wilayahNama} · ${user.dukuhNama} · ${bulan}`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Warga" value={totalWarga} subtitle="Penduduk aktif" icon={Users} color="primary" />
          <StatCard title="Kartu Keluarga" value={totalKK} subtitle="KK terdaftar" icon={FileText} color="secondary" />
          <StatCard title="Penerima Bansos" value={totalBansos} subtitle="Program aktif" icon={Heart} color="accent" />
          <StatCard
            title="Laporan Pending"
            value={laporanTerbaru.filter((l) => l.status === "PENDING").length}
            subtitle="Menunggu verifikasi"
            icon={Clock}
            color="gray"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/rt/laporan/baru" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-500 transition-colors flex-shrink-0">
              <UserPlus size={20} className="text-secondary-500 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Lapor Warga Baru</p>
              <p className="text-xs text-gray-500 hidden sm:block">Daftarkan warga pindah masuk</p>
            </div>
          </Link>
          <Link href="/rt/laporan/pindah" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center group-hover:bg-accent-400 transition-colors flex-shrink-0">
              <MapPin size={20} className="text-accent-500 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Lapor Warga Pindah</p>
              <p className="text-xs text-gray-500 hidden sm:block">Laporkan warga pindah keluar</p>
            </div>
          </Link>
          <Link href="/rt/bansos" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-500 transition-colors flex-shrink-0">
              <Heart size={20} className="text-primary-500 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Kelola Bansos</p>
              <p className="text-xs text-gray-500 hidden sm:block">Kelola data bantuan sosial</p>
            </div>
          </Link>
        </div>

        {/* Riwayat Laporan */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Riwayat Laporan Terbaru</h3>
          {laporanTerbaru.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada laporan</p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-3 py-2 rounded-l-lg">Jenis</th>
                    <th className="text-left px-3 py-2">Warga</th>
                    <th className="text-left px-3 py-2 hidden sm:table-cell">Tanggal</th>
                    <th className="text-left px-3 py-2 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {laporanTerbaru.map((lap) => (
                    <tr key={lap.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <span className={`badge ${
                          lap.jenis === "BARU" ? "bg-secondary-100 text-secondary-700" :
                          lap.jenis === "PINDAH" ? "bg-accent-100 text-accent-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {lap.jenis === "BARU" ? "Baru" : lap.jenis === "PINDAH" ? "Pindah" : "Meninggal"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-700 max-w-[120px] truncate">{lap.penduduk?.nama ?? "—"}</td>
                      <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{formatDate(lap.createdAt)}</td>
                      <td className="px-3 py-3"><StatusBadge status={lap.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
