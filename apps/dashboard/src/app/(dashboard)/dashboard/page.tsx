"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  Cloud,
  AlertTriangle,
  Lightbulb,
  LayoutDashboard,
  RefreshCw,
  BarChart3,
  Search,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAppStore } from "@/stores/app-store";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

interface ServiceCost {
  name: string;
  cost: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { currentOrgId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [mtdSpend, setMtdSpend] = useState(0);
  const [accountsCount, setAccountsCount] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [topServices, setTopServices] = useState<ServiceCost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [syncing, setSyncing] = useState(false);

  const userName = session?.user?.name || "there";

  const fetchAll = useCallback(async () => {
    if (!currentOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [spendRes, servicesRes, accountsRes, anomaliesRes, wasteRes, notifsRes] =
        await Promise.allSettled([
          fetch(`/api/orgs/${currentOrgId}/spend`),
          fetch(`/api/orgs/${currentOrgId}/spend?group_by=service`),
          fetch(`/api/orgs/${currentOrgId}/cloud-accounts`),
          fetch(`/api/orgs/${currentOrgId}/anomalies`),
          fetch(`/api/orgs/${currentOrgId}/waste-scanner/results`),
          fetch(`/api/orgs/${currentOrgId}/notifications`),
        ]);

      // Total MTD Spend
      if (spendRes.status === "fulfilled" && spendRes.value.ok) {
        const data = await spendRes.value.json();
        setMtdSpend(data.total ?? 0);
      }

      // Top Services (grouped by service)
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
        const data = await servicesRes.value.json();
        if (data.grouped) {
          const sorted = Object.entries(data.grouped as Record<string, number>)
            .map(([name, cost]) => ({ name, cost: cost as number }))
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);
          setTopServices(sorted);
        }
      }

      // Connected Accounts
      if (accountsRes.status === "fulfilled" && accountsRes.value.ok) {
        const data = await accountsRes.value.json();
        setAccountsCount(Array.isArray(data) ? data.length : 0);
      }

      // Active Anomalies
      if (anomaliesRes.status === "fulfilled" && anomaliesRes.value.ok) {
        const data = await anomaliesRes.value.json();
        setAnomalyCount(data.summary?.activeCount ?? 0);
      }

      // Savings Found (waste scanner)
      if (wasteRes.status === "fulfilled" && wasteRes.value.ok) {
        const data = await wasteRes.value.json();
        setSavingsTotal(data.summary?.totalMonthlyWaste ?? 0);
      }

      // Recent notifications
      if (notifsRes.status === "fulfilled" && notifsRes.value.ok) {
        const data = await notifsRes.value.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSyncNow() {
    if (!currentOrgId || syncing) return;
    setSyncing(true);
    try {
      // Trigger sync on all cloud accounts
      const acctRes = await fetch(`/api/orgs/${currentOrgId}/cloud-accounts`);
      if (acctRes.ok) {
        const accounts = await acctRes.json();
        await Promise.allSettled(
          (accounts as { id: string }[]).map((a) =>
            fetch(`/api/orgs/${currentOrgId}/cloud-accounts/${a.id}/sync`, {
              method: "POST",
            })
          )
        );
      }
      // Refresh data after sync
      await fetchAll();
    } catch {
      // silently fail
    } finally {
      setSyncing(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner className="w-8 h-8 text-cyan-400" />
      </div>
    );
  }

  const hasData = mtdSpend > 0 || accountsCount > 0;

  const stats = [
    {
      label: "Total MTD Spend",
      value: formatCurrency(mtdSpend),
      subtitle: mtdSpend > 0 ? "Month to date" : "No spend data",
      icon: DollarSign,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
    {
      label: "Connected Accounts",
      value: String(accountsCount),
      subtitle:
        accountsCount > 0
          ? `${accountsCount} cloud account${accountsCount !== 1 ? "s" : ""}`
          : "No accounts connected",
      icon: Cloud,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Active Anomalies",
      value: String(anomalyCount),
      subtitle: anomalyCount > 0 ? "Needs attention" : "All clear",
      icon: AlertTriangle,
      iconColor: anomalyCount > 0 ? "text-amber-400" : "text-emerald-400",
      iconBg: anomalyCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10",
    },
    {
      label: "Savings Found",
      value: savingsTotal > 0 ? formatCurrency(savingsTotal) + "/mo" : "$0",
      subtitle:
        savingsTotal > 0 ? "Potential monthly savings" : "Run waste scanner",
      icon: Lightbulb,
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-500 mt-1">
            {hasData
              ? "Here is your cloud cost overview."
              : "Connect a cloud account to get started."}
          </p>
        </div>
        {hasData && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative group rounded-xl border border-white/[0.06] bg-navy-900 p-5 transition-all hover:border-cyan-500/20"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-display font-bold mt-1 ${
                    hasData ? "text-white" : "text-slate-600"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600 mt-1.5">
                  {stat.subtitle}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.iconBg}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content area: either real data or get-started */}
      {hasData ? (
        <>
          {/* Top Services */}
          {topServices.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-semibold text-white">
                  Top Services by Cost
                </h3>
                <Link href="/costs">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {topServices.map((svc, idx) => {
                  const maxCost = topServices[0]?.cost || 1;
                  const pct = Math.round((svc.cost / maxCost) * 100);
                  return (
                    <div key={svc.name} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-5 text-right">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/costs/${encodeURIComponent(
                              svc.name
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                            )}`}
                            className="text-sm text-white font-medium truncate hover:text-cyan-400 transition-colors"
                          >
                            {svc.name}
                          </Link>
                          <span className="text-sm font-display font-semibold text-white ml-3 shrink-0">
                            {formatCurrency(svc.cost)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-navy-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-500/60 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-semibold text-white">
                Recent Activity
              </h3>
              <Bell className="w-4 h-4 text-slate-500" />
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.read ? "bg-slate-600" : "bg-cyan-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {n.body}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recent activity</p>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSyncNow}
              disabled={syncing}
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
              Sync Now
            </Button>
            <Link href="/costs">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Cost Explorer
              </Button>
            </Link>
            <Link href="/recommendations">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Run Scan
              </Button>
            </Link>
          </div>
        </>
      ) : (
        /* Get Started / Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
            <LayoutDashboard className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="font-display font-semibold text-lg text-white mb-2">
            Get Started
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Connect a cloud account and subscribe to a module to start seeing
            your cost data, anomalies, and optimization recommendations.
          </p>
          <div className="flex gap-3">
            <Link href="/settings/cloud-accounts">
              <Button>Connect Cloud Account</Button>
            </Link>
            <Link href="/settings/billing">
              <Button variant="outline">View Subscriptions</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
