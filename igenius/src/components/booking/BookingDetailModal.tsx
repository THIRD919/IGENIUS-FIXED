"use client";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/Badge";
import { BookingWithDetails } from "@/types";
import { formatDateThai, todayString } from "@/lib/utils";

interface BookingDetailModalProps {
  booking: BookingWithDetails | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string) => Promise<string | null>;
  onReject?: (id: string, reason: string) => Promise<string | null>;
  onCancel?: (id: string) => Promise<string | null>;
  currentUserRole: string;
  currentUserId: string;
}

export default function BookingDetailModal({
  booking,
  open,
  onClose,
  onApprove,
  onReject,
  onCancel,
  currentUserRole,
  currentUserId,
}: BookingDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  if (!booking) return null;

  const canApprove =
    (currentUserRole === "EMPLOYEE" || currentUserRole === "ADMIN") &&
    booking.status === "PENDING";
  const canCancel =
    booking.userId === currentUserId &&
    booking.status === "PENDING" &&
    booking.date >= todayString();

  const handleApprove = async () => {
    if (!onApprove) return;
    setLoading("approve");
    await onApprove(booking.id);
    setLoading(null);
    onClose();
  };

  const handleReject = async () => {
    if (!onReject) return;
    setLoading("reject");
    await onReject(booking.id, rejectReason || "ไม่ระบุเหตุผล");
    setLoading(null);
    setShowRejectForm(false);
    setRejectReason("");
    onClose();
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setLoading("cancel");
    await onCancel(booking.id);
    setLoading(null);
    onClose();
  };

  const fields = [
    ["📅 วันที่", formatDateThai(booking.date)],
    ["⏰ เวลา", `${booking.startTime} – ${booking.endTime}`],
    ["🏫 ห้องเรียน", `${booking.room.name} (${booking.room.building})`],
    ["📚 วิชา", booking.course],
    ["📊 ระดับ", booking.level],
    ["👨‍🎓 นักเรียน", `${booking.students} คน`],
    ["👤 ผู้จอง", booking.user.name],
  ] as const;

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); setShowRejectForm(false); setRejectReason(""); }}
      title={`รายละเอียดการจอง #${booking.id.slice(-6).toUpperCase()}`}
      width={500}
    >
      {/* Room header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: booking.room.color + "20" }}
        >
          🏫
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{booking.room.name}</h3>
          <p className="text-xs text-gray-500">{booking.room.building} · ความจุ {booking.room.capacity} คน</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {fields.map(([label, value]) => (
          <div key={label} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Equipment */}
      {booking.equipment && booking.equipment.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">🔌 อุปกรณ์ที่ขอใช้</p>
          <div className="flex flex-wrap gap-1.5">
            {(typeof booking.equipment === "string"
              ? booking.equipment.split(",")
              : booking.equipment
            ).map((eq) => (
              <span
                key={eq}
                className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              >
                {eq.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {booking.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3.5 py-2.5 mb-4 text-xs text-yellow-800">
          📝 {booking.note}
        </div>
      )}

      {/* Approval info */}
      {booking.approvedBy && (
        <p className="text-xs text-green-700 mb-3 font-medium">
          ✓ อนุมัติโดย: {booking.approvedBy.name}
        </p>
      )}
      {booking.rejectedReason && (
        <p className="text-xs text-red-600 mb-3 font-medium">
          ✗ เหตุผลที่ปฏิเสธ: {booking.rejectedReason}
        </p>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            เหตุผลที่ปฏิเสธ
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุเหตุผล..."
            rows={2}
            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {canApprove && !showRejectForm && (
          <>
            <button
              onClick={handleApprove}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {loading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              อนุมัติ
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
            >
              <X size={14} /> ปฏิเสธ
            </button>
          </>
        )}
        {showRejectForm && (
          <>
            <button
              onClick={handleReject}
              disabled={!!loading}
              className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {loading === "reject" ? "กำลังดำเนินการ..." : "ยืนยันปฏิเสธ"}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
          </>
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={!!loading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            {loading === "cancel" ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
          </button>
        )}
      </div>
    </Modal>
  );
}
