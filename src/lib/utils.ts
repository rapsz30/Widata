import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getRoleBadge(role: string): string {
  const map: Record<string, string> = {
    OPERATOR: "Operator Desa",
    DUKUH: "Dukuh",
    RT: "RT",
  };
  return map[role] ?? role;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    DIVERIFIKASI: "bg-secondary-100 text-secondary-700",
    DITOLAK: "bg-red-100 text-red-800",
    DISETUJUI: "bg-secondary-100 text-secondary-700",
    AKTIF: "bg-secondary-100 text-secondary-700",
    NONAKTIF: "bg-gray-100 text-gray-600",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}
