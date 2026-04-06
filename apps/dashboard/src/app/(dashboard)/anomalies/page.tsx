'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Activity,
  Zap,
  TrendingUp,
  Check,
  Eye,
  Loader2,
  Settings2,
  Save,
  Share2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ModuleGate from '@/components/shared/ModuleGate';
import PageHelp from '@/components/shared/PageHelp';
import { useAppStore } from '@/stores/app-store';

interface AnomalyRecord {
  id: string;
  resourceId: string;
  provider: string;
  service: string;
  team: string | null;
  region: string | null;
  expectedCost: number;
  actualCost: number;
  deviationPct: number;
  severity: string;
  status: string;
  detectedAt: string;
}

interface AnomalySummary {
  activeCount: number;
  totalExtraSpend: number;
  thisWeekCount: number;
  avgDeviationPct: number;
}

interface OrgMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

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

const STATUS_COLORS: Record<string, string> = {
  open: 'text-amber-400',
  acknowledged: 'text-blue-400',
  resolved: 'text-emerald-400',
};

const THRESHOLD_STORAGE_KEY = 'clouddory_anomaly_threshold';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

function serviceToSlug(service: string) {
  return service.toLowerCase().replace(/[\s.]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function AnomaliesPage() {
  const { currentOrgId } = useAppStore();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [summary, setSummary] = useState<AnomalySummary>({
    activeCount: 0,
    totalExtraSpend: 0,
    thisWeekCount: 0,
    avgDeviationPct: 0,
  });
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  // Threshold state
  const [threshold, setThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THRESHOLD_STORAGE_KEY);
      return saved ? Number(saved) : 20;
    }
    return 20;
  });
  const [thresholdSaved, setThresholdSaved] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareAnomaly, setShareAnomaly] = useState<AnomalyRecord | null>(null);
  const [shareTargetUserId, setShareTargetUserId] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareSending, setShareSending] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchAnomalies = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (providerFilter !== 'all') params.set('provider', providerFilter);

      const res = await fetch(`/api/orgs/${currentOrgId}/anomalies?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAnomalies(data.anomalies);
        setSummary(data.summary);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, statusFilter, severityFilter, providerFilter]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  // Fetch org members when share dialog opens
  const fetchMembers = useCallback(async () => {
    if (!currentOrgId) return;
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/orgs/${currentOrgId}/members`);
      if (res.ok) {
        const data = await res.json();
        setOrgMembers(data);
      }
    } catch {
      // silently fail
    } finally {
      setMembersLoading(false);
    }
  }, [currentOrgId]);

  function saveThreshold() {
    localStorage.setItem(THRESHOLD_STORAGE_KEY, String(threshold));
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2000);
  }

  async function runDetection() {
    if (!currentOrgId) return;
    setDetecting(true);
    try {
      const res = await fetch(
        `/api/orgs/${currentOrgId}/anomalies/detect`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threshold }),
        }
      );
      if (res.ok) {
        await fetchAnomalies();
      }
    } catch {
      // silently fail
    } finally {
      setDetecting(false);
    }
  }

  async function updateStatus(anomalyId: string, newStatus: string) {
    if (!currentOrgId) return;
    setUpdatingId(anomalyId);
    try {
      const res = await fetch(
        `/api/orgs/${currentOrgId}/anomalies/${anomalyId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        await fetchAnomalies();
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  }

  function openShareDialog(anomaly: AnomalyRecord) {
    setShareAnomaly(anomaly);
    setShareTargetUserId('');
    setShareMessage('');
    setShareSuccess(false);
    setShareDialogOpen(true);
    fetchMembers();
  }

  async function sendShare() {
    if (!currentOrgId || !shareAnomaly || !shareTargetUserId) return;
    setShareSending(true);
    try {
      const res = await fetch(`/api/orgs/${currentOrgId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: shareTargetUserId,
          type: 'anomaly_share',
          title: `Anomaly flagged: ${shareAnomaly.service} (+${shareAnomaly.deviationPct}%)`,
          body: shareMessage || `An anomaly was shared with you for ${shareAnomaly.service} (${shareAnomaly.provider.toUpperCase()}). Deviation: +${shareAnomaly.deviationPct}%, actual cost: ${formatCurrency(shareAnomaly.actualCost)} vs expected ${formatCurrency(shareAnomaly.expectedCost)}.`,
        }),
      });
      if (res.ok) {
        setShareSuccess(true);
        setTimeout(() => {
          setShareDialogOpen(false);
          setShareSuccess(false);
        }, 1500);
      }
    } catch {
      // silently fail
    } finally {
      setShareSending(false);
    }
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">SpikeSentry</h1>
              <p className="text-slate-500 mt-1">
                AI-powered anomaly detection for unusual cloud spending patterns.
              </p>
            </div>
            <PageHelp
              title="About Anomaly Detection"
              description="The Anomaly Detector compares your recent spending (last 7 days) against your historical average (8-30 days ago). Services that exceed your deviation threshold get flagged so you can investigate."
              steps={[
                'Configure a deviation threshold (default 20%) in the Config panel.',
                'Click "Detect Now" to scan for anomalies across all connected cloud accounts.',
                'Review flagged services and acknowledge or resolve each finding.',
                'Share anomalies with teammates for collaborative investigation.',
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-white/10 hover:border-cyan-500/30"
              onClick={() => setConfigOpen(!configOpen)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Config
            </Button>
            <Button
              onClick={runDetection}
              disabled={detecting}
              className="bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-semibold"
            >
              {detecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Detect Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Anomalies
            </p>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {summary.activeCount}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Extra Spend
            </p>
            <p className="text-2xl font-display font-bold text-red-400 mt-1">
              {formatCurrency(summary.totalExtraSpend)}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Anomalies This Week
            </p>
            <p className="text-2xl font-display font-bold text-amber-400 mt-1">
              {summary.thisWeekCount}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Deviation
            </p>
            <p className="text-2xl font-display font-bold text-orange-400 mt-1">
              {summary.avgDeviationPct}%
            </p>
          </Card>
        </div>

        {/* Config Section (collapsible) */}
        {configOpen && (
          <Card className="bg-navy-900 border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Detection Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Deviation Threshold (%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="bg-navy-800 border-white/10 w-32"
                    min={1}
                    max={500}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:border-cyan-500/30"
                    onClick={saveThreshold}
                  >
                    {thresholdSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        <span className="text-emerald-400">Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Flag costs that deviate more than this percentage from the baseline.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Providers to Monitor
                </label>
                <div className="flex flex-wrap gap-3">
                  {['AWS', 'GCP', 'Azure'].map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-white/20 bg-navy-800 text-cyan-500 focus:ring-cyan-500/30" />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
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
        </div>

        {/* Anomaly Cards */}
        {loading || detecting ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            {detecting && (
              <p className="text-sm text-slate-500 mt-3">Running anomaly detection...</p>
            )}
          </div>
        ) : anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No anomalies detected</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Run detection to analyze your cloud spend for unusual patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {anomalies.map((a) => (
              <Card key={a.id} className="bg-navy-900 border-white/5 p-5 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] uppercase ${PROVIDER_COLORS[a.provider] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {a.provider}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] uppercase ${SEVERITY_COLORS[a.severity] || ''}`}>
                      {a.severity}
                    </Badge>
                    <span className={`text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'text-slate-400'}`}>
                      {a.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(a.detectedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-white font-mono text-sm mb-1">{a.resourceId}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <Link
                    href={`/costs/${serviceToSlug(a.service)}`}
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                  >
                    {a.service}
                  </Link>
                  {a.team && <span>Team: {a.team}</span>}
                  {a.region && <span>{a.region}</span>}
                </div>

                {/* Cost comparison */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-navy-800 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500 uppercase mb-1">Expected</p>
                    <p className="text-sm font-display font-bold text-slate-300">
                      {formatCurrency(a.expectedCost)}
                    </p>
                  </div>
                  <div className="bg-navy-800 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500 uppercase mb-1">Actual</p>
                    <p className="text-sm font-display font-bold text-red-400">
                      {formatCurrency(a.actualCost)}
                    </p>
                  </div>
                  <div className="bg-navy-800 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500 uppercase mb-1">Deviation</p>
                    <p className="text-sm font-display font-bold text-orange-400">
                      +{a.deviationPct}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  {a.status === 'open' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs text-slate-400 hover:text-blue-400"
                        onClick={() => updateStatus(a.id, 'acknowledged')}
                        disabled={updatingId === a.id}
                      >
                        {updatingId === a.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs text-slate-400 hover:text-emerald-400"
                        onClick={() => updateStatus(a.id, 'resolved')}
                        disabled={updatingId === a.id}
                      >
                        {updatingId === a.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                        Resolve
                      </Button>
                    </>
                  )}
                  {a.status === 'acknowledged' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-xs text-slate-400 hover:text-emerald-400"
                      onClick={() => updateStatus(a.id, 'resolved')}
                      disabled={updatingId === a.id}
                    >
                      {updatingId === a.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                      Resolve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs text-slate-400 hover:text-cyan-400 ml-auto"
                    onClick={() => openShareDialog(a)}
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Share Anomaly Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Anomaly</DialogTitle>
              <DialogDescription>
                Notify a teammate about this anomaly so they can investigate.
              </DialogDescription>
            </DialogHeader>

            {shareAnomaly && (
              <div className="bg-navy-800 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] uppercase ${PROVIDER_COLORS[shareAnomaly.provider] || ''}`}>
                    {shareAnomaly.provider}
                  </Badge>
                  <span className="text-sm font-medium text-white">{shareAnomaly.service}</span>
                </div>
                <p className="text-xs text-slate-400">
                  +{shareAnomaly.deviationPct}% deviation &middot; {formatCurrency(shareAnomaly.actualCost)} actual vs {formatCurrency(shareAnomaly.expectedCost)} expected
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Send to</label>
                {membersLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading teammates...
                  </div>
                ) : (
                  <Select value={shareTargetUserId} onValueChange={setShareTargetUserId}>
                    <SelectTrigger className="bg-navy-800 border-white/10 text-sm">
                      <SelectValue placeholder="Select a teammate" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgMembers.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>
                          {m.user.name || m.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Message (optional)</label>
                <Textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add context or next steps..."
                  className="bg-navy-800 border-white/10 text-sm resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={sendShare}
                disabled={!shareTargetUserId || shareSending || shareSuccess}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-semibold"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Shared!
                  </>
                ) : shareSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Share Anomaly
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGate>
  );
}
