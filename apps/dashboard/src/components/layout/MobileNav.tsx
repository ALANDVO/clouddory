"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Server,
  Settings,
} from "lucide-react";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const items: MobileNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Costs", href: "/costs", icon: BarChart3 },
  { label: "Recs", href: "/recommendations", icon: Sparkles },
  { label: "Resources", href: "/resources", icon: Server },
  { label: "Settings", href: "/settings/profile", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-navy-900 border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors
                ${active ? "text-cyan-400" : "text-slate-500"}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <span className="absolute bottom-2 w-1 h-1 bg-cyan-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
