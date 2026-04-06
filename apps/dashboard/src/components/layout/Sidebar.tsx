"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { isSuperAdmin } from "@/lib/super-admin";
import {
  LayoutDashboard,
  BarChart3,
  Trash2,
  Receipt,
  Server,
  AlertTriangle,
  PieChart,
  Tags,
  Shield,
  Bell,
  ShieldCheck,
  Eye,
  Crosshair,
  FileText,
  Zap,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  CreditCard,
  Plug,
  PenLine,
  LayoutGrid,
  Search,
  MessageSquare,
  Cpu,
  Calculator,
  FileBarChart,
  Tag,
  Users,
  Workflow,
  ArrowLeft,
  User,
  Building2,
  Cloud,
  Key,
  FolderTree,
  Route,
  Layers,
  Percent,
  Globe,
  Award,
  Database,
  Puzzle,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useAppStore } from "@/stores/app-store";
import { useSubscriptions } from "@/components/shared/SubscriptionProvider";
import type { ModuleKey } from "@/lib/subscriptions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  module?: ModuleKey; // optional: if set, the section requires this module subscription
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "FINOPS",
    module: "finops",
    items: [
      { label: "Cost Explorer", href: "/costs", icon: BarChart3 },
      { label: "Resources", href: "/resources", icon: Server },
      { label: "Anomalies", href: "/anomalies", icon: AlertTriangle },
      { label: "Allocation", href: "/costs/allocation", icon: PieChart },
      { label: "AiTags", href: "/costs/aitags", icon: Tags },
      { label: "Manual Entry", href: "/costs/manual-entry", icon: PenLine },
    ],
  },
  {
    title: "OPTIMIZE",
    module: "finops",
    items: [
      { label: "Waste Scanner", href: "/recommendations", icon: Trash2 },
      { label: "Commitments", href: "/commitments", icon: Receipt },
      { label: "AI Costs", href: "/ai-costs", icon: Cpu },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "DoryAI", href: "/ai", icon: MessageSquare },
    ],
  },
  {
    title: "VISIBILITY",
    items: [
      { label: "Dashboards", href: "/dashboards", icon: LayoutGrid },
      { label: "Query Builder", href: "/query-lens", icon: Search },
      { label: "Spend Plan", href: "/spend-plan", icon: Calculator },
    ],
  },
  {
    title: "OPERATE",
    module: "finops",
    items: [
      { label: "Reports", href: "/reports", icon: FileBarChart },
      { label: "Tag Governance", href: "/label-policy", icon: Tag },
      { label: "Team Showback", href: "/showback", icon: Users },
      { label: "Workflows", href: "/accountability", icon: Workflow },
    ],
  },
  {
    title: "SECURITY",
    module: "security",
    items: [
      { label: "Security Overview", href: "/security", icon: Shield },
      { label: "Detections", href: "/security/detections", icon: Bell },
      { label: "Security Posture", href: "/security/posture", icon: ShieldCheck },
    ],
  },
  {
    title: "INTELLIGENCE",
    module: "intelligence",
    items: [
      { label: "Threat Intel", href: "/intelligence", icon: Eye },
      { label: "IOC Management", href: "/intelligence/iocs", icon: Crosshair },
      { label: "Reports", href: "/intelligence/reports", icon: FileText },
    ],
  },
  {
    title: "AUTOMATION",
    module: "automation",
    items: [
      { label: "Playbooks", href: "/automation", icon: Zap },
      { label: "Workflows", href: "/automation/playbooks", icon: GitBranch },
    ],
  },
];

const settingsSections: NavSection[] = [
  {
    title: "ACCOUNT",
    items: [
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "Organization", href: "/settings/organization", icon: Building2 },
      { label: "Team", href: "/settings/team", icon: Users },
      { label: "Billing", href: "/settings/billing", icon: CreditCard },
    ],
  },
  {
    title: "CONNECTIONS",
    items: [
      { label: "Cloud Accounts", href: "/settings/cloud-accounts", icon: Cloud },
      { label: "Integrations", href: "/settings/integrations", icon: Puzzle },
      { label: "Alert Routes", href: "/settings/alert-routes", icon: Route },
    ],
  },
  {
    title: "DATA",
    items: [
      { label: "Cost Centers", href: "/settings/cost-centers", icon: FolderTree },
      { label: "Grouping Profiles", href: "/settings/grouping-profiles", icon: Layers },
      { label: "Volume Discounts", href: "/settings/volume-discounts", icon: Percent },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    title: "SECURITY",
    items: [
      { label: "API Keys", href: "/settings/api-keys", icon: Key },
      { label: "SSO", href: "/settings/sso", icon: ShieldCheck },
      { label: "Allowed Networks", href: "/settings/allowed-networks", icon: Globe },
      { label: "Trust Center", href: "/settings/trust-center", icon: Award },
      { label: "BI Export", href: "/settings/bi-export", icon: Database },
    ],
  },
];

const bottomNav: NavItem[] = [
  { label: "Admin", href: "/admin", icon: ShieldCheck },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Settings", href: "/settings/profile", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { hasAccess } = useSubscriptions();
  const showAdmin = isSuperAdmin(session?.user?.email);
  const isSettingsPage = pathname.startsWith("/settings");

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    // Exact match for section overviews to avoid conflicts with sub-routes
    if (href === "/security") return pathname === "/security";
    if (href === "/intelligence") return pathname === "/intelligence";
    if (href === "/automation") return pathname === "/automation";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, layoutPrefix: string, locked: boolean) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
          ${
            active
              ? "bg-cyan-500/10 text-cyan-400"
              : locked
                ? "text-slate-500 hover:bg-white/5 hover:text-slate-400"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
          }
        `}
      >
        {active && (
          <motion.div
            layoutId={`sidebar-active-${layoutPrefix}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-cyan-500 rounded-r-full"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <item.icon className="w-5 h-5 shrink-0" />
        {!sidebarCollapsed && (
          <span className="whitespace-nowrap flex-1">{item.label}</span>
        )}
        {!sidebarCollapsed && locked && (
          <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-navy-900 border-r border-white/5 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <Logo className="w-8 h-8 shrink-0" />
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-display text-lg font-bold text-white whitespace-nowrap"
            >
              CloudDory
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {isSettingsPage ? (
          <>
            {/* Back to dashboard link */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-sm text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {!sidebarCollapsed && <span>Back to Dashboard</span>}
            </Link>
            <div className="mb-2 h-px bg-white/5" />

            {/* Settings sections */}
            {settingsSections.map((section, idx) => (
              <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 mb-1.5"
                    >
                      <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                        {section.title}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && idx > 0 && (
                  <div className="my-2 mx-2 h-px bg-white/5" />
                )}
                {section.items.map((item) => renderNavItem(item, "main", false))}
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Normal nav sections */}
            {navSections.map((section, idx) => {
              const locked = section.module ? !hasAccess(section.module) : false;
              return (
                <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 mb-1.5"
                      >
                        <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                          {section.title}
                        </p>
                        {locked && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-white/5 text-slate-600 border border-white/[0.04]">
                            PRO
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {sidebarCollapsed && idx > 0 && (
                    <div className="my-2 mx-2 h-px bg-white/5" />
                  )}
                  {section.items.map((item) => renderNavItem(item, "main", locked))}
                </div>
              );
            })}

            {/* Spacer + bottom nav */}
            <div className="flex-1" />
            <div className="my-3 h-px bg-white/5" />
            {bottomNav.filter((item) => item.label !== "Admin" || showAdmin).map((item) => renderNavItem(item, "bottom", false))}
            <div className="h-2" />
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-white/5 text-slate-500 hover:text-white transition-colors shrink-0"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </motion.aside>
  );
}
