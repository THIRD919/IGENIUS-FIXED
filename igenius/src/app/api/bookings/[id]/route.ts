import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bookingSelectFields = {
  id: true, date: true, startTime: true, endTime: true,
  course: true, level: true, students: true, equipment: true,
  note: true, status: true, rejectedReason: true,
  userId: true, roomId: true, approvedById: true, approvedAt: true,
  createdAt: true, updatedAt: true,
  user: { select: { id: true, name: true, email: true, avatar: true } },
  room: { select: { id: true, name: true, building: true, capacity: true, color: true, type: true } },
  approvedBy: { select: { id: true, name: true } },
};

// PATCH /api/bookings/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, reason } = await req.json();
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

  let update: any = {};

  switch (action) {
    case "APPROVE":
      if (userRole !== "EMPLOYEE" && userRole !== "ADMIN") {
        return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
      }
      if (booking.status !== "PENDING") {
        return NextResponse.json({ error: "สถานะการจองไม่ถูกต้อง" }, { status: 400 });
      }
      update = { status: "APPROVED", approvedById: userId, approvedAt: new Date() };
      break;

    case "REJECT":
      if (userRole !== "EMPLOYEE" && userRole !== "ADMIN") {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ปฏิเสธ" }, { status: 403 });
      }
      if (booking.status !== "PENDING") {
        return NextResponse.json({ error: "สถานะการจองไม่ถูกต้อง" }, { status: 400 });
      }
      update = { status: "REJECTED", rejectedReason: reason || "ไม่ระบุเหตุผล" };
      break;

    case "CANCEL":
      if (booking.userId !== userId && userRole !== "ADMIN") {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ยกเลิก" }, { status: 403 });
      }
      if (!["PENDING", "APPROVED"].includes(booking.status)) {
        return NextResponse.json({ error: "ไม่สามารถยกเลิกได้" }, { status: 400 });
      }
      update = { status: "CANCELLED" };
      break;

    case "SET_ACTIVE":
      if (userRole !== "EMPLOYEE" && userRole !== "ADMIN") {
        return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
      }
      update = { status: "ACTIVE" };
      break;

    default:
      return NextResponse.json({ error: "Action ไม่ถูกต้อง" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: update,
    select: bookingSelectFields,
  });

  return NextResponse.json({
    ...updated,
    date: updated.date.toISOString().split("T")[0],
    approvedAt: updated.approvedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

// DELETE /api/bookings/[id] - Admin only hard delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
