import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDate } from "@/lib/utils";
import { verifikasiLaporan } from "@/app/dukuh/actions";

export default async function DukuhVerifikasiPage() {
  const session = await auth();
  const user = session!.user as any;

  const rtIds = await prisma.wilayah
    .findMany({ where: { parentId: user.wilayahId, jenis: "RT" }, select: { id: true } })
    .then((list) => list.map((r) => r.id));

  const laporan = await prisma.laporanWarga.findMany({
    where: { wilayahId: { in: rtIds } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { penduduk: true, pelapor: true, wilayah: true },
  });

  const pending = laporan.filter((l) => l.status === "PENDING");
  const selesai = laporan.filter((l) => l.status !== "PENDING");

  return (
    <>
      <Header title="Verifikasi Laporan RT" subtitle={`${pending.length} laporan menunggu verifikasi`} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Laporan Pending */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Menunggu Verifikasi
            {pending.length > 0 && (
              <span className="badge bg-accent-100 text-accent-700">{pending.length}</span>
            )}
          </h3>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Tidak ada laporan pending</p>
            ) : (
              pending.map((lap) => (
                <div key={lap.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${
                          lap.jenis === "BARU" ? "bg-secondary-100 text-secondary-700" :
                          lap.jenis === "PINDAH" ? "bg-accent-100 text-accent-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {lap.jenis === "BARU" ? "Warga Baru" : lap.jenis === "PINDAH" ? "Pindah" : "Meninggal"}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">
                        {lap.penduduk?.nama ?? (lap.dataBaru ? JSON.parse(lap.dataBaru).nama : "—")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Dilaporkan: {lap.pelapor.nama} · {lap.wilayah.nama} · {formatDate(lap.createdAt)}
                      </p>
                      {lap.catatan && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{lap.catatan}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <form action={async () => { "use server"; await verifikasiLaporan(lap.id, "DIVERIFIKASI"); }}>
                        <button type="submit" className="btn-secondary text-sm py-1.5">
                          ✓ Verifikasi
                        </button>
                      </form>
                      <form action={async () => { "use server"; await verifikasiLaporan(lap.id, "DITOLAK"); }}>
                        <button type="submit" className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          ✗ Tolak
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Riwayat */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Riwayat Verifikasi</h3>
          <div className="space-y-2">
            {selesai.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada riwayat</p>
            ) : (
              selesai.map((lap) => (
                <div key={lap.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {lap.jenis} — {lap.penduduk?.nama ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(lap.createdAt)}</p>
                  </div>
                  <StatusBadge status={lap.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
