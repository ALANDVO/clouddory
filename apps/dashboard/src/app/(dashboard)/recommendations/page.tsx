'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import ModuleGate from '@/components/shared/ModuleGate';
import PageHelp from '@/components/shared/PageHelp';
import { useAppStore } from '@/stores/app-store';

interface WasteResult {
  id: string;
  scanType: string;
  resourceId: string;
  provider: string;
  service: string;
  region: string | null;
  monthlyWasteCost: number;
  recommendation: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface Summary {
  totalMonthlyWaste: number;
  openCount: number;
  criticalCount: number;
  highCount: number;
}

const SCAN_TYPE_LABELS: Record<string, string> = {
  idle_resources: 'Idle Resources',
  rightsizing: 'Rightsizing',
  unused_commitments: 'Unused Commitments',
  orphaned_storage: 'Orphaned Storage',
  oversized_instances: 'Oversized Instances',
};

const SCAN_TYPE_COLORS: Record<string, string> = {
  idle_resources: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rightsizing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  unused_commitments: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  orphaned_storage: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  oversized_instances: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const PROVIDER_COLORS: Record<string, string> = {
  aws: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  gcp: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  azure: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export default function WasteScannerPage() {
  const { currentOrgId } = useAppStore();
  const [results, setResults] = useState<WasteResult[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalMonthlyWaste: 0,
    openCount: 0,
    criticalCount: 0,
    highCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Filters
  const [scanTypeFilter, setScanTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchResults = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scanTypeFilter !== 'all') params.set('scan_type', scanTypeFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (providerFilter !== 'all') params.set('provider', providerFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(
        `/api/orgs/${currentOrgId}/waste-scanner/results?${params}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setSummary(data.summary);
        if (data.results.length > 0) {
          setLastScan(data.results[0].createdAt);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, scanTypeFilter, severityFilter, providerFilter, statusFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  async function runScan() {
    if (!currentOrgId) return;
    setScanning(true);
    try {
      const res = await fetch(
        `/api/orgs/${currentOrgId}/waste-scanner/run`,
        { method: 'POST' }
      );
      if (res.ok) {
        await fetchResults();
      }
    } catch {
      // silently fail
    } finally {
      setScanning(false);
    }
  }

  async function updateStatus(resultId: string, newStatus: string) {
    if (!currentOrgId) return;
    setUpdatingId(resultId);
    try {
      const res = await fetch(
        `/api/orgs/${currentOrgId}/waste-scanner/results/${resultId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        await fetchResults();
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Waste Scanner</h1>
              <p className="text-slate-500 mt-1">
                Identify and eliminate wasted cloud spend across your infrastructure.
              </p>
            </div>
            <PageHelp
              title="About Waste Scanner"
              description="The Waste Scanner analyzes your cost data to find idle resources, rightsizing opportunities, unused commitments, and orphaned storage. Click 'Run Scan' to generate fresh findings."
              steps={[
                "Click 'Run Scan' to analyze all connected cloud accounts.",
                "Review findings grouped by scan type (idle, rightsizing, etc.).",
                "Filter by severity, provider, or status to prioritize action.",
                "Dismiss false positives or mark resolved items.",
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            {lastScan && (
              <span className="text-xs text-slate-500">
                Last scan: {new Date(lastScan).toLocaleString()}
              </span>
            )}
            <Button
              onClick={runScan}
              disabled={scanning}
              className="bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-semibold"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Monthly Waste
            </p>
            <p className="text-2xl font-display font-bold text-red-400 mt-1">
              {formatCurrency(summary.totalMonthlyWaste)}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Critical Findings
            </p>
            <p className="text-2xl font-display font-bold text-red-400 mt-1">
              {summary.criticalCount}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              High Findings
            </p>
            <p className="text-2xl font-display font-bold text-orange-400 mt-1">
              {summary.highCount}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Open Findings
            </p>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {summary.openCount}
            </p>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={scanTypeFilter} onValueChange={setScanTypeFilter}>
            <SelectTrigger className="w-[200px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Scan Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scan Types</SelectItem>
              <SelectItem value="idle_resources">Idle Resources</SelectItem>
              <SelectItem value="rightsizing">Rightsizing</SelectItem>
              <SelectItem value="unused_commitments">Unused Commitments</SelectItem>
              <SelectItem value="orphaned_storage">Orphaned Storage</SelectItem>
              <SelectItem value="oversized_instances">Oversized Instances</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[150px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="gcp">GCP</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No waste findings</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Run a scan to detect wasted spend across your cloud infrastructure.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scan Type</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Waste</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommendation</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <span className="text-white font-mono text-xs">{r.resourceId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={`text-[10px] uppercase ${PROVIDER_COLORS[r.provider] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {r.provider}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.service}</td>
                    <td className="py-3 px-3 text-slate-400">{r.region || '-'}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={`text-[10px] ${SCAN_TYPE_COLORS[r.scanType] || ''}`}>
                        {SCAN_TYPE_LABELS[r.scanType] || r.scanType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-red-400 font-display font-bold text-base">
                        {formatCurrency(r.monthlyWasteCost)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-300 text-xs leading-relaxed line-clamp-2 max-w-xs">
                        {r.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={`text-[10px] uppercase ${SEVERITY_COLORS[r.severity] || ''}`}>
                        {r.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium capitalize ${
                        r.status === 'open' ? 'text-amber-400' :
                        r.status === 'resolved' ? 'text-emerald-400' :
                        'text-slate-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {r.status === 'open' && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-400 hover:text-amber-400"
                            onClick={() => updateStatus(r.id, 'dismissed')}
                            disabled={updatingId === r.id}
                          >
                            {updatingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3 mr-1" />}
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-400 hover:text-emerald-400"
                            onClick={() => updateStatus(r.id, 'resolved')}
                            disabled={updatingId === r.id}
                          >
                            {updatingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                            Resolve
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
