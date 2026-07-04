"use client";
import { useState } from "react";
import { Bell, Plus, X } from "lucide-react";

interface TopBarProps {
  title: string;
  onNewBooking: () => void;
  notifications: Array<{ id: string; message: string; isRead: boolean; createdAt: string }>;
  onMarkRead: () => void;
}

export default function TopBar({ title, onNewBooking, notifications, onMarkRead }: TopBarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="fixed top-0 right-0 left-[220px] h-[58px] bg-white border-b border-gray-100 z-40 flex items-center px-5 gap-3">
      <h1 className="flex-1 text-base font-bold text-gray-900">{title}</h1>

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif((v) => !v); onMarkRead(); }}
          className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Bell size={19} className="text-gray-600" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {showNotif && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowNotif(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">การแจ้งเตือน</p>
                <button
                  onClick={() => setShowNotif(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-sm text-gray-400">ไม่มีการแจ้งเตือน</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-gray-50 ${!n.isRead ? "bg-purple-50" : ""}`}
                    >
                      <p className="text-xs text-gray-800 font-medium">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* New booking button */}
      <button
        onClick={onNewBooking}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all"
      >
        <Plus size={15} />
        จองห้อง
      </button>
    </header>
  );
}
