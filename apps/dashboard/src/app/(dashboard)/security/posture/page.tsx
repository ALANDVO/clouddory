"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Clock,
  Building2,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModuleGate from "@/components/shared/ModuleGate";
import { useAppStore } from "@/stores/app-store";

interface CveEntry {
  id: string;
  cveId: string;
  severity: string;
  cvssScore: string | null;
  title: string;
  published: string;
  cisaKev: boolean;
  exploitAvailable: boolean;
  patchAvailable: boolean;
  status: string;
  vendor: string | null;
}

interface Counts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  cisaKev: number;
  patchAvailable: number;
  mitigated: number;
  notAffected: number;
}

export default function PosturePage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [cves, setCves] = useState<CveEntry[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/cves?limit=500`);
      if (res.ok) {
        const data = await res.json();
        setCves(data.cves);
        setCounts(data.counts);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute posture metrics
  const metrics = useMemo(() => {
    if (!counts || counts.total === 0) return null;

    const mitigatedOrNa = counts.mitigated + counts.notAffected;
    const mitigationRate = (mitigatedOrNa / counts.total) * 100;

    // Weighted score: critical = 4x, high = 3x, medium = 2x, low = 1x
    const totalWeight = counts.critical * 4 + counts.high * 3 + counts.medium * 2 + counts.low * 1;
    const mitigatedCves = cves.filter((c) => c.status === "mitigated" || c.status === "not_affected");
    const mitigatedWeight =
      mitigatedCves.filter((c) => c.severity === "critical").length * 4 +
      mitigatedCves.filter((c) => c.severity === "high").length * 3 +
      mitigatedCves.filter((c) => c.severity === "medium").length * 2 +
      mitigatedCves.filter((c) => c.severity === "low").length * 1;
    const securityScore = totalWeight > 0 ? Math.round((mitigatedWeight / totalWeight) * 100) : 100;

    // Vulnerability age buckets
    const now = Date.now();
    const openCves = cves.filter((c) => c.status !== "mitigated" && c.status !== "not_affected");
    const ageBuckets = { recent: 0, week: 0, old: 0 };
    for (const c of openCves) {
      const days = (now - new Date(c.published).getTime()) / (1000 * 60 * 60 * 24);
      if (days <= 7) ageBuckets.recent++;
      else if (days <= 30) ageBuckets.week++;
      else ageBuckets.old++;
    }

    // Vendor breakdown
    const vendorMap: Record<string, number> = {};
    for (const c of cves) {
      const v = c.vendor || "unknown";
      vendorMap[v] = (vendorMap[v] || 0) + 1;
    }
    const vendorBreakdown = Object.entries(vendorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // CISA KEV compliance
    const kevCves = cves.filter((c) => c.cisaKev);
    const kevOpen = kevCves.filter((c) => c.status !== "mitigated" && c.status !== "not_affected").length;
    const kevTotal = kevCves.length;

    // Patch coverage
    const patchableCves = cves.filter((c) => c.patchAvailable);
    const patchedCves = patchableCves.filter((c) => c.status === "mitigated" || c.status === "not_affected");
    const patchCoverage = patchableCves.length > 0
      ? Math.round((patchedCves.length / patchableCves.length) * 100)
      : 100;

    return {
      securityScore,
      mitigationRate,
      ageBuckets,
      vendorBreakdown,
      kevOpen,
      kevTotal,
      patchCoverage,
      patchedCount: patchedCves.length,
      patchableCount: patchableCves.length,
      openCount: openCves.length,
    };
  }, [cves, counts]);

  function scoreColor(score: number): string {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  }

  function scoreRing(score: number): string {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  }

  return (
    <ModuleGate module="security">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Security Posture</h1>
          <p className="text-slate-500 mt-1">
            Vulnerability management metrics and compliance tracking
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : !metrics ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No posture data</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Sync CVE data from the Security Overview page to see your security posture.
            </p>
          </div>
        ) : (
          <>
            {/* Top row: Score + Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Security Score (large) */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">
                    Security Score
                  </p>
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="currentColor"
                        className="text-navy-800"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        className={scoreRing(metrics.securityScore)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(metrics.securityScore / 100) * 327} 327`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-display font-bold ${scoreColor(metrics.securityScore)}`}>
                        {metrics.securityScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Based on weighted CVE mitigation
                  </p>
                </CardContent>
              </Card>

              {/* Metric cards */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">CISA KEV Compliance</p>
                    </div>
                    <p className="text-2xl font-display font-bold text-white">
                      {metrics.kevTotal > 0 ? metrics.kevTotal - metrics.kevOpen : 0}
                      <span className="text-sm text-slate-500 font-normal"> / {metrics.kevTotal}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {metrics.kevOpen > 0
                        ? `${metrics.kevOpen} KEV item${metrics.kevOpen > 1 ? "s" : ""} still open`
                        : "All KEV items addressed"}
                    </p>
                    {metrics.kevOpen > 0 && (
                      <div className="mt-3 h-2 bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${metrics.kevTotal > 0 ? ((metrics.kevTotal - metrics.kevOpen) / metrics.kevTotal) * 100 : 0}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Patch Coverage</p>
                    </div>
                    <p className="text-2xl font-display font-bold text-white">
                      {metrics.patchCoverage}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {metrics.patchedCount} of {metrics.patchableCount} patchable CVEs addressed
                    </p>
                    <div className="mt-3 h-2 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${metrics.patchCoverage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Open Vulnerabilities</p>
                    </div>
                    <p className="text-2xl font-display font-bold text-white">
                      {metrics.openCount}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {Math.round(metrics.mitigationRate)}% mitigation rate
                    </p>
                    <div className="mt-3 h-2 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${metrics.mitigationRate}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Vulnerability Age + Vendor Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vulnerability Age */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Vulnerability Age (Open)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.openCount === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      No open vulnerabilities
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {[
                        { label: "1-7 days", count: metrics.ageBuckets.recent, color: "bg-emerald-500" },
                        { label: "7-30 days", count: metrics.ageBuckets.week, color: "bg-amber-500" },
                        { label: "30+ days", count: metrics.ageBuckets.old, color: "bg-rose-500" },
                      ].map((bucket) => {
                        const pct = metrics.openCount > 0 ? (bucket.count / metrics.openCount) * 100 : 0;
                        return (
                          <div key={bucket.label} className="flex items-center gap-4">
                            <span className="text-sm text-slate-400 w-20">{bucket.label}</span>
                            <div className="flex-1 h-6 bg-navy-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${bucket.color} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white w-8 text-right">
                              {bucket.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vendor Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Vendor Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.vendorBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No vendor data</p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.vendorBreakdown.map(([vendor, count]) => {
                        const pct = counts ? (count / counts.total) * 100 : 0;
                        return (
                          <div key={vendor} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 capitalize w-24 truncate">{vendor}</span>
                            <div className="flex-1 h-4 bg-navy-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500/60 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-white w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ModuleGate>
  );
}
