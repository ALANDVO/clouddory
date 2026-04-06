'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, Database, Globe, Cpu, LayoutDashboard } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleGate from '@/components/shared/ModuleGate';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAppStore } from '@/stores/app-store';

// ---- Helpers ----

function formatCurrency(n: number) {
  // Show more decimals for tiny amounts so $0.0004 doesn't show as $0.00
  const decimals = Math.abs(n) < 0.01 && n !== 0 ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function serviceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('s3') || lower.includes('rds') || lower.includes('storage') || lower.includes('bigquery') || lower.includes('database')) return Database;
  if (lower.includes('cloudfront') || lower.includes('cdn') || lower.includes('route53') || lower.includes('dns')) return Globe;
  if (lower.includes('lambda') || lower.includes('function') || lower.includes('compute')) return Cpu;
  return Server;
}

// ---- Custom Tooltip ----

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string }>; label?: string }) {
  if (!active || !payload || !label) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/95 backdrop-blur-sm p-3 shadow-2xl shadow-black/50">
      <p className="text-xs text-slate-400 mb-1">{formatDate(label)}</p>
      <p className="text-sm font-display font-bold text-white">{formatCurrency(payload[0]?.value || 0)}</p>
    </div>
  );
}

// ---- Types ----

interface CostRecord {
  id: string;
  date: string;
  service: string;
  region: string | null;
  resourceType: string | null;
  cost: number;
  source: string;
  team: string | null;
  environment: string | null;
  usage: number | null;
  usageUnit: string | null;
  model: string | null;
}

// Human-readable explanations for AWS usage types
const USAGE_TYPE_LABELS: Record<string, string> = {
  'HostedZone': 'Hosted DNS Zone — monthly fee per hosted zone',
  'DNS-Queries': 'DNS Queries — charged per million queries',
  'ResolverNetworkInterface': 'Route 53 Resolver — DNS resolution endpoint',
  'HealthCheck': 'Health Checks — monitoring endpoint availability',
  'HealthCheck-HTTPS': 'HTTPS Health Checks — SSL endpoint monitoring',
  'Alias-Queries': 'Alias Record Queries — queries to alias records',
  'RegisteredDomain': 'Domain Registration — annual domain name fee',
  'TransferDomain': 'Domain Transfer — domain transfer fee',
  'USE1-HostedZone': 'Hosted Zone (US East 1)',
  'USE1-DNS-Queries': 'DNS Queries (US East 1)',
  // EC2
  'BoxUsage': 'EC2 Instance Hours — compute time',
  'EBS:VolumeUsage': 'EBS Storage — persistent block storage',
  'DataTransfer-Out-Bytes': 'Data Transfer Out — egress bandwidth',
  'DataTransfer-In-Bytes': 'Data Transfer In — ingress bandwidth',
  'NatGateway-Hours': 'NAT Gateway — managed network translation',
  'LoadBalancerUsage': 'Load Balancer — traffic distribution',
  // S3
  'TimedStorage-ByteHrs': 'S3 Storage — data stored per hour',
  'Requests-Tier1': 'S3 PUT/POST Requests',
  'Requests-Tier2': 'S3 GET Requests',
  // RDS
  'InstanceUsage': 'RDS Instance Hours — database compute',
  'StorageUsage': 'RDS Storage — database disk space',
  'BackupUsage': 'RDS Backup Storage',
  // Lambda
  'Lambda-GB-Second': 'Lambda Compute — memory x time',
  'Request': 'Lambda Requests — function invocations',
};

function explainUsageType(usageType: string | null): { label: string; description: string } {
  if (!usageType) return { label: 'General Usage', description: 'Service-level cost' };

  // Try direct match
  for (const [key, desc] of Object.entries(USAGE_TYPE_LABELS)) {
    if (usageType.includes(key)) return { label: key.replace(/-/g, ' '), description: desc };
  }

  // Parse common patterns
  if (usageType.includes('HostedZone')) return { label: 'Hosted Zone', description: 'Monthly fee per DNS hosted zone' };
  if (usageType.includes('Queries')) return { label: 'DNS Queries', description: 'Charged per million DNS queries resolved' };
  if (usageType.includes('DataTransfer')) return { label: 'Data Transfer', description: 'Network data transfer charges' };
  if (usageType.includes('Storage')) return { label: 'Storage', description: 'Data storage charges' };
  if (usageType.includes('Request')) return { label: 'API Requests', description: 'Per-request charges' };

  // Fallback: clean up the usage type string
  const cleaned = usageType
    .replace(/^[A-Z]{2,3}\d?-/, '') // Remove region prefix like USE1-
    .replace(/-/g, ' ');
  return { label: cleaned, description: usageType };
}

interface DayData {
  date: string;
  cost: number;
}

export default function ServiceDrilldownPage() {
  const params = useParams();
  const slug = params.service as string;
  const { currentOrgId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  // Derive service display name from slug
  const serviceName = decodeURIComponent(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const Icon = serviceIcon(serviceName);

  const fetchData = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orgs/${currentOrgId}/spend?service=${encodeURIComponent(serviceName)}`
      );
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records ?? []);
        setTotal(data.total ?? 0);
        setRecordCount(data.recordCount ?? 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, serviceName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build daily trend from records
  const trendData: DayData[] = (() => {
    const dayMap = new Map<string, number>();
    for (const r of records) {
      const dateStr = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + r.cost);
    }
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }));
  })();

  const dailyAvg = trendData.length > 0 ? total / trendData.length : 0;

  // Build region/resource breakdown from records
  const regionBreakdown = (() => {
    const regionMap = new Map<string, { cost: number; count: number }>();
    for (const r of records) {
      const region = r.region || 'global';
      const existing = regionMap.get(region);
      if (existing) {
        existing.cost += r.cost;
        existing.count += 1;
      } else {
        regionMap.set(region, { cost: r.cost, count: 1 });
      }
    }
    return Array.from(regionMap.entries())
      .map(([region, data]) => ({ region, ...data }))
      .sort((a, b) => b.cost - a.cost);
  })();

  // Determine provider from records
  const provider = records.length > 0 ? (records[0].source || 'unknown').toUpperCase() : '';

  if (loading) {
    return (
      <ModuleGate module="finops">
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner className="w-8 h-8 text-cyan-400" />
        </div>
      </ModuleGate>
    );
  }

  if (records.length === 0) {
    return (
      <ModuleGate module="finops">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
              <Link href="/costs">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">{serviceName}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Cost drill-down</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <LayoutDashboard className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No data found</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              No cost records found for this service. Data will appear after your cloud accounts sync.
            </p>
            <Link href="/costs">
              <Button variant="outline">Back to Cost Explorer</Button>
            </Link>
          </div>
        </div>
      </ModuleGate>
    );
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
            <Link href="/costs">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-800 border border-white/5 flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">{serviceName}</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {provider ? `${provider} / ` : ''}Cost analysis / {recordCount} records
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Total Spend</p>
            <p className="text-2xl font-display font-bold text-white">{formatCurrency(total)}</p>
            <p className="text-[10px] text-slate-500 mt-2">{recordCount} cost records</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Daily Average</p>
            <p className="text-2xl font-display font-bold text-white">{formatCurrency(dailyAvg)}</p>
            <p className="text-[10px] text-slate-500 mt-2">{trendData.length} day{trendData.length !== 1 ? 's' : ''} of data</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Regions</p>
            <p className="text-2xl font-display font-bold text-white">{regionBreakdown.length}</p>
            <p className="text-[10px] text-slate-500 mt-2">Active regions</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Top Region</p>
            <p className="text-sm font-display font-bold text-white truncate">{regionBreakdown[0]?.region || '-'}</p>
            <p className="text-xl font-display font-bold text-cyan-400 mt-0.5">{formatCurrency(regionBreakdown[0]?.cost || 0)}</p>
          </Card>
        </div>

        {/* Trend Chart */}
        {trendData.length > 1 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-display font-semibold text-white">Cost Trend</h3>
              <span className="text-xs text-slate-400">Daily spend over time</span>
            </div>
            <div className="bg-navy-950/30 rounded-xl border border-white/[0.03] p-2">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={formatDate}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cost" stroke="#06b6d4" fill="url(#costGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Region Breakdown Table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-display font-semibold text-white">Region Breakdown</h3>
              <Badge variant="secondary" className="text-[10px]">{regionBreakdown.length} region{regionBreakdown.length !== 1 ? 's' : ''}</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Region</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Records</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Cost</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">% of Service</th>
                </tr>
              </thead>
              <tbody>
                {regionBreakdown.map((row) => {
                  const pct = total > 0 ? (row.cost / total) * 100 : 0;
                  return (
                    <tr key={row.region} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm text-white font-medium">{row.region}</span>
                      </td>
                      <td className="text-right px-4 py-3">
                        <span className="text-sm text-slate-400">{row.count}</span>
                      </td>
                      <td className="text-right px-4 py-3">
                        <span className="text-sm font-display font-semibold text-white">{formatCurrency(row.cost)}</span>
                      </td>
                      <td className="text-right px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-500/60 transition-all"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-400 w-10 text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* What You're Paying For — by usage type */}
        {(() => {
          const usageMap = new Map<string, { cost: number; count: number; usage: number }>();
          for (const r of records) {
            const key = r.resourceType || 'general';
            const existing = usageMap.get(key);
            if (existing) {
              existing.cost += r.cost;
              existing.count += 1;
              existing.usage += r.usage || 0;
            } else {
              usageMap.set(key, { cost: r.cost, count: 1, usage: r.usage || 0 });
            }
          }
          const usageBreakdown = Array.from(usageMap.entries())
            .map(([type, data]) => ({ type, ...data, ...explainUsageType(type) }))
            .sort((a, b) => b.cost - a.cost);

          return usageBreakdown.length > 0 && !(usageBreakdown.length === 1 && usageBreakdown[0].type === 'general') ? (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-sm font-display font-semibold text-white">What You&apos;re Paying For</h3>
                  <Badge className="text-[10px]">{usageBreakdown.length} cost categories</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">What It Is</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Records</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Cost</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">% of Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageBreakdown.map((row) => {
                      const pct = total > 0 ? (row.cost / total) * 100 : 0;
                      return (
                        <tr key={row.type} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-white">{row.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">{row.description}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-xs text-slate-400">{row.count}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className={`text-sm font-display font-semibold ${row.cost > 1 ? 'text-amber-400' : 'text-white'}`}>
                              {formatCurrency(row.cost)}
                            </span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                                <div className="h-full rounded-full bg-cyan-500/60" style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className="text-xs font-medium text-slate-400 w-10 text-right">{pct.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null;
        })()}

        {/* Monthly Summary */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-display font-semibold text-white">Monthly Breakdown</h3>
              <Badge variant="secondary" className="text-[10px]">{records.length} records</Badge>
            </div>
            <p className="text-xs text-slate-500">Aggregated by month</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Month</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Region</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Days</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Daily Avg</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Cost</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Aggregate records by month — count UNIQUE days, not records
                  const monthMap = new Map<string, { cost: number; dates: Set<string>; region: string }>();
                  for (const r of records) {
                    const dateStr = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
                    const monthKey = dateStr.slice(0, 7); // YYYY-MM
                    const existing = monthMap.get(monthKey);
                    if (existing) {
                      existing.cost += r.cost;
                      existing.dates.add(dateStr);
                    } else {
                      monthMap.set(monthKey, { cost: r.cost, dates: new Set([dateStr]), region: r.region || 'global' });
                    }
                  }
                  return Array.from(monthMap.entries())
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, data]) => {
                      const days = data.dates.size;
                      const pct = total > 0 ? (data.cost / total) * 100 : 0;
                      const monthLabel = new Date(month + '-01T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                      return (
                        <tr key={month} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-white">{monthLabel}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">{data.region}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-xs text-slate-400">{days}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-xs font-mono text-slate-400">{formatCurrency(days > 0 ? data.cost / days : 0)}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className={`text-sm font-display font-semibold ${data.cost > 1 ? 'text-amber-400' : 'text-white'}`}>
                              {formatCurrency(data.cost)}
                            </span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                                <div className="h-full rounded-full bg-cyan-500/60" style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className="text-xs font-medium text-slate-400 w-10 text-right">{pct.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ModuleGate>
  );
}
