import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/available?date=YYYY-MM-DD&startTime=HH:MM&endTime=HH:MM&minCapacity=N
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const minCapacity = parseInt(searchParams.get("minCapacity") ?? "1");
  const type = searchParams.get("type");

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "ต้องระบุ date, startTime, endTime" }, { status: 400 });
  }

  // Get all active rooms
  const allRooms = await prisma.room.findMany({
    where: {
      isActive: true,
      capacity: { gte: minCapacity },
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { name: "asc" },
  });

  // Get conflicting bookings for that date/time
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      date: new Date(date),
      status: { notIn: ["CANCELLED", "REJECTED"] },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
      ],
    },
    select: { roomId: true },
  });

  const occupiedRoomIds = new Set(conflictingBookings.map((b) => b.roomId));

  const availableRooms = allRooms.filter((r) => !occupiedRoomIds.has(r.id));

  return NextResponse.json(availableRooms);
}
