"use client";
import { useState } from "react";
import { Search, CheckCircle, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import BookingForm from "@/components/booking/BookingForm";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";

interface AvailableRoom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  color: string;
  facilities?: string | null;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: "ห้องเรียนทั่วไป",
  LARGE_CLASSROOM: "ห้องเรียนขนาดใหญ่",
  LAB: "ห้องแล็บ",
  MEETING: "ห้องประชุม",
};

export default function SearchPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [minCapacity, setMinCapacity] = useState(1);
  const [results, setResults] = useState<AvailableRoom[] | null>(null);
  const [searching, setSearching] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formInit, setFormInit] = useState<any>({});
  const [allRooms, setAllRooms] = useState<AvailableRoom[]>([]);

  const handleSearch = async () => {
    if (startTime >= endTime) {
      addToast("เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น", "error");
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({ date, startTime, endTime, minCapacity: minCapacity.toString() });
      const res = await fetch(`/api/rooms/available?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data);

      // Also fetch all rooms for the booking form
      const allRes = await fetch("/api/rooms");
      if (allRes.ok) setAllRooms(await allRes.json());
    } catch {
      addToast("ไม่สามารถค้นหาได้", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleBookRoom = (roomId: string) => {
    setFormInit({ roomId, date, startTime, endTime });
    setShowForm(true);
  };

  const handleSubmitBooking = async (data: any) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      addToast(err.error || "เกิดข้อผิดพลาด", "error");
      return;
    }
    addToast("ส่งคำขอจองสำเร็จ ✓", "success");
    setShowForm(false);
    setResults(null);
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 mb-5">🔍 ค้นหาห้องว่าง</h1>

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className={labelClass}>📅 วันที่</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>⏰ เวลาเริ่ม</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>⏰ เวลาสิ้นสุด</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>👨‍🎓 ความจุขั้นต่ำ (คน)</label>
            <input
              type="number"
              min={1}
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60"
        >
          <Search size={15} />
          {searching ? "กำลังค้นหา..." : "ค้นหาห้องว่าง"}
        </button>
      </div>

      {/* Results */}
      {results !== null && (
        <div>
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
              <p className="text-red-500 font-semibold text-sm">😔 ไม่มีห้องว่างในช่วงเวลาที่เลือก</p>
              <p className="text-xs text-gray-400 mt-1">ลองเลือกเวลาอื่นหรือวันอื่นดูครับ</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm font-bold text-green-700">พบ {results.length} ห้องว่าง</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all"
                  >
                    <div className="h-1.5" style={{ background: room.color }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
                          <p className="text-xs text-gray-500">{room.building} · ชั้น {room.floor}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ว่าง
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {room.capacity} คน
                        </span>
                        <span>{ROOM_TYPE_LABELS[room.type] ?? room.type}</span>
                      </div>
                      {room.facilities && (
                        <p className="text-[10px] text-gray-400 mb-3 truncate">
                          🔌 {room.facilities}
                        </p>
                      )}
                      <button
                        onClick={() => handleBookRoom(room.id)}
                        className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        จองห้องนี้ →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="📝 จองห้องเรียน" width={560}>
        <BookingForm
          rooms={allRooms as any}
          onSubmit={handleSubmitBooking}
          defaultValues={formInit}
          currentUserName={(session?.user as any)?.name}
        />
      </Modal>
    </div>
  );
}
