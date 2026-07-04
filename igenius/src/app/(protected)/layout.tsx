import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const pendingCount = await prisma.booking.count({ where: { status: "PENDING" } });
  const user = session.user as any;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F7FF]">
        <div className="hidden md:block">
          <Sidebar
            user={{ name: user.name ?? "", role: user.role ?? "USER", avatar: user.avatar }}
            pendingCount={pendingCount}
          />
        </div>
        <main className="md:ml-[220px] pb-24 md:pb-8 px-4 md:px-6 py-5 md:py-6 min-h-screen">
          {children}
        </main>
        <BottomNav pendingCount={pendingCount} />
      </div>
    </ToastProvider>
  );
}
