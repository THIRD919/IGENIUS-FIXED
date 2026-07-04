"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Search, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/calendar", label: "ปฏิทิน", icon: Calendar },
  { href: "/search", label: "ค้นหา", icon: Search },
  { href: "/bookings", label: "การจอง", icon: BookOpen },
  { href: "/manage", label: "จัดการ", icon: Settings },
];

interface BottomNavProps {
  pendingCount?: number;
}

export default function BottomNav({ pendingCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 px-3 py-1">
              <Icon
                size={22}
                className={cn(isActive ? "text-purple-600" : "text-gray-400")}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "text-purple-600" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
              {item.label === "จัดการ" && pendingCount > 0 && (
                <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
