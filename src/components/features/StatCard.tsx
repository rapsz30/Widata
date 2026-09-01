import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "gray";
  trend?: { value: number; label: string };
}

const colorMap = {
  primary:   { bg: "bg-primary-500",   light: "bg-primary-50",   text: "text-primary-600",   icon: "text-white" },
  secondary: { bg: "bg-secondary-500", light: "bg-secondary-50", text: "text-secondary-600", icon: "text-white" },
  accent:    { bg: "bg-accent-400",    light: "bg-accent-50",    text: "text-accent-500",    icon: "text-white" },
  gray:      { bg: "bg-gray-500",      light: "bg-gray-50",      text: "text-gray-600",      icon: "text-white" },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
        <Icon size={18} className={cn(c.icon, "sm:hidden")} />
        <Icon size={22} className={cn(c.icon, "hidden sm:block")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 hidden sm:block truncate">{subtitle}</p>}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", trend.value >= 0 ? "text-secondary-600" : "text-red-500")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
