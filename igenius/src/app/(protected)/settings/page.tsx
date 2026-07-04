"use client";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 mb-5">⚙️ ตั้งค่าระบบ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "ข้อมูลโรงเรียน",
            icon: "🏫",
            fields: [
              { label: "ชื่อโรงเรียน", value: "iGenius Language School" },
              { label: "ที่อยู่", value: "เชียงใหม่, ประเทศไทย" },
              { label: "โทรศัพท์", value: "053-XXX-XXX" },
              { label: "อีเมล", value: "info@igenius.ac.th" },
            ],
          },
          {
            title: "การแจ้งเตือน",
            icon: "🔔",
            fields: [
              { label: "แจ้งเตือนก่อนเรียน", value: "15 นาที" },
              { label: "การแจ้งเตือนอีเมล", value: "เปิดใช้งาน" },
              { label: "ภาษาระบบ", value: "ภาษาไทย" },
            ],
          },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              {section.icon} {section.title}
            </h3>
            <div className="space-y-3">
              {section.fields.map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input
                    defaultValue={f.value}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors">
          บันทึกการตั้งค่า
        </button>
        <button className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
