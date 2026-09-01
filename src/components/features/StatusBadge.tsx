import { cn, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  DIVERIFIKASI: "Diverifikasi",
  DITOLAK: "Ditolak",
  DISETUJUI: "Disetujui",
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
  HIDUP: "Hidup",
  MENINGGAL: "Meninggal",
  PINDAH: "Pindah",
  TETAP: "Tetap",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn("badge", getStatusColor(status))}>
      {label ?? statusLabel[status] ?? status}
    </span>
  );
}
