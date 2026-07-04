import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-1 ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        <div className="rounded-xl p-2.5" style={{ background: iconBg }}>
          <Icon size={22} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
