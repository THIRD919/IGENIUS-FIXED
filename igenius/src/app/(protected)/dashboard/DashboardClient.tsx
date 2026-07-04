"use client";
import { useState } from "react";
import { BookMarked, DoorOpen, Clock, AlertCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/Badge";
import BookingDetailModal from "@/components/booking/BookingDetailModal";
import Modal from "@/components/ui/Modal";
import BookingForm from "@/components/booking/BookingForm";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/components/ui/Toast";
import { BookingWithDetails, RoomWithBookings } from "@/types";
import { formatDateThai, todayString } from "@/lib/utils";

interface Props {
  rooms: RoomWithBookings[];
  todayBookings: BookingWithDetails[];
  pendingCount: number;
  upcomingBookings: BookingWithDetails[];
  currentUser: { id: string; name: string; role: string; avatar?: string };
}

export default function DashboardClient({ rooms, todayBookings, pendingCount, upcomingBookings, currentUser }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();
  const { approveBooking, rejectBooking, cancelBooking, createBooking } = useBookings();

  const today = todayString();
  const occupiedRoomIds = new Set(
    todayBookings.filter((b) => b.status === "ACTIVE" || b.status === "APPROVED").map((b) => b.roomId)
  );

  const stats = [
    { label: "ห้องเรียนทั้งหมด", value: rooms.length, icon: DoorOpen, iconBg: "#EDE9FE", iconColor: "#7C3AED" },
    { label: "ห้องว่างวันนี้", value: rooms.length - occupiedRoomIds.size, icon: BookMarked, iconBg: "#D1FAE5", iconColor: "#059669" },
    { label: "ถูกจองวันนี้", value: occupiedRoomIds.size, icon: Clock, iconBg: "#DBEAFE", iconColor: "#2563EB" },
    { label: "รออนุมัติ", value: pendingCount, icon: AlertCircle, iconBg: "#FEF3C7", iconColor: "#D97706" },
  ];

  const handleApprove = async (id: string) => {
    const err = await approveBooking(id);
    if (err) addToast(err, "error");
    else addToast("อนุมัติการจองแล้ว ✓", "success");
    return null;
  };
  const handleReject = async (id: string, reason: string) => {
    const err = await rejectBooking(id, reason);
    if (err) addToast(err, "error");
    else addToast("ปฏิเสธการจองแล้ว", "error");
    return null;
  };
  const handleCancel = async (id: string) => {
    const err = await cancelBooking(id);
    if (err) addToast(err, "error");
    else addToast("ยกเลิกการจองแล้ว", "info");
    return null;
  };
  const handleCreate = async (data: any) => {
    const err = await createBooking(data);
    if (err) { addToast(err, "error"); return; }
    addToast("ส่งคำขอจองสำเร็จ รอการอนุมัติ ✓", "success");
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">สวัสดี, {currentUser.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">วันนี้ {formatDateThai(today)}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all">
          ➕ จองห้องใหม่
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">📅 ตารางวันนี้</h3>
          {todayBookings.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">ไม่มีการจองวันนี้</p>
          ) : (
            <div className="space-y-2">
              {todayBookings.slice(0, 6).map((b) => (
                <div key={b.id} onClick={() => setSelectedBooking(b)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                  style={{ borderLeft: `3px solid ${b.room.color}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{b.startTime}–{b.endTime} · {b.room.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{b.course}</p>
                  </div>
                  <StatusBadge status={b.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">🏫 สถานะห้องเรียน</h3>
          <div className="space-y-2.5">
            {rooms.map((room) => {
              const isOccupied = occupiedRoomIds.has(room.id);
              const cnt = todayBookings.filter((b) => b.roomId === room.id && b.status !== "CANCELLED" && b.status !== "REJECTED").length;
              return (
                <div key={room.id} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: room.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900">{room.name}</p>
                    <p className="text-[10px] text-gray-400">{room.building} · {room.capacity} คน · จองวันนี้ {cnt} ครั้ง</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOccupied ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-700"}`}>
                    {isOccupied ? "ใช้งาน" : "ว่าง"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {upcomingBookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">🔔 กิจกรรมที่กำลังจะมาถึง (7 วัน)</h3>
          <div className="space-y-2">
            {upcomingBookings.map((b) => {
              const d = new Date(b.date + "T00:00:00");
              return (
                <div key={b.id} onClick={() => setSelectedBooking(b)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                  style={{ borderLeft: `3px solid ${b.room.color}` }}>
                  <div className="text-center min-w-[40px] bg-purple-100 rounded-lg py-1.5 px-1">
                    <p className="text-[9px] font-bold text-purple-600">{d.toLocaleDateString("th-TH", { weekday: "short" })}</p>
                    <p className="text-base font-extrabold text-purple-800 leading-tight">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{b.course}</p>
                    <p className="text-[10px] text-gray-500">{b.room.name} · {b.startTime}–{b.endTime}</p>
                  </div>
                  <StatusBadge status={b.status} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BookingDetailModal booking={selectedBooking} open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onApprove={handleApprove} onReject={handleReject} onCancel={handleCancel}
        currentUserRole={currentUser.role} currentUserId={currentUser.id} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="📝 จองห้องเรียน" width={560}>
        <BookingForm rooms={rooms} onSubmit={handleCreate} currentUserName={currentUser.name} />
      </Modal>
    </div>
  );
}
