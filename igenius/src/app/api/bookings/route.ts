import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookingSelectFields = {
  id: true,
  date: true,
  startTime: true,
  endTime: true,
  course: true,
  level: true,
  students: true,
  equipment: true,
  note: true,
  status: true,
  rejectedReason: true,
  userId: true,
  roomId: true,
  approvedById: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true, avatar: true } },
  room: { select: { id: true, name: true, building: true, capacity: true, color: true, type: true } },
  approvedBy: { select: { id: true, name: true } },
};

// GET /api/bookings
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const status = searchParams.get("status");
  const roomId = searchParams.get("roomId");
  const myOnly = searchParams.get("myOnly") === "true";

  const where: any = {};
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (status && status !== "ALL") where.status = status;
  if (roomId) where.roomId = roomId;
  if (myOnly) where.userId = (session.user as any).id;

  // Non-admin users can only see their own bookings in myOnly mode
  const userRole = (session.user as any).role;
  if (userRole === "USER" && !myOnly) {
    // USER can see all bookings for calendar view
  }

  const bookings = await prisma.booking.findMany({
    where,
    select: bookingSelectFields,
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    take: 500,
  });

  // Serialize dates
  const serialized = bookings.map((b) => ({
    ...b,
    date: b.date.toISOString().split("T")[0],
    approvedAt: b.approvedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return NextResponse.json(serialized);
}

// POST /api/bookings - Create new booking
const createSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  roomId: z.string(),
  course: z.string(),
  level: z.string(),
  students: z.number().min(1),
  equipment: z.array(z.string()),
  note: z.string().optional(),
}).refine((d) => d.startTime < d.endTime, { message: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { date, startTime, endTime, roomId, equipment, ...rest } = parsed.data;

  // Check room exists
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return NextResponse.json({ error: "ไม่พบห้องเรียน" }, { status: 404 });

  // Check student count vs capacity
  if (rest.students > room.capacity) {
    return NextResponse.json({ error: `จำนวนนักเรียนเกินความจุห้อง (${room.capacity} คน)` }, { status: 400 });
  }

  // Check time conflict
  const dateObj = new Date(date);
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      date: dateObj,
      status: { notIn: ["CANCELLED", "REJECTED"] },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: `ห้อง ${room.name} มีการจองซ้อนกันในช่วงเวลาดังกล่าว` }, { status: 409 });
  }

  const userId = (session.user as any).id;

  const booking = await prisma.booking.create({
    data: {
      date: dateObj,
      startTime,
      endTime,
      roomId,
      equipment: equipment.join(","),
      userId,
      ...rest,
    },
    select: bookingSelectFields,
  });

  return NextResponse.json({
    ...booking,
    date: booking.date.toISOString().split("T")[0],
    approvedAt: booking.approvedAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }, { status: 201 });
}
