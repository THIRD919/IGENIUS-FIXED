"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { COURSES, LEVELS, EQUIPMENT_LIST } from "@/lib/utils";
import { RoomWithBookings } from "@/types";

const bookingSchema = z.object({
  date: z.string().min(1, "กรุณาเลือกวันที่"),
  startTime: z.string().min(1, "กรุณาเลือกเวลาเริ่ม"),
  endTime: z.string().min(1, "กรุณาเลือกเวลาสิ้นสุด"),
  roomId: z.string().min(1, "กรุณาเลือกห้องเรียน"),
  course: z.string().min(1, "กรุณาเลือกวิชา"),
  level: z.string().min(1, "กรุณาเลือกระดับ"),
  students: z.coerce.number().min(1, "จำนวนนักเรียนต้องมากกว่า 0"),
  equipment: z.array(z.string()),
  note: z.string().max(500),
}).refine((d) => d.startTime < d.endTime, {
  message: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม",
  path: ["endTime"],
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  rooms: RoomWithBookings[];
  defaultValues?: Partial<BookingFormValues>;
  isLoading?: boolean;
  readOnly?: boolean;
  currentUserName?: string;
}

export default function BookingForm({
  onSubmit,
  rooms,
  defaultValues = {},
  isLoading = false,
  readOnly = false,
  currentUserName,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:30",
      roomId: rooms[0]?.id ?? "",
      course: COURSES[0],
      level: LEVELS[0],
      students: 10,
      equipment: [],
      note: "",
      ...defaultValues,
    },
  });

  const selectedRoomId = watch("roomId");
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
      hasError ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-purple-500"
    } focus:outline-none focus:ring-2 focus:border-transparent ${readOnly ? "bg-gray-50 cursor-default" : "bg-white"}`;

  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";
  const errClass = "text-red-500 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row 1: Date + Room */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>📅 วันที่</label>
          <input type="date" {...register("date")} readOnly={readOnly} className={inputClass(!!errors.date)} />
          {errors.date && <p className={errClass}>{errors.date.message}</p>}
        </div>
        <div>
          <label className={labelClass}>🏫 ห้องเรียน</label>
          <select {...register("roomId")} disabled={readOnly} className={inputClass(!!errors.roomId)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.building}, {r.capacity} คน)
              </option>
            ))}
          </select>
          {errors.roomId && <p className={errClass}>{errors.roomId.message}</p>}
          {selectedRoom && (
            <p className="text-[10px] text-purple-600 mt-1 font-medium">
              ความจุ {selectedRoom.capacity} คน · {selectedRoom.type}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>⏰ เวลาเริ่มต้น</label>
          <input type="time" {...register("startTime")} readOnly={readOnly} className={inputClass(!!errors.startTime)} />
          {errors.startTime && <p className={errClass}>{errors.startTime.message}</p>}
        </div>
        <div>
          <label className={labelClass}>⏰ เวลาสิ้นสุด</label>
          <input type="time" {...register("endTime")} readOnly={readOnly} className={inputClass(!!errors.endTime)} />
          {errors.endTime && <p className={errClass}>{errors.endTime.message}</p>}
        </div>
      </div>

      {/* Row 3: Course */}
      <div>
        <label className={labelClass}>📚 วิชา/หลักสูตร</label>
        <select {...register("course")} disabled={readOnly} className={inputClass(!!errors.course)}>
          {COURSES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {errors.course && <p className={errClass}>{errors.course.message}</p>}
      </div>

      {/* Row 4: Level + Students */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>📊 ระดับชั้น</label>
          <select {...register("level")} disabled={readOnly} className={inputClass()}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>👨‍🎓 จำนวนนักเรียน</label>
          <input
            type="number"
            {...register("students")}
            min={1}
            max={selectedRoom?.capacity ?? 50}
            readOnly={readOnly}
            className={inputClass(!!errors.students)}
          />
          {errors.students && <p className={errClass}>{errors.students.message}</p>}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <label className={labelClass}>🔌 อุปกรณ์ที่ต้องใช้</label>
        <Controller
          name="equipment"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_LIST.map((eq) => {
                const selected = field.value.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      if (readOnly) return;
                      field.onChange(
                        selected ? field.value.filter((e) => e !== eq) : [...field.value, eq]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      selected
                        ? "bg-purple-100 text-purple-700 border-purple-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-200"
                    } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Note */}
      <div>
        <label className={labelClass}>📝 หมายเหตุ</label>
        <textarea
          {...register("note")}
          rows={2}
          readOnly={readOnly}
          placeholder="หมายเหตุเพิ่มเติม เช่น เปิดแอร์ล่วงหน้า 15 นาที"
          className={`${inputClass()} resize-none`}
        />
      </div>

      {/* Submit */}
      {!readOnly && (
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "กำลังส่งคำขอ..." : "✅ ส่งคำขอจองห้องเรียน"}
        </button>
      )}
    </form>
  );
}
