"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const QUICK_ACCOUNTS = [
  { label: "👩‍🏫 ครู (User)", email: "naphaporn@igenius.ac.th", pass: "1234" },
  { label: "👤 เจ้าหน้าที่", email: "somsri@igenius.ac.th", pass: "1234" },
  { label: "⚙️ Admin", email: "admin@igenius.ac.th", pass: "admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("naphaporn@igenius.ac.th");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl p-9 w-full max-w-sm shadow-2xl shadow-purple-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-3xl">
            🏫
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">iGenius</h1>
          <p className="text-sm text-gray-500 mt-1">ระบบจองห้องเรียน เชียงใหม่</p>
        </div>

        {/* Quick login */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-2">เข้าสู่ระบบด่วน:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword(a.pass); setError(""); }}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-colors ${
                  email === a.email
                    ? "bg-purple-100 text-purple-700 border-purple-300"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-200"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="email@igenius.ac.th"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="รหัสผ่าน"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          iGenius Classroom Booking System v1.0
        </p>
      </div>
    </div>
  );
}
