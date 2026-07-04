"use client";
import { useState, useEffect } from "react";
import { ChevronRight, Calendar } from "lucide-react";
import StatusBadge from "@/components/ui/Badge";
import BookingDetailModal from "@/components/booking/BookingDetailModal";
import Modal from "@/components/ui/Modal";
import BookingForm from "@/components/booking/BookingForm";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/components/ui/Toast";
import { BookingWithDetails, RoomWithBookings } from "@/types";
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

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<BookingWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rooms, setRooms] = useState<RoomWithBookings[]>([]);

  const { bookings, loading, approveBooking, rejectBooking, cancelBooking, createBooking } =
    useBookings({ myOnly: true });

  useEffect(() => {
    fetch("/api/rooms").then(r => r.json()).then(setRooms).catch(() => {});
  }, []);

  const filtered = bookings.filter((b) => filter === "ALL" || b.status === filter);
  const user = session?.user as any;

  const handleApprove = async (id: string) => {
    const err = await approveBooking(id);
    if (err) addToast(err, "error"); else addToast("อนุมัติแล้ว ✓", "success");
    return null;
  };
  const handleReject = async (id: string, reason: string) => {
    const err = await rejectBooking(id, reason);
    if (err) addToast(err, "error"); else addToast("ปฏิเสธแล้ว", "error");
    return null;
  };
  const handleCancel = async (id: string) => {
    const err = await cancelBooking(id);
    if (err) addToast(err, "error"); else addToast("ยกเลิกแล้ว", "info");
    return null;
  };
  const handleCreate = async (data: any) => {
    const err = await createBooking(data);
    if (err) { addToast(err, "error"); return; }
    addToast("ส่งคำขอจองสำเร็จ ✓", "success");
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">📋 การจองของฉัน</h1>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all">
          ➕ จองห้องใหม่
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => {
          const count = f.value === "ALL" ? bookings.length : bookings.filter((b) => b.status === f.value).length;
          return (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.value ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}>
              {f.label} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">ไม่มีการจอง</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b) => (
            <div key={b.id} onClick={() => setSelected(b)}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:border-purple-200 hover:shadow-sm transition-all"
              style={{ borderLeft: `4px solid ${b.room.color}` }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-gray-900">{b.room.name}</span>
                  <StatusBadge status={b.status} size="sm" />
                </div>
                <p className="text-xs font-semibold text-gray-700 truncate">{b.course}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatDateShort(b.date)} · {b.startTime}–{b.endTime} · {b.students} คน
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      <BookingDetailModal booking={selected} open={!!selected} onClose={() => setSelected(null)}
        onApprove={handleApprove} onReject={handleReject} onCancel={handleCancel}
        currentUserRole={user?.role ?? "USER"} currentUserId={user?.id ?? ""} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="📝 จองห้องเรียน" width={560}>
        <BookingForm rooms={rooms} onSubmit={handleCreate} currentUserName={user?.name} />
      </Modal>
    </div>
  );
}
