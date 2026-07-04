"use client";
import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingDetailModal from "@/components/booking/BookingDetailModal";
import Modal from "@/components/ui/Modal";
import BookingForm from "@/components/booking/BookingForm";
import StatusBadge from "@/components/ui/Badge";
import { useBookings } from "@/hooks/useBookings";
import { BookingWithDetails } from "@/types";
import { formatDateThai } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  APPROVED: "#10B981",
  REJECTED: "#EF4444",
  CANCELLED: "#9CA3AF",
  ACTIVE: "#3B82F6",
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { bookings, loading, approveBooking, rejectBooking, cancelBooking, createBooking } =
    useBookings();

  const [selected, setSelected] = useState<BookingWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState<string>("");
  const [dayModal, setDayModal] = useState<{ date: string; bookings: BookingWithDetails[] } | null>(null);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json()).then(setAllRooms).catch(() => {});
  }, []);

  const calendarEvents = bookings
    .filter((b) => b.status !== "CANCELLED" && b.status !== "REJECTED")
    .map((b) => ({
      id: b.id,
      title: `${b.startTime} ${b.room.name} - ${b.course.slice(0, 12)}`,
      date: b.date,
      start: `${b.date}T${b.startTime}`,
      end: `${b.date}T${b.endTime}`,
      backgroundColor: STATUS_COLORS[b.status] ?? "#7C3AED",
      borderColor: b.room.color,
      textColor: "#fff",
      extendedProps: { booking: b },
    }));

  const handleDateClick = (info: any) => {
    const dateStr = info.dateStr;
    const dayBks = bookings.filter((b) => b.date === dateStr);
    if (dayBks.length > 0) {
      setDayModal({ date: dateStr, bookings: dayBks });
    } else {
      setFormDate(dateStr);
      setShowForm(true);
    }
  };

  const handleEventClick = (info: any) => {
    setSelected(info.event.extendedProps.booking);
  };

  const handleCreate = async (data: any) => {
    await createBooking(data);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">📅 ปฏิทินการจอง</h1>
        <div className="flex gap-2 flex-wrap text-xs">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1.5 font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              {status === "PENDING" ? "รออนุมัติ"
                : status === "APPROVED" ? "อนุมัติแล้ว"
                : status === "ACTIVE" ? "กำลังใช้งาน"
                : status}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-gray-400">กำลังโหลด...</div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="th"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{ today: "วันนี้", month: "เดือน", week: "สัปดาห์", day: "วัน" }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkText={(n) => `+${n} เพิ่มเติม`}
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          />
        )}
      </div>

      {/* Booking detail modal */}
      <BookingDetailModal
        booking={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onApprove={approveBooking}
        onReject={rejectBooking}
        onCancel={cancelBooking}
        currentUserRole={user?.role ?? "USER"}
        currentUserId={user?.id ?? ""}
      />

      {/* Day detail modal */}
      <Modal
        open={!!dayModal}
        onClose={() => setDayModal(null)}
        title={`การจองวันที่ ${dayModal ? formatDateThai(dayModal.date) : ""}`}
        width={480}
      >
        {dayModal && (
          <div className="space-y-2.5">
            {dayModal.bookings
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => { setDayModal(null); setSelected(b); }}
                  className="p-3.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                  style={{ borderLeft: `4px solid ${b.room.color}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      {b.startTime}–{b.endTime} · {b.room.name}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500">{b.course} · {b.user.name} · {b.students} คน</p>
                </div>
              ))}
            <button
              onClick={() => { setDayModal(null); setFormDate(dayModal.date); setShowForm(true); }}
              className="w-full py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
            >
              ➕ จองห้องในวันนี้
            </button>
          </div>
        )}
      </Modal>

      {/* New booking form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="📝 จองห้องเรียน" width={560}>
        <BookingForm
          rooms={allRooms}
          onSubmit={handleCreate}
          defaultValues={{ date: formDate }}
          currentUserName={user?.name}
        />
      </Modal>
    </div>
  );
}
