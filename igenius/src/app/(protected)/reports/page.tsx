"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { BookingWithDetails } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";

const ROOM_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626"];
const STATUS_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6B7280", "#3B82F6"];

export default function ReportsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const d = new Date(b.date);
    if (period === "week") return d >= new Date(now.getTime() - 7 * 86400000);
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  // ── สถิติรวม ──────────────────────────────────────────────
  const statuses = ["APPROVED", "PENDING", "REJECTED", "CANCELLED", "ACTIVE"] as const;
  const statusCounts = statuses.map((s) => ({
    status: s,
    count: filtered.filter((b) => b.status === s).length,
    config: STATUS_CONFIG[s],
  }));

  // ── Pie chart: สัดส่วนสถานะ ────────────────────────────────
  const pieData = statusCounts
    .filter((s) => s.count > 0)
    .map((s) => ({ name: s.config.label, value: s.count, color: s.config.color }));

  // ── Bar chart: ห้องที่ใช้งานมากสุด ─────────────────────────
  const roomStats: Record<string, { name: string; จำนวนครั้ง: number; color: string }> = {};
  filtered.filter((b) => b.status === "APPROVED" || b.status === "ACTIVE").forEach((b) => {
    if (!roomStats[b.roomId]) {
      roomStats[b.roomId] = { name: b.room.name, จำนวนครั้ง: 0, color: b.room.color };
    }
    roomStats[b.roomId].จำนวนครั้ง += 1;
  });
  const roomBarData = Object.values(roomStats).sort((a, b) => b.จำนวนครั้ง - a.จำนวนครั้ง);

  // ── Line chart: การจองรายวัน (30 วันล่าสุด) ────────────────
  const lineData: Record<string, number> = {};
  const days = period === "week" ? 7 : period === "month" ? 30 : 60;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getDate()}/${d.getMonth() + 1}`;
    lineData[key] = 0;
  }
  filtered.forEach((b) => {
    const d = new Date(b.date + "T00:00:00");
    const key = `${d.getDate()}/${d.getMonth() + 1}`;
    if (key in lineData) lineData[key] += 1;
  });
  const lineChartData = Object.entries(lineData).map(([date, การจอง]) => ({ date, การจอง }));

  // ── Top teachers ────────────────────────────────────────────
  const teacherMap: Record<string, number> = {};
  filtered.filter((b) => b.status === "APPROVED").forEach((b) => {
    teacherMap[b.user.name] = (teacherMap[b.user.name] || 0) + 1;
  });
  const topTeachers = Object.entries(teacherMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.split(" ").slice(0, 2).join(" "), value }));

  // ── Custom Tooltip ──────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2.5 text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color ?? p.fill }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">📊 รายงาน & สถิติ</h1>
        <div className="flex gap-2">
          {(["week", "month", "all"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                period === p ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200"
              }`}>
              {p === "week" ? "7 วัน" : p === "month" ? "เดือนนี้" : "ทั้งหมด"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ กำลังโหลด...</div>
      ) : (
        <div className="space-y-5">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center col-span-3 md:col-span-1">
              <p className="text-3xl font-extrabold text-purple-700">{filtered.length}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-1">คำขอทั้งหมด</p>
            </div>
            {statusCounts.map(({ status, count, config }) => (
              <div key={status} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-extrabold" style={{ color: config.color }}>{count}</p>
                <p className="text-[10px] text-gray-500 font-semibold mt-1">{config.label}</p>
              </div>
            ))}
          </div>

          {/* ── Line chart: แนวโน้มการจอง ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">📈 แนวโน้มการจอง</h3>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    interval={Math.floor(lineChartData.length / 6)} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="การจอง" stroke="#7C3AED" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: "#7C3AED" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูล</p>
            )}
          </div>

          {/* ── Bar + Pie ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Bar chart: ห้องที่ใช้งานมากสุด */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">🏆 ห้องที่ใช้งานมากสุด</h3>
              {roomBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={roomBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="จำนวนครั้ง" radius={[6, 6, 0, 0]}>
                      {roomBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color || ROOM_COLORS[i % ROOM_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูล</p>
              )}
            </div>

            {/* Pie chart: สัดส่วนสถานะ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">🍩 สัดส่วนสถานะการจอง</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(value) => <span style={{ fontSize: 11, color: "#6B7280" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>

          {/* ── Bar chart: ผู้สอนที่ใช้ห้องมากสุด ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">👩‍🏫 ผู้สอนที่ใช้ห้องมากสุด (Top 5)</h3>
            {topTeachers.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topTeachers} layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="จำนวนครั้ง" radius={[0, 6, 6, 0]} fill="#7C3AED">
                    {topTeachers.map((_, i) => (
                      <Cell key={i} fill={ROOM_COLORS[i % ROOM_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูล</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
