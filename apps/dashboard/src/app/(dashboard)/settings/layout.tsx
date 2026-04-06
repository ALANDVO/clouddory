'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User, Building2, Users, Cloud, Puzzle, Bell, Key, Brain,
  FolderTree, Route, Layers, ShieldCheck, Percent, Globe, Award, Database,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/organization', label: 'Organization', icon: Building2 },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings/cloud-accounts', label: 'Cloud Accounts', icon: Cloud },
  { href: '/settings/ai-keys', label: 'AI Config', icon: Brain },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/api-keys', label: 'API Keys', icon: Key },
  { href: '/settings/cost-centers', label: 'Cost Centers', icon: FolderTree },
  { href: '/settings/alert-routes', label: 'Alert Routes', icon: Route },
  { href: '/settings/grouping-profiles', label: 'Grouping Profiles', icon: Layers },
  { href: '/settings/sso', label: 'SSO', icon: ShieldCheck },
  { href: '/settings/volume-discounts', label: 'Volume Discounts', icon: Percent },
  { href: '/settings/allowed-networks', label: 'Allowed Networks', icon: Globe },
  { href: '/settings/trust-center', label: 'Trust Center', icon: Award },
  { href: '/settings/bi-export', label: 'BI Export', icon: Database },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-display font-semibold text-white">Settings</h1>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto">
          <nav className="flex gap-1 min-w-max pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop: no side nav here — the main Sidebar handles it */}
      <div className="hidden lg:block mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-semibold text-white">Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your account and organization</p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
