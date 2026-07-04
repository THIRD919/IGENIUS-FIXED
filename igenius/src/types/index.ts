import { BookingStatus, Role, RoomType } from "@prisma/client";

export type { BookingStatus, Role, RoomType };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface RoomWithBookings {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  color: string;
  description?: string | null;
  facilities?: string | null;
  isActive: boolean;
  bookings?: BookingWithDetails[];
}

export interface BookingWithDetails {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string;
  endTime: string;
  course: string;
  level: string;
  students: number;
  equipment?: string | null;
  note?: string | null;
  status: BookingStatus;
  rejectedReason?: string | null;
  userId: string;
  roomId: string;
  approvedById?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  room: {
    id: string;
    name: string;
    building: string;
    capacity: number;
    color: string;
    type: RoomType;
  };
  approvedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface BookingFormData {
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  course: string;
  level: string;
  students: number;
  equipment: string[];
  note: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingCount: number;
  todayBookings: BookingWithDetails[];
  upcomingBookings: BookingWithDetails[];
}
