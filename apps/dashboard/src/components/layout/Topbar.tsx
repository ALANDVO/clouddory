"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/layout/NotificationBell";
import BookmarksDropdown from "@/components/layout/BookmarksDropdown";

export default function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-navy-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left spacer / page title area */}
      <div />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Bookmarks */}
        <BookmarksDropdown />

        {/* Notification bell */}
        <NotificationBell />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-white/5 transition-colors focus:outline-none">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-semibold ring-2 ring-white/10">
                  {initials}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-navy-900 border-white/10">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white leading-none">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-slate-500 leading-none">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-white/5 cursor-pointer">
              <Link href="/settings/profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-white/5 cursor-pointer">
              <Link href="/settings/profile">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-300 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
