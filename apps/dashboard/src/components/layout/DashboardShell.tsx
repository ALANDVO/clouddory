"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

export default function DashboardShell({
  children,
  orgId,
}: {
  children: React.ReactNode;
  orgId?: string;
}) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setCurrentOrg = useAppStore((s) => s.setCurrentOrg);

  useEffect(() => {
    if (orgId) {
      setCurrentOrg(orgId, null);
    }
  }, [orgId, setCurrentOrg]);

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar />
      <div
        className="flex flex-col min-h-screen transition-all duration-200 ease-in-out"
        style={{
          marginLeft: undefined,
        }}
      >
        {/* Dynamic margin for sidebar — hidden on mobile, responsive on desktop */}
        <div
          className="hidden md:block fixed inset-0 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className={`flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
            sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
          }`}
        >
          <Topbar />
          <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
