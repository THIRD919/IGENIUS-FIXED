import { PrismaClient, Role, RoomType, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COURSES = [
  "English Conversation A1","English Conversation A2","English Conversation B1","English Conversation B2",
  "IELTS Preparation","TOEIC Preparation","Kids English Level 1","Kids English Level 2",
  "Business English","Academic Writing","Phonics Beginner","Grammar Intensive",
];
const LEVELS = ["ระดับเริ่มต้น (A1)","ระดับพื้นฐาน (A2)","ระดับกลาง (B1)","ระดับกลาง-สูง (B2)","เด็ก 5-7 ปี","เด็ก 8-12 ปี"];
const TIME_SLOTS = [
  ["08:00","09:30"],["09:30","11:00"],["10:00","11:30"],["11:00","12:30"],
  ["13:00","14:30"],["14:30","16:00"],["16:00","17:30"],["17:00","18:30"],["18:00","19:30"],
];

async function main() {
  console.log("🌱 Seeding database...");
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const users = await Promise.all([
    prisma.user.create({ data: { name: "ครูนภาพร จันทร์ดี", email: "naphaporn@igenius.ac.th", password: await bcrypt.hash("1234", 10), role: Role.USER, avatar: "น" } }),
    prisma.user.create({ data: { name: "ครูวิชัย สุขใจ", email: "wichai@igenius.ac.th", password: await bcrypt.hash("1234", 10), role: Role.USER, avatar: "ว" } }),
    prisma.user.create({ data: { name: "Mr. James Wilson", email: "james@igenius.ac.th", password: await bcrypt.hash("1234", 10), role: Role.USER, avatar: "J" } }),
    prisma.user.create({ data: { name: "Ms. Sarah Johnson", email: "sarah@igenius.ac.th", password: await bcrypt.hash("1234", 10), role: Role.USER, avatar: "S" } }),
    prisma.user.create({ data: { name: "คุณสมศรี ใจดี", email: "somsri@igenius.ac.th", password: await bcrypt.hash("1234", 10), role: Role.EMPLOYEE, avatar: "ส" } }),
    prisma.user.create({ data: { name: "Admin ระบบ", email: "admin@igenius.ac.th", password: await bcrypt.hash("admin", 10), role: Role.ADMIN, avatar: "A" } }),
  ]);

  // Rooms
  const rooms = await Promise.all([
    prisma.room.create({ data: { name: "A101", building: "อาคาร A", floor: 1, capacity: 20, type: RoomType.CLASSROOM, color: "#7C3AED", facilities: "โปรเจกเตอร์,กระดาน,แอร์" } }),
    prisma.room.create({ data: { name: "A102", building: "อาคาร A", floor: 1, capacity: 25, type: RoomType.CLASSROOM, color: "#2563EB", facilities: "โปรเจกเตอร์,กระดานอัจฉริยะ,แอร์" } }),
    prisma.room.create({ data: { name: "B201", building: "อาคาร B", floor: 2, capacity: 30, type: RoomType.LARGE_CLASSROOM, color: "#059669", facilities: "โปรเจกเตอร์,ลำโพง,แอร์" } }),
    prisma.room.create({ data: { name: "Lab 1", building: "อาคาร B", floor: 1, capacity: 15, type: RoomType.LAB, color: "#D97706", facilities: "คอมพิวเตอร์ 15 เครื่อง,หูฟัง,แอร์" } }),
    prisma.room.create({ data: { name: "Meeting", building: "อาคาร C", floor: 1, capacity: 10, type: RoomType.MEETING, color: "#DC2626", facilities: "ทีวี 65 นิ้ว,ไวท์บอร์ด,แอร์" } }),
  ]);

  const employee = users[4];
  const today = new Date();
  let bookingCount = 0;

  // Seed 2 months back + 2 weeks forward
  for (let daysBack = 60; daysBack >= -14; daysBack--) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysBack);
    date.setHours(0,0,0,0);
    const dow = date.getDay();
    if (dow === 0) continue;

    const perDay = dow === 6 ? 2 : Math.floor(Math.random() * 4) + 2;
    const usedSlots = new Set<string>();

    for (let b = 0; b < perDay; b++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const slot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      const key = `${room.id}-${slot[0]}`;
      if (usedSlots.has(key)) continue;
      usedSlots.add(key);

      const isFuture = daysBack < 0;
      const isPast = daysBack > 0;
      let status: BookingStatus;
      if (isFuture) { status = Math.random() < 0.7 ? BookingStatus.APPROVED : BookingStatus.PENDING; }
      else if (isPast) {
        const r = Math.random();
        if (r < 0.65) status = BookingStatus.APPROVED;
        else if (r < 0.75) status = BookingStatus.REJECTED;
        else if (r < 0.85) status = BookingStatus.CANCELLED;
        else status = BookingStatus.PENDING;
      } else { status = Math.random() < 0.5 ? BookingStatus.ACTIVE : BookingStatus.APPROVED; }

      const user = users[Math.floor(Math.random() * 4)];
      const equipment = ["โปรเจกเตอร์","ลำโพง","ไมโครโฟน"].slice(0, Math.floor(Math.random() * 3) + 1).join(",");

      await prisma.booking.create({
        data: {
          date,
          startTime: slot[0],
          endTime: slot[1],
          course: COURSES[Math.floor(Math.random() * COURSES.length)],
          level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
          students: Math.floor(Math.random() * (room.capacity - 3)) + 3,
          equipment,
          note: Math.random() < 0.25 ? "กรุณาเปิดแอร์ไว้ก่อนเรียน 15 นาที" : null,
          status,
          userId: user.id,
          roomId: room.id,
          approvedById: (status === BookingStatus.APPROVED || status === BookingStatus.ACTIVE) ? employee.id : null,
          approvedAt: (status === BookingStatus.APPROVED || status === BookingStatus.ACTIVE) ? new Date() : null,
          rejectedReason: status === BookingStatus.REJECTED ? "ห้องปิดซ่อมบำรุง" : null,
        },
      });
      bookingCount++;
    }
  }

  console.log(`✅ Seeded: ${users.length} users, ${rooms.length} rooms, ${bookingCount} bookings`);
  console.log("\n📋 Login accounts:");
  console.log("  👩‍🏫 ครู:       naphaporn@igenius.ac.th / 1234");
  console.log("  👤 เจ้าหน้าที่: somsri@igenius.ac.th    / 1234");
  console.log("  ⚙️  Admin:      admin@igenius.ac.th      / admin");
}

main().catch(console.error).finally(() => prisma.$disconnect());
