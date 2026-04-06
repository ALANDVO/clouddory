'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Receipt,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
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

interface CommitmentRecord {
  id: string;
  provider: string;
  commitmentType: string;
  service: string;
  region: string | null;
  term: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  usedCost: number;
  coveragePct: number;
}

interface CommitmentSummary {
  totalCommitted: number;
  overallUtilization: number;
  expiringIn90Days: number;
  activeCount: number;
}

const TYPE_LABELS: Record<string, string> = {
  ri: 'Reserved Instance',
  savings_plan: 'Savings Plan',
  cud: 'Committed Use Discount',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  ri: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  savings_plan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  cud: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type SortKey = 'provider' | 'commitmentType' | 'service' | 'endDate' | 'totalCost' | 'coveragePct';

export default function CommitmentsPage() {
  const { currentOrgId } = useAppStore();
  const [commitments, setCommitments] = useState<CommitmentRecord[]>([]);
  const [summary, setSummary] = useState<CommitmentSummary>({
    totalCommitted: 0,
    overallUtilization: 0,
    expiringIn90Days: 0,
    activeCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [providerFilter, setProviderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('endDate');
  const [sortAsc, setSortAsc] = useState(true);

  const fetchCommitments = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (providerFilter !== 'all') params.set('provider', providerFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(
        `/api/orgs/${currentOrgId}/commitments?${params}`
      );
      if (res.ok) {
        const data = await res.json();
        setCommitments(data.commitments);
        setSummary(data.summary);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, providerFilter, typeFilter, statusFilter]);

  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  const sorted = useMemo(() => {
    const arr = [...commitments];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'endDate') {
        cmp = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else if (sortKey === 'totalCost') {
        cmp = a.totalCost - b.totalCost;
      } else if (sortKey === 'coveragePct') {
        cmp = a.coveragePct - b.coveragePct;
      } else {
        cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [commitments, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  function utilizationColor(pct: number) {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function utilizationTextColor(pct: number) {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Commitment Tracker</h1>
              <p className="text-slate-500 mt-1">
                Track Reserved Instances, Savings Plans, and Committed Use Discounts.
              </p>
            </div>
            <PageHelp
              title="About Commitment Tracker"
              description="Track your Reserved Instances, Savings Plans, and Committed Use Discounts. Monitor utilization rates and get alerts when commitments are expiring."
              steps={[
                "Connect your cloud accounts to automatically import commitments.",
                "Monitor utilization rates — green (80%+), amber (50-80%), red (below 50%).",
                "Watch for 'Expiring Soon' badges on commitments ending within 90 days.",
                "Use the Audit Log to review changes to your commitment portfolio.",
              ]}
            />
          </div>
          <Link href="/commitments/audit">
            <Button variant="outline" className="border-white/10 hover:border-cyan-500/30">
              <Calendar className="w-4 h-4 mr-2" />
              Audit Log
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Committed
            </p>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {formatCurrency(summary.totalCommitted)}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Overall Utilization
            </p>
            <p className={`text-2xl font-display font-bold mt-1 ${utilizationTextColor(summary.overallUtilization)}`}>
              {summary.overallUtilization}%
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expiring in 90 Days
            </p>
            <p className="text-2xl font-display font-bold text-amber-400 mt-1">
              {summary.expiringIn90Days}
            </p>
          </Card>
          <Card className="bg-navy-900 border-white/5 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Commitments
            </p>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {summary.activeCount}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ri">Reserved Instance</SelectItem>
              <SelectItem value="savings_plan">Savings Plan</SelectItem>
              <SelectItem value="cud">CUD</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-navy-800 border-white/10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Receipt className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No commitments found</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Connect your cloud accounts to track Reserved Instances and Savings Plans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('provider')}>
                    <span className="flex items-center gap-1">Provider <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('commitmentType')}>
                    <span className="flex items-center gap-1">Type <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('service')}>
                    <span className="flex items-center gap-1">Service <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Term</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('endDate')}>
                    <span className="flex items-center gap-1">End <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('totalCost')}>
                    <span className="flex items-center justify-end gap-1">Total Cost <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Used</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => toggleSort('coveragePct')}>
                    <span className="flex items-center gap-1">Utilization <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => {
                  const endDate = new Date(c.endDate);
                  const isExpiringSoon = endDate <= in90Days && endDate >= now;
                  const isExpired = endDate < now;

                  return (
                    <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={`text-[10px] uppercase ${PROVIDER_COLORS[c.provider] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                          {c.provider}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={`text-[10px] ${TYPE_BADGE_COLORS[c.commitmentType] || ''}`}>
                          {TYPE_LABELS[c.commitmentType] || c.commitmentType}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{c.service}</td>
                      <td className="py-3 px-3 text-slate-400">{c.region || '-'}</td>
                      <td className="py-3 px-3 text-slate-300">{c.term}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(c.startDate)}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(c.endDate)}</td>
                      <td className="py-3 px-3 text-right text-white font-medium">{formatCurrency(c.totalCost)}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(c.usedCost)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-navy-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${utilizationColor(c.coveragePct)}`}
                              style={{ width: `${Math.min(c.coveragePct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${utilizationTextColor(c.coveragePct)}`}>
                            {c.coveragePct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isExpired ? (
                          <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                            Expired
                          </Badge>
                        ) : isExpiringSoon ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Active
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
