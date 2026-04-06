"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
  Bug,
  Wrench,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModuleGate from "@/components/shared/ModuleGate";
import { useAppStore } from "@/stores/app-store";

interface CveEntry {
  id: string;
  cveId: string;
  severity: string;
  cvssScore: string | null;
  title: string;
  description: string;
  affectedProduct: string | null;
  vendor: string | null;
  published: string;
  lastModified: string | null;
  cisaKev: boolean;
  exploitAvailable: boolean;
  patchAvailable: boolean;
  status: string;
  assignedTo: string | null;
  notes: string | null;
  source: string;
}

interface Counts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  cisaKev: number;
  patchAvailable: number;
}

const SEVERITY_BADGE: Record<string, "destructive" | "warning" | "default" | "secondary"> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  mitigated: "Mitigated",
  not_affected: "Not Affected",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reviewing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  mitigated: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  not_affected: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function DetectionsPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [cves, setCves] = useState<CveEntry[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [kevOnly, setKevOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (severity !== "all") params.set("severity", severity);
    if (status !== "all") params.set("status", status);
    if (kevOnly) params.set("cisaKev", "true");
    if (searchDebounce) params.set("search", searchDebounce);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cves?${params}`);
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
  }, [orgId, severity, status, kevOnly, searchDebounce]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateStatus(id: string, newStatus: string) {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/cves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCves((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      }
    } catch {
      // silent
    }
  }

  async function bulkUpdateStatus(newStatus: string) {
    if (!orgId || selectedIds.size === 0) return;
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/orgs/${orgId}/cves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
    fetchData();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === cves.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cves.map((c) => c.id)));
    }
  }

  return (
    <ModuleGate module="security">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">CVE Detections</h1>
          <p className="text-slate-500 mt-1">
            Track and triage vulnerabilities from NVD and CISA feeds
          </p>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search CVE ID, title, vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="not_affected">Not Affected</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setKevOnly(!kevOnly)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  kevOnly
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-navy-900 text-slate-400 border-white/10 hover:border-white/20"
                }`}
              >
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                CISA KEV
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <span className="text-sm text-cyan-400 font-medium">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/10"
              onClick={() => bulkUpdateStatus("reviewing")}
            >
              Mark Reviewing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/10"
              onClick={() => bulkUpdateStatus("mitigated")}
            >
              Mark Mitigated
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/10"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : cves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No CVEs found</h3>
            <p className="text-sm text-slate-400 max-w-md">
              {searchDebounce || severity !== "all" || status !== "all"
                ? "Try adjusting your filters."
                : "Sync CVE data from the Security Overview page."}
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === cves.length && cves.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20 bg-navy-800"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CVE ID</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CVSS</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Published</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Flags</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {cves.map((cve) => (
                    <>
                      <tr
                        key={cve.id}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          expandedId === cve.id ? "bg-white/[0.02]" : ""
                        }`}
                        onClick={() => setExpandedId(expandedId === cve.id ? null : cve.id)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(cve.id)}
                            onChange={() => toggleSelect(cve.id)}
                            className="rounded border-white/20 bg-navy-800"
                          />
                        </td>
                        <td className="p-3">
                          <a
                            href={`/security/cve/${encodeURIComponent(cve.cveId)}`}
                            className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cve.cveId}
                          </a>
                        </td>
                        <td className="p-3">
                          <Badge variant={SEVERITY_BADGE[cve.severity]} className="capitalize text-[10px]">
                            {cve.severity}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-300">
                          {cve.cvssScore || "-"}
                        </td>
                        <td className="p-3 max-w-[300px]">
                          <span className="text-slate-300 text-xs truncate block">{cve.title}</span>
                        </td>
                        <td className="p-3 text-xs text-slate-400 capitalize">{cve.vendor || "-"}</td>
                        <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(cve.published).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {cve.cisaKev && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                KEV
                              </span>
                            )}
                            {cve.exploitAvailable && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <Bug className="w-3 h-3 mr-0.5" />
                              </span>
                            )}
                            {cve.patchAvailable && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Wrench className="w-3 h-3 mr-0.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={cve.status}
                            onChange={(e) => updateStatus(cve.id, e.target.value)}
                            className={`text-[11px] font-medium px-2 py-1 rounded-md border appearance-none cursor-pointer ${STATUS_COLORS[cve.status] || STATUS_COLORS.new}`}
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="mitigated">Mitigated</option>
                            <option value="not_affected">Not Affected</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {expandedId === cve.id ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </td>
                      </tr>
                      {expandedId === cve.id && (
                        <tr key={`${cve.id}-detail`} className="bg-navy-800/30">
                          <td colSpan={10} className="p-4">
                            <div className="space-y-3 max-w-3xl">
                              <div>
                                <p className="text-xs text-slate-500 mb-1 font-medium">Description</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{cve.description}</p>
                              </div>
                              <div className="flex gap-6 text-xs">
                                <div>
                                  <span className="text-slate-500">Product:</span>{" "}
                                  <span className="text-slate-300 capitalize">{cve.affectedProduct || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Source:</span>{" "}
                                  <span className="text-slate-300 uppercase">{cve.source}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Assigned:</span>{" "}
                                  <span className="text-slate-300">{cve.assignedTo || "Unassigned"}</span>
                                </div>
                              </div>
                              {cve.notes && (
                                <div>
                                  <p className="text-xs text-slate-500 mb-1 font-medium">Notes</p>
                                  <p className="text-xs text-slate-400">{cve.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            {counts && (
              <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {cves.length} of {counts.total} CVEs
                </span>
                <div className="flex gap-3">
                  <span>Critical: {counts.critical}</span>
                  <span>High: {counts.high}</span>
                  <span>Medium: {counts.medium}</span>
                  <span>Low: {counts.low}</span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </ModuleGate>
  );
}
