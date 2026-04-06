import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/super-admin";
import AdminSidebar from "./admin-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session.email)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#050816]">
      <AdminSidebar name={session.name} email={session.email} />
      <main className="flex-1 ml-64">
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#050816]/80 backdrop-blur-sm border-b border-white/5">
          <div />
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-xs font-semibold bg-[#00e5c7]/10 text-[#00e5c7] border border-[#00e5c7]/20 rounded-full">
              Super Admin
            </span>
            <span className="text-sm text-slate-400">{session.name}</span>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
