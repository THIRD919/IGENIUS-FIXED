"use client";
import { useState, useEffect, useCallback } from "react";
import { BookingWithDetails } from "@/types";

interface UseBookingsOptions {
  myOnly?: boolean;
  status?: string;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.myOnly) params.set("myOnly", "true");
      if (options.status && options.status !== "ALL") params.set("status", options.status);
      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (e: any) {
      setError(e.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [options.myOnly, options.status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const approveBooking = async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE" }),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error ?? "เกิดข้อผิดพลาด";
    }
    await fetchBookings();
    return null;
  };

  const rejectBooking = async (id: string, reason: string): Promise<string | null> => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REJECT", reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error ?? "เกิดข้อผิดพลาด";
    }
    await fetchBookings();
    return null;
  };

  const cancelBooking = async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL" }),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error ?? "เกิดข้อผิดพลาด";
    }
    await fetchBookings();
    return null;
  };

  const createBooking = async (data: any): Promise<string | null> => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error ?? "เกิดข้อผิดพลาด";
    }
    await fetchBookings();
    return null;
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    approveBooking,
    rejectBooking,
    cancelBooking,
    createBooking,
  };
}

