"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FileText, ClipboardList, Heart, Shield,
  MapPin, BarChart3, Settings, LogOut, CheckSquare, UserPlus,
  AlertCircle, FolderOpen, ChevronRight, Menu, X, Baby,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  RT: [
    { label: "Dashboard", href: "/rt", icon: LayoutDashboard },
    { label: "Data Warga", href: "/rt/warga", icon: Users },
    { label: "Lapor Warga Baru", href: "/rt/laporan/baru", icon: UserPlus },
    { label: "Lapor Kelahiran", href: "/rt/laporan/lahir", icon: Baby },
    { label: "Lapor Warga Pindah", href: "/rt/laporan/pindah", icon: MapPin },
    { label: "Lapor Warga Meninggal", href: "/rt/laporan/meninggal", icon: AlertCircle },
    { label: "Usulkan Perubahan", href: "/rt/usulan", icon: FileText },
    { label: "Data Bansos", href: "/rt/bansos", icon: Heart }
  ],
  DUKUH: [
    { label: "Dashboard", href: "/dukuh", icon: LayoutDashboard },
    { label: "Kartu Keluarga", href: "/dukuh/kk", icon: FolderOpen },
    { label: "Data Penduduk", href: "/dukuh/penduduk", icon: Users },
    { label: "Wilayah RT", href: "/dukuh/wilayah", icon: MapPin },
    { label: "Verifikasi Laporan", href: "/dukuh/verifikasi", icon: CheckSquare },
    { label: "Data Bansos", href: "/dukuh/bansos", icon: Heart },
    { label: "Data BPJS", href: "/dukuh/bpjs", icon: Shield },
    { label: "Rekap Dukuh", href: "/dukuh/rekap", icon: BarChart3 },
  ],
  OPERATOR: [
    { label: "Dashboard", href: "/operator", icon: LayoutDashboard },
    { label: "Seluruh Data", href: "/operator/data", icon: FolderOpen },
    { label: "Statistik", href: "/operator/statistik", icon: BarChart3 },
    { label: "Monitoring Dukuh", href: "/operator/monitoring/dukuh", icon: MapPin },
    { label: "Monitoring RT/RW", href: "/operator/monitoring/rtrw", icon: Users },
    { label: "Validasi Data", href: "/operator/validasi", icon: CheckSquare },
    { label: "Buat Laporan", href: "/operator/laporan", icon: FileText },
    { label: "Master Wilayah", href: "/operator/wilayah", icon: MapPin },
    { label: "Kelola Akun", href: "/operator/akun", icon: Settings },
  ],
};

const roleColors: Record<string, { header: string; dot: string; badge: string; accent: string }> = {
  RT: {
    header: "from-accent-500 to-accent-600",
    dot: "bg-accent-300",
    badge: "bg-accent-400/20 text-accent-100",
    accent: "bg-accent-500",
  },
  DUKUH: {
    header: "from-secondary-600 to-secondary-700",
    dot: "bg-secondary-300",
    badge: "bg-secondary-400/20 text-secondary-100",
    accent: "bg-secondary-500",
  },
  OPERATOR: {
    header: "from-primary-600 to-primary-800",
    dot: "bg-primary-300",
    badge: "bg-primary-400/20 text-primary-100",
    accent: "bg-primary-500",
  },
};

const roleLabel: Record<string, string> = {
  RT: "RT",
  DUKUH: "Dukuh",
  OPERATOR: "Operator Desa",
};

interface SidebarProps {
  role: string;
  nama: string;
  wilayahNama: string;
  dukuhNama: string;
}

function SidebarContent({
  role, nama, wilayahNama, dukuhNama, onClose,
}: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();
  const navItems = navByRole[role] ?? [];
  const colors = roleColors[role] ?? roleColors.OPERATOR;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className={`bg-gradient-to-b ${colors.header} p-4`}>
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="WIDATA" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">WIDATA</p>
              <p className="text-white/70 text-[9px] leading-tight mt-0.5">Widodomartani</p>
            </div>
          </div>
          {/* Close button (mobile only) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors lg:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white/10 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
              {roleLabel[role]}
            </span>
          </div>
          <p className="text-white font-semibold text-sm leading-tight">{nama}</p>
          <p className="text-white/70 text-xs mt-0.5">
            {role === "RT" ? `${wilayahNama} · ${dukuhNama}` : wilayahNama}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/rt" || item.href === "/dukuh" || item.href === "/operator"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "sidebar-item",
                isActive ? "sidebar-item-active" : "sidebar-item-inactive"
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-item sidebar-item-inactive w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const colors = roleColors[props.role] ?? roleColors.OPERATOR;

  return (
    <>
      {/* === DESKTOP SIDEBAR (lg+) === */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col flex-shrink-0">
        <SidebarContent {...props} />
      </aside>

      {/* === MOBILE TOPBAR === */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r ${colors.header} flex items-center gap-3 px-4 h-14 shadow-md`}>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="WIDATA" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-base">WIDATA</span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
          {roleLabel[props.role]}
        </span>
      </div>

      {/* === MOBILE DRAWER OVERLAY === */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-slide-in">
            <SidebarContent {...props} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
