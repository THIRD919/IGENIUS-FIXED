import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_CONFIG = {
  PENDING: {
    label: "รออนุมัติ",
    color: "#F59E0B",
    bg: "#FEF3C7",
    text: "#92400E",
    tw: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    color: "#10B981",
    bg: "#D1FAE5",
    text: "#065F46",
    tw: "bg-green-100 text-green-800 border-green-300",
  },
  REJECTED: {
    label: "ปฏิเสธ",
    color: "#EF4444",
    bg: "#FEE2E2",
    text: "#991B1B",
    tw: "bg-red-100 text-red-800 border-red-300",
  },
  CANCELLED: {
    label: "ยกเลิก",
    color: "#6B7280",
    bg: "#F3F4F6",
    text: "#374151",
    tw: "bg-gray-100 text-gray-700 border-gray-300",
  },
  ACTIVE: {
    label: "กำลังใช้งาน",
    color: "#3B82F6",
    bg: "#DBEAFE",
    text: "#1E3A8A",
    tw: "bg-blue-100 text-blue-800 border-blue-300",
  },
} as const;

export const COURSES = [
  "English Conversation A1",
  "English Conversation A2",
  "English Conversation B1",
  "English Conversation B2",
  "IELTS Preparation",
  "TOEIC Preparation",
  "Kids English Level 1",
  "Kids English Level 2",
  "Business English",
  "Academic Writing",
  "Phonics Beginner",
  "Grammar Intensive",
];

export const LEVELS = [
  "ระดับเริ่มต้น (A1)",
  "ระดับพื้นฐาน (A2)",
  "ระดับกลาง (B1)",
  "ระดับกลาง-สูง (B2)",
  "ระดับสูง (C1)",
  "เด็ก 5-7 ปี",
  "เด็ก 8-12 ปี",
];

export const EQUIPMENT_LIST = [
  "โปรเจกเตอร์",
  "กระดานอัจฉริยะ",
  "ลำโพง",
  "ไมโครโฟน",
  "คอมพิวเตอร์",
  "ทีวี 65 นิ้ว",
  "ชุดหูฟัง",
];

export function formatDateThai(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateToString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function checkTimeConflict(
  existingBookings: Array<{
    id: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }>,
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): boolean {
  return existingBookings.some(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== "CANCELLED" &&
      b.status !== "REJECTED" &&
      b.id !== excludeId &&
      !(endTime <= b.startTime || startTime >= b.endTime)
  );
}
