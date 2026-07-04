"use client";
import { useState, useEffect } from "react";
import { Plus, Shield, Users, BookOpen } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_CONFIG = {
  USER: { label: "ครู/ผู้สอน", bg: "#D1FAE5", color: "#065F46", icon: BookOpen },
  EMPLOYEE: { label: "เจ้าหน้าที่", bg: "#DBEAFE", color: "#1E3A8A", icon: Users },
  ADMIN: { label: "ผู้ดูแลระบบ", bg: "#EDE9FE", color: "#5B21B6", icon: Shield },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "USER" as User["role"], avatar: "",
  });

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => addToast("ไม่สามารถโหลดข้อมูลผู้ใช้งาน", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatar: form.avatar || form.name[0] }),
    });
    if (!res.ok) {
      const err = await res.json();
      addToast(err.error || "เกิดข้อผิดพลาด", "error");
      return;
    }
    const newUser = await res.json();
    setUsers((prev) => [...prev, newUser]);
    setShowForm(false);
    setForm({ name: "", email: "", password: "", role: "USER", avatar: "" });
    addToast("เพิ่มผู้ใช้งานสำเร็จ ✓", "success");
  };

  const counts = {
    USER: users.filter((u) => u.role === "USER").length,
    EMPLOYEE: users.filter((u) => u.role === "EMPLOYEE").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">👥 จัดการผู้ใช้งาน</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all"
        >
          <Plus size={15} /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {(["USER", "EMPLOYEE", "ADMIN"] as const).map((role) => {
          const cfg = ROLE_CONFIG[role];
          const Icon = cfg.icon;
          return (
            <div key={role} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                <Icon size={18} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{counts[role]}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center py-8 text-gray-400 text-sm">กำลังโหลด...</p>
        ) : (
          users.map((u, i) => {
            const cfg = ROLE_CONFIG[u.role];
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: i < users.length - 1 ? "1px solid #F9FAFB" : "none" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {u.avatar || u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {u.isActive ? "ใช้งาน" : "ปิด"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Create user modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="➕ เพิ่มผู้ใช้งาน" width={440}>
        <form onSubmit={handleCreate} className="space-y-4">
          {[
            { label: "ชื่อ-นามสกุล", key: "name", type: "text", placeholder: "ครูสมชาย ใจดี" },
            { label: "อีเมล", key: "email", type: "email", placeholder: "somchai@igenius.ac.th" },
            { label: "รหัสผ่าน", key: "password", type: "password", placeholder: "อย่างน้อย 4 ตัวอักษร" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">สิทธิ์การใช้งาน</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="USER">ครู/ผู้สอน (User)</option>
              <option value="EMPLOYEE">เจ้าหน้าที่ (Employee)</option>
              <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all"
          >
            เพิ่มผู้ใช้งาน
          </button>
        </form>
      </Modal>
    </div>
  );
}
