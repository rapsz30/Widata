import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/features/StatCard";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Users, FolderOpen, Heart, MapPin, BarChart3, Shield } from "lucide-react";
import Link from "next/link";

export default async function OperatorDashboard() {
  const [totalPenduduk, totalKK, totalBansos, totalBPJS, totalDukuh, totalRT, laporanTerbaru] =
    await Promise.all([
      prisma.penduduk.count({ where: { statusHidup: "HIDUP", statusTinggal: "TETAP" } }),
      prisma.kartuKeluarga.count(),
      prisma.dataBansos.count({ where: { status: "AKTIF" } }),
      prisma.dataBPJS.count({ where: { status: "AKTIF" } }),
      prisma.wilayah.count({ where: { jenis: "DUKUH" } }),
      prisma.wilayah.count({ where: { jenis: "RT" } }),
      prisma.laporanWarga.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { pelapor: true, wilayah: { include: { parent: true } } },
      }),
    ]);

  const nilaiTotalBansos = await prisma.dataBansos.aggregate({
    where: { status: "AKTIF" },
    _sum: { nilaiManfaat: true },
  });

  return (
    <>
      <Header title="Dashboard Operator" subtitle="Kalurahan Widodomartani" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Stats baris 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Penduduk" value={totalPenduduk.toLocaleString("id-ID")} icon={Users} color="primary" />
          <StatCard title="Kartu Keluarga" value={totalKK.toLocaleString("id-ID")} icon={FolderOpen} color="secondary" />
          <StatCard
            title="Penerima Bansos"
            value={totalBansos.toLocaleString("id-ID")}
            subtitle={formatCurrency(nilaiTotalBansos._sum.nilaiManfaat ?? 0)}
            icon={Heart}
            color="accent"
          />
          <StatCard title="Peserta BPJS" value={totalBPJS.toLocaleString("id-ID")} icon={Shield} color="gray" />
        </div>

        {/* Stats baris 2 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="card flex items-center gap-3 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-white sm:hidden" />
              <MapPin size={22} className="text-white hidden sm:block" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalDukuh}</p>
              <p className="text-xs sm:text-sm text-gray-500">Dukuh</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary-500 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-white sm:hidden" />
              <BarChart3 size={22} className="text-white hidden sm:block" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalRT}</p>
              <p className="text-xs sm:text-sm text-gray-500">RT</p>
            </div>
          </div>
        </div>

        {/* Laporan Terbaru */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Aktivitas Laporan Terbaru</h3>
            <Link href="/operator/data" className="text-xs sm:text-sm text-primary-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-2">
            {laporanTerbaru.map((lap) => (
              <div key={lap.id} className="flex items-start sm:items-center justify-between py-2.5 border-b border-gray-100 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    <span className={`badge mr-1.5 ${
                      lap.jenis === "BARU" ? "bg-secondary-100 text-secondary-700" :
                      lap.jenis === "PINDAH" ? "bg-accent-100 text-accent-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{lap.jenis}</span>
                    <span className="hidden sm:inline">{lap.wilayah.parent?.nama ?? lap.wilayah.nama} · </span>
                    {lap.wilayah.nama}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {lap.pelapor.nama} · {formatDate(lap.createdAt)}
                  </p>
                </div>
                <StatusBadge status={lap.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
