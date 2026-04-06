"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Bug,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModuleGate from "@/components/shared/ModuleGate";
import { useAppStore } from "@/stores/app-store";

interface Counts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  cisaKev: number;
  patchAvailable: number;
  new: number;
  reviewing: number;
  mitigated: number;
  notAffected: number;
}

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

export default function SecurityPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recentCritical, setRecentCritical] = useState<CveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/cves?limit=5&severity=critical`);
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts);
        setRecentCritical(data.cves);
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

  async function handleSync() {
    if (!orgId) return;
    setSyncing(true);
    try {
      await fetch(`/api/orgs/${orgId}/cves/sync`, { method: "POST" });
      await fetchData();
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  }

  const severityColor: Record<string, string> = {
    critical: "bg-rose-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
  };

  const severityBadge: Record<string, "destructive" | "warning" | "default" | "secondary"> = {
    critical: "destructive",
    high: "warning",
    medium: "default",
    low: "secondary",
  };

  return (
    <ModuleGate module="security">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Security Overview</h1>
            <p className="text-slate-500 mt-1">CVE tracking and vulnerability management</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="border-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync CVEs"}
            </Button>
            <Button variant="outline" asChild className="border-white/10">
              <Link href="/security/detections">View Detections</Link>
            </Button>
            <Button variant="outline" asChild className="border-white/10">
              <Link href="/security/posture">Security Posture</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : !counts || counts.total === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No CVEs tracked yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Sync vulnerability data from NVD and CISA to start tracking CVEs affecting your infrastructure.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync CVE Data"}
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total CVEs</p>
                      <p className="text-3xl font-display font-bold text-white mt-1">{counts.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Critical + High</p>
                      <p className="text-3xl font-display font-bold text-white mt-1">
                        {counts.critical + counts.high}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">CISA KEV Alerts</p>
                      <p className="text-3xl font-display font-bold text-white mt-1">{counts.cisaKev}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Patches Available</p>
                      <p className="text-3xl font-display font-bold text-white mt-1">{counts.patchAvailable}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(["critical", "high", "medium", "low"] as const).map((sev) => {
                    const count = counts[sev];
                    const pct = counts.total > 0 ? (count / counts.total) * 100 : 0;
                    return (
                      <div key={sev} className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 capitalize w-16">{sev}</span>
                        <div className="flex-1 h-5 bg-navy-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${severityColor[sev]} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Critical CVEs */}
            {recentCritical.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Recent Critical CVEs</CardTitle>
                  <Link
                    href="/security/detections?severity=critical"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCritical.map((cve) => (
                      <div
                        key={cve.id}
                        className="flex items-start gap-4 p-3 rounded-lg bg-navy-800/50 border border-white/[0.03]"
                      >
                        <div className="shrink-0 mt-0.5">
                          <Badge variant="destructive" className="text-[10px] px-1.5">
                            {cve.cvssScore || "N/A"}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/security/cve/${encodeURIComponent(cve.cveId)}`}
                              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                            >
                              {cve.cveId}
                            </a>
                            {cve.cisaKev && (
                              <Badge variant="warning" className="text-[10px] px-1.5">KEV</Badge>
                            )}
                            {cve.exploitAvailable && (
                              <Badge variant="destructive" className="text-[10px] px-1.5">
                                <Bug className="w-3 h-3 mr-1" />Exploit
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 truncate">{cve.title}</p>
                        </div>
                        <div className="shrink-0">
                          <span className="text-xs text-slate-500">
                            {new Date(cve.published).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/security/detections">
                <Card className="hover:border-cyan-500/20 transition-colors cursor-pointer group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                        CVE Detections
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Browse, filter, and triage all tracked vulnerabilities
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/security/posture">
                <Card className="hover:border-cyan-500/20 transition-colors cursor-pointer group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                        Security Posture
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scores, vendor breakdown, and compliance metrics
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </ModuleGate>
  );
}
