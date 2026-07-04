"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Search, BookOpen,
  Settings, BarChart3, Users, LogOut, BookMarked,
} from "lucide-react";

interface SidebarProps {
  user: { name: string; role: string; avatar?: string };
  pendingCount: number;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard, roles: ["USER", "EMPLOYEE", "ADMIN"] },
  { href: "/calendar", label: "ปฏิทิน", icon: Calendar, roles: ["USER", "EMPLOYEE", "ADMIN"] },
  { href: "/search", label: "ค้นหาห้องว่าง", icon: Search, roles: ["USER", "EMPLOYEE", "ADMIN"] },
  { href: "/bookings", label: "การจองของฉัน", icon: BookOpen, roles: ["USER", "EMPLOYEE", "ADMIN"] },
  { href: "/manage", label: "จัดการการจอง", icon: BookMarked, roles: ["EMPLOYEE", "ADMIN"], badge: true },
  { href: "/reports", label: "รายงาน", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/users", label: "จัดการผู้ใช้", icon: Users, roles: ["ADMIN"] },
  { href: "/settings", label: "ตั้งค่าระบบ", icon: Settings, roles: ["ADMIN"] },
];

const ROLE_LABELS: Record<string, string> = {
  USER: "ครู/ผู้สอน",
  EMPLOYEE: "เจ้าหน้าที่",
  ADMIN: "ผู้ดูแลระบบ",
};

export default function Sidebar({ user, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center text-white text-lg">
            {/* 🏫 */}
            <img src="../img/igenius-ps.png" alt="" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-gray-900 leading-tight">iGenius</p>
            <p className="text-[10px] text-gray-400 leading-tight">Classroom Booking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 text-sm font-semibold transition-all relative",
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="absolute right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-2 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
            {user.avatar || user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-400">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="ออกจากระบบ"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
