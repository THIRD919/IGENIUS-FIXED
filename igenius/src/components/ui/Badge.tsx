import { BookingStatus } from "@prisma/client";
import { STATUS_CONFIG } from "@/lib/utils";

interface BadgeProps {
  status: BookingStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      style={{ background: config.bg, color: config.text, borderColor: config.color + "40" }}
      className={`inline-flex items-center border rounded-full font-semibold whitespace-nowrap ${
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5"
      }`}
    >
      {config.label}
    </span>
  );
}
