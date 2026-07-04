# 🏫 iGenius Classroom Booking System

ระบบบริหารจัดการการจองห้องเรียน สำหรับ iGenius Language School เชียงใหม่

---

## 🚀 วิธีติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/igenius_booking"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. สร้าง Database

```bash
# Push schema ไปที่ database
npx prisma db push

# สร้าง Prisma Client
npx prisma generate
```

### 4. Seed ข้อมูลตัวอย่าง (ย้อนหลัง 2 เดือน)

```bash
npm run db:seed
```

### 5. รันระบบ

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## 👤 บัญชีทดสอบ

| บัญชี | อีเมล | รหัสผ่าน | สิทธิ์ |
|-------|-------|-----------|--------|
| ครู | naphaporn@igenius.ac.th | 1234 | User |
| ครูวิชัย | wichai@igenius.ac.th | 1234 | User |
| Mr. James | james@igenius.ac.th | 1234 | User |
| เจ้าหน้าที่ | somsri@igenius.ac.th | 1234 | Employee |
| ผู้ดูแล | admin@igenius.ac.th | admin | Admin |

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  - NextAuth handler
│   │   ├── bookings/            - CRUD bookings + approve/reject
│   │   ├── rooms/               - Room list + available search
│   │   ├── users/               - User management
│   │   └── notifications/       - Notification system
│   ├── dashboard/               - หน้าหลัก (Server Component)
│   ├── calendar/                - ปฏิทิน (FullCalendar)
│   ├── search/                  - ค้นหาห้องว่าง
│   ├── bookings/                - การจองของฉัน
│   ├── manage/                  - จัดการการจอง (Employee/Admin)
│   ├── reports/                 - รายงานสถิติ (Admin)
│   ├── users/                   - จัดการผู้ใช้ (Admin)
│   ├── settings/                - ตั้งค่าระบบ (Admin)
│   └── login/                   - หน้าเข้าสู่ระบบ
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          - Sidebar สำหรับ Desktop
│   │   ├── TopBar.tsx           - Top bar
│   │   └── BottomNav.tsx        - Bottom nav สำหรับ Mobile
│   ├── booking/
│   │   ├── BookingForm.tsx      - ฟอร์มจองห้อง (React Hook Form + Zod)
│   │   └── BookingDetailModal.tsx - Modal รายละเอียด + approve/reject
│   ├── dashboard/
│   │   └── StatCard.tsx         - Card สถิติ
│   └── ui/
│       ├── Badge.tsx            - Status badge
│       ├── Modal.tsx            - Reusable modal
│       └── Toast.tsx            - Toast notification (Context)
├── hooks/
│   └── useBookings.ts           - Custom hook สำหรับ CRUD bookings
├── lib/
│   ├── prisma.ts                - Prisma Client singleton
│   ├── auth.ts                  - NextAuth configuration
│   └── utils.ts                 - Utilities, constants
└── types/
    └── index.ts                 - TypeScript type definitions
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Calendar | FullCalendar |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js v4 (Credentials) |
| ORM | Prisma 5 |
| Database | MySQL |
| Deploy | Vercel (Frontend) + VPS/Cloud (MySQL) |

---

## 🔒 สิทธิ์การใช้งาน

| Feature | User | Employee | Admin |
|---------|------|----------|-------|
| ดู Calendar | ✅ | ✅ | ✅ |
| ค้นหาห้องว่าง | ✅ | ✅ | ✅ |
| จองห้องเรียน | ✅ | ✅ | ✅ |
| ดูการจองตัวเอง | ✅ | ✅ | ✅ |
| ยกเลิกการจองตัวเอง | ✅ | ✅ | ✅ |
| อนุมัติ/ปฏิเสธการจอง | ❌ | ✅ | ✅ |
| ดูการจองทั้งหมด | ❌ | ✅ | ✅ |
| ดูรายงาน | ❌ | ❌ | ✅ |
| จัดการผู้ใช้งาน | ❌ | ❌ | ✅ |
| ตั้งค่าระบบ | ❌ | ❌ | ✅ |

---

## 🐛 Bug Fixes ที่แก้ไวแล้ว

- ✅ Conflict detection ถูกต้อง (ตรวจสอบ overlap ทั้ง 3 กรณี)
- ✅ Capacity validation ก่อน submit
- ✅ Prisma singleton ป้องกัน too many connections
- ✅ Session callback ส่ง role และ id ถูกต้อง
- ✅ Date serialization (Date object → YYYY-MM-DD string)
- ✅ Modal ปิดได้ทั้ง backdrop click และปุ่ม ✕
- ✅ Form reset หลัง submit สำเร็จ
- ✅ Zod refine สำหรับ time validation
- ✅ Authorization check ทุก API endpoint
- ✅ Body scroll lock เมื่อเปิด Modal
