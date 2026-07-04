"use client";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import StatusBadge from "@/components/ui/Badge";
import BookingDetailModal from "@/components/booking/BookingDetailModal";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/components/ui/Toast";
import { BookingWithDetails } from "@/types";
import { formatDateShort } from "@/lib/utils";
import { useSession } from "next-auth/react";

const FILTERS = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "PENDING", label: "รออนุมัติ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "ACTIVE", label: "กำลังใช้งาน" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

export default function ManagePage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [filter, setFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BookingWithDetails | null>(null);

  const { bookings, loading, approveBooking, rejectBooking, cancelBooking } = useBookings();

  const filtered = bookings
    .filter((b) => filter === "ALL" || b.status === filter)
    .filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.course.toLowerCase().includes(q) || b.user.name.toLowerCase().includes(q) || b.room.name.toLowerCase().includes(q);
    });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const user = session?.user as any;

  const handleApprove = async (id: string) => {
    const err = await approveBooking(id);
    if (err) addToast(err, "error"); else addToast("อนุมัติการจองแล้ว ✓", "success");
    return null;
  };
  const handleReject = async (id: string, reason: string) => {
    const err = await rejectBooking(id, reason);
    if (err) addToast(err, "error"); else addToast("ปฏิเสธการจองแล้ว", "error");
    return null;
  };
  const handleCancel = async (id: string) => {
    const err = await cancelBooking(id);
    if (err) addToast(err, "error"); else addToast("ยกเลิกการจองแล้ว", "info");
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">⚙️ จัดการการจอง</h1>
          {pendingCount > 0 && <p className="text-xs text-amber-600 font-semibold mt-0.5">⏳ มี {pendingCount} รายการรออนุมัติ</p>}
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาวิชา ครู ห้อง..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => {
          const count = f.value === "ALL" ? bookings.length : bookings.filter((b) => b.status === f.value).length;
          return (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.value ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}>
              {f.label}
              {f.value === "PENDING" && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
              {f.value !== "PENDING" && count > 0 && <span className="ml-1 opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">ไม่พบรายการ</p>
          ) : (
            filtered.map((b, i) => (
              <div key={b.id} onClick={() => setSelected(b)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F9FAFB" : "none", borderLeft: `4px solid ${b.room.color}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-gray-900">{b.room.name}</span>
                    <span className="text-xs text-gray-400">{formatDateShort(b.date)} {b.startTime}–{b.endTime}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{b.course} · {b.user.name} · {b.students} คน</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">แสดง {filtered.length} รายการ</p>

      <BookingDetailModal booking={selected} open={!!selected} onClose={() => setSelected(null)}
        onApprove={handleApprove} onReject={handleReject} onCancel={handleCancel}
        currentUserRole={user?.role ?? "EMPLOYEE"} currentUserId={user?.id ?? ""} />
    </div>
  );
}
