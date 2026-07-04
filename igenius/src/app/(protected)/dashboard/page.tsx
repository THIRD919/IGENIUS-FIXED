import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const bookingSelect = {
    id: true, date: true, startTime: true, endTime: true,
    course: true, level: true, students: true, equipment: true,
    note: true, status: true, rejectedReason: true,
    userId: true, roomId: true, approvedById: true, approvedAt: true,
    createdAt: true, updatedAt: true,
    user: { select: { id: true, name: true, email: true, avatar: true } },
    room: { select: { id: true, name: true, building: true, capacity: true, color: true, type: true } },
    approvedBy: { select: { id: true, name: true } },
  };

  const [rooms, todayBookings, pendingCount, upcomingBookings] = await Promise.all([
    prisma.room.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.booking.findMany({ where: { date: { gte: today, lte: todayEnd } }, select: bookingSelect, orderBy: { startTime: "asc" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      where: { date: { gte: today, lte: nextWeek }, status: { in: ["APPROVED", "PENDING"] } },
      select: bookingSelect,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 10,
    }),
  ]);

  const serialize = (b: any) => ({
    ...b,
    date: b.date.toISOString().split("T")[0],
    approvedAt: b.approvedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    approvedBy: b.approvedBy ?? null,
    rejectedReason: b.rejectedReason ?? null,
    equipment: b.equipment ?? null,
    note: b.note ?? null,
    approvedById: b.approvedById ?? null,
  });

  return (
    <DashboardClient
      rooms={rooms as any}
      todayBookings={todayBookings.map(serialize)}
      pendingCount={pendingCount}
      upcomingBookings={upcomingBookings.map(serialize)}
      currentUser={session.user as any}
    />
  );
}
