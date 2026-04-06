'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Filter,
  Plus,
  X,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Sparkles,
  Calendar,
  Eye,
  LayoutDashboard,
  Save,
  FolderOpen,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  AreaChart as AreaChartIcon,
  ArrowUpDown,
  Columns,
  Table2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// ─── CHART COLORS ──────────────────────────────────────────────
const CHART_COLORS = [
  '#06b6d4', // cyan-500
  '#a855f7', // purple-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#94a3b8', // slate-400 (Others)
];

// ─── TYPES ─────────────────────────────────────────────────────
type DatePreset = '7d' | '30d' | '60d' | '90d' | 'ytd' | 'custom';
type Aggregation = 'daily' | 'weekly' | 'monthly';
type ViewMode = 'cost' | 'usage';
type ChartType = 'bar' | 'stacked-bar' | 'line' | 'area' | 'stacked-area';
type GroupBy = 'service' | 'region' | 'account' | 'provider' | 'tag' | string;
type SortField = 'name' | 'total' | 'percent' | 'dailyAvg' | 'prevPeriod' | 'change';
type SortDir = 'asc' | 'desc';
type ChartDataPoint = Record<string, string | number>;

interface ActiveFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SpendRecord {
  id: string;
  date: string;
  service: string;
  region: string | null;
  cost: number;
  source: string | null;
  team: string | null;
  environment: string | null;
  usage: number | null;
  usageUnit: string | null;
  model: string | null;
}

interface SpendResponse {
  total: number;
  totalUsage: number;
  recordCount: number;
  records: SpendRecord[];
  grouped: Record<string, number> | null;
}

// ─── HELPERS ───────────────────────────────────────────────────
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return formatCurrency(n);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getServiceSlug(name: string) {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

/** Compute date range start/end from a preset */
function getDateRange(preset: DatePreset, customStart?: string, customEnd?: string): { dateStart: string; dateEnd: string } {
  const today = new Date();
  const end = today.toISOString().split('T')[0];

  if (preset === 'custom' && customStart && customEnd) {
    return { dateStart: customStart, dateEnd: customEnd };
  }

  let daysBack = 30;
  if (preset === '7d') daysBack = 7;
  else if (preset === '30d') daysBack = 30;
  else if (preset === '60d') daysBack = 60;
  else if (preset === '90d') daysBack = 90;
  else if (preset === 'ytd') {
    const yearStart = `${today.getFullYear()}-01-01`;
    return { dateStart: yearStart, dateEnd: end };
  }

  const start = new Date(today);
  start.setDate(start.getDate() - daysBack);
  return { dateStart: start.toISOString().split('T')[0], dateEnd: end };
}

/** Build the previous period date range (same length, shifted back) */
function getPrevDateRange(dateStart: string, dateEnd: string): { dateStart: string; dateEnd: string } {
  const start = new Date(dateStart + 'T00:00:00');
  const end = new Date(dateEnd + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  return {
    dateStart: prevStart.toISOString().split('T')[0],
    dateEnd: prevEnd.toISOString().split('T')[0],
  };
}

/** Map group_by UI value to API field name */
function mapGroupByToApi(groupBy: string): string | null {
  if (groupBy === 'service') return 'service';
  if (groupBy === 'provider') return 'source';
  if (groupBy === 'region') return 'region';
  if (groupBy === 'team') return 'team';
  if (groupBy === 'account') return 'environment';
  if (groupBy === 'tag') return 'environment';
  return null;
}

// ─── CUSTOM TOOLTIP ────────────────────────────────────────────
function CustomChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !label) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/95 backdrop-blur-sm p-4 shadow-2xl shadow-black/50 min-w-[220px]">
      <p className="text-xs text-slate-400 mb-3 font-medium">{formatDate(label)}</p>
      <div className="space-y-2">
        {payload
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-slate-300 truncate">{entry.dataKey}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-display font-semibold text-white">{formatCurrency(entry.value)}</span>
                <span className="text-[10px] text-slate-500">{total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          ))}
      </div>
      <Separator className="my-2" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Total</span>
        <span className="text-sm font-display font-bold text-white">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

// ─── MINI SPARKLINE ────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── PAGE COMPONENT ────────────────────────────────────────────
interface AiTagOption {
  id: string;
  name: string;
}

export default function CostExplorerPage() {
  const { currentOrgId } = useAppStore();

  // AiTag options for Group By
  const [aiTagOptions, setAiTagOptions] = useState<AiTagOption[]>([]);

  useEffect(() => {
    if (!currentOrgId) return;
    (async () => {
      try {
        const res = await fetch(`/api/orgs/${currentOrgId}/aitags`);
        if (res.ok) {
          const data = await res.json();
          setAiTagOptions(data.map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch {
        // silently fail
      }
    })();
  }, [currentOrgId]);

  // State
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [aggregation, setAggregation] = useState<Aggregation>('daily');
  const [viewMode, setViewMode] = useState<ViewMode>('cost');
  const [chartType, setChartType] = useState<ChartType>('stacked-bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('service');
  const [showProjection, setShowProjection] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [aiFilterFocused, setAiFilterFocused] = useState(false);
  const [showDates, setShowDates] = useState(true);

  // Data state
  const [loading, setLoading] = useState(false);
  const [spendData, setSpendData] = useState<SpendResponse | null>(null);
  const [prevPeriodTotal, setPrevPeriodTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Computed date range
  const dateRange = useMemo(() => {
    return getDateRange(datePreset, customStartDate, customEndDate);
  }, [datePreset, customStartDate, customEndDate]);

  // Build query params from filters
  const buildQueryParams = useCallback((overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    params.set('date_start', dateRange.dateStart);
    params.set('date_end', dateRange.dateEnd);

    // Map groupBy to API field
    const apiGroupBy = mapGroupByToApi(groupBy);
    if (apiGroupBy) params.set('group_by', apiGroupBy);

    // Apply active filters as query params
    for (const f of activeFilters) {
      if (f.operator !== 'equals') continue; // API only supports exact match
      const fieldLower = f.field.toLowerCase();
      if (fieldLower === 'provider') params.set('source', f.value.toLowerCase());
      else if (fieldLower === 'region') params.set('region', f.value);
      else if (fieldLower === 'service') params.set('service', f.value);
      else if (fieldLower === 'team') params.set('team', f.value);
      else if (fieldLower === 'environment') params.set('environment', f.value);
      else if (fieldLower === 'account') params.set('environment', f.value);
    }

    // Apply overrides
    if (overrides) {
      for (const [k, v] of Object.entries(overrides)) {
        params.set(k, v);
      }
    }

    return params;
  }, [dateRange, groupBy, activeFilters]);

  // Fetch spend data
  useEffect(() => {
    if (!currentOrgId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Current period
        const params = buildQueryParams();
        const res = await fetch(`/api/orgs/${currentOrgId}/spend?${params.toString()}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: SpendResponse = await res.json();

        // Previous period for comparison
        const prevRange = getPrevDateRange(dateRange.dateStart, dateRange.dateEnd);
        const prevParams = new URLSearchParams();
        prevParams.set('date_start', prevRange.dateStart);
        prevParams.set('date_end', prevRange.dateEnd);
        // Copy filters
        for (const f of activeFilters) {
          if (f.operator !== 'equals') continue;
          const fieldLower = f.field.toLowerCase();
          if (fieldLower === 'provider') prevParams.set('source', f.value.toLowerCase());
          else if (fieldLower === 'region') prevParams.set('region', f.value);
          else if (fieldLower === 'service') prevParams.set('service', f.value);
          else if (fieldLower === 'team') prevParams.set('team', f.value);
          else if (fieldLower === 'environment') prevParams.set('environment', f.value);
          else if (fieldLower === 'account') prevParams.set('environment', f.value);
        }

        const prevRes = await fetch(`/api/orgs/${currentOrgId}/spend?${prevParams.toString()}`);
        let prevTotal = 0;
        if (prevRes.ok) {
          const prevData = await prevRes.json();
          prevTotal = prevData.total ?? 0;
        }

        if (!cancelled) {
          setSpendData(data);
          setPrevPeriodTotal(prevTotal);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch spend data');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [currentOrgId, buildQueryParams, dateRange, activeFilters]);

  // Process records into daily grouped data for the chart
  const dailyGroupedData = useMemo(() => {
    if (!spendData?.records?.length) return [];

    // Group records by date + service (or whichever dimension is groupBy)
    const dayMap: Record<string, Record<string, number>> = {};

    for (const rec of spendData.records) {
      const dateStr = typeof rec.date === 'string' ? rec.date.split('T')[0] : new Date(rec.date).toISOString().split('T')[0];
      let groupKey: string;
      if (groupBy === 'service') groupKey = rec.service || 'Unknown';
      else if (groupBy === 'provider') groupKey = rec.source || 'Unknown';
      else if (groupBy === 'region') groupKey = rec.region || 'Unknown';
      else if (groupBy === 'team') groupKey = rec.team || 'Unknown';
      else if (groupBy === 'account') groupKey = rec.environment || 'Unknown';
      else groupKey = rec.service || 'Unknown';

      if (!dayMap[dateStr]) dayMap[dateStr] = {};
      dayMap[dateStr][groupKey] = (dayMap[dateStr][groupKey] || 0) + rec.cost;
    }

    // Sort by date
    return Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, services]) => ({ date, services }));
  }, [spendData, groupBy]);

  // Aggregate data for chart
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!dailyGroupedData.length) return [];

    if (aggregation === 'daily') {
      return dailyGroupedData.map((d) => ({
        date: d.date,
        ...d.services,
      }));
    }

    if (aggregation === 'weekly') {
      const weeks: Record<string, Record<string, number>> = {};
      dailyGroupedData.forEach((d) => {
        const dt = new Date(d.date + 'T00:00:00');
        const weekStart = new Date(dt);
        weekStart.setDate(dt.getDate() - dt.getDay());
        const key = weekStart.toISOString().split('T')[0];
        if (!weeks[key]) weeks[key] = {};
        Object.entries(d.services).forEach(([svc, cost]) => {
          weeks[key][svc] = (weeks[key][svc] || 0) + cost;
        });
      });
      return Object.entries(weeks).map(([date, services]) => ({ date, ...services }));
    }

    // Monthly
    const months: Record<string, Record<string, number>> = {};
    dailyGroupedData.forEach((d) => {
      const key = d.date.slice(0, 7);
      if (!months[key]) months[key] = {};
      Object.entries(d.services).forEach(([svc, cost]) => {
        months[key][svc] = (months[key][svc] || 0) + cost;
      });
    });
    return Object.entries(months).map(([date, services]) => ({ date, ...services }));
  }, [dailyGroupedData, aggregation]);

  // Get active service/group names sorted by total cost (from grouped response or records)
  const activeServices = useMemo(() => {
    if (spendData?.grouped) {
      return Object.entries(spendData.grouped)
        .sort(([, a], [, b]) => b - a)
        .map(([name]) => name);
    }
    // Fallback: compute from records
    const totals: Record<string, number> = {};
    dailyGroupedData.forEach((d) => {
      Object.entries(d.services).forEach(([svc, cost]) => {
        totals[svc] = (totals[svc] || 0) + cost;
      });
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([name]) => name);
  }, [spendData, dailyGroupedData]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalCost = spendData?.total ?? 0;
    const numDays = dailyGroupedData.length || 1;
    const dailyAvg = totalCost / numDays;
    const projectedMonthly = dailyAvg * 30;
    const changePercent = prevPeriodTotal > 0 ? ((totalCost - prevPeriodTotal) / prevPeriodTotal) * 100 : 0;

    // Top service from grouped
    let topService = '-';
    let topServiceCost = 0;
    if (spendData?.grouped) {
      const top = Object.entries(spendData.grouped).sort(([, a], [, b]) => b - a)[0];
      if (top) {
        topService = top[0];
        topServiceCost = top[1];
      }
    }

    return { totalCost, dailyAvg, projectedMonthly, changePercent, topService, topServiceCost, numDays };
  }, [spendData, dailyGroupedData, prevPeriodTotal]);

  // Table data from grouped response
  const tableData = useMemo(() => {
    if (!spendData?.grouped) return [];

    const grandTotal = spendData.total || 1;
    const numDays = dailyGroupedData.length || 1;

    // Build daily data per group for sparklines
    const dailyByGroup: Record<string, number[]> = {};
    dailyGroupedData.forEach((d) => {
      Object.entries(d.services).forEach(([svc, cost]) => {
        if (!dailyByGroup[svc]) dailyByGroup[svc] = [];
        dailyByGroup[svc].push(cost);
      });
    });

    const rows = Object.entries(spendData.grouped).map(([name, total]) => {
      const percent = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
      const dailyAvg = total / numDays;
      // Estimate previous period per-service proportionally
      const prevPeriod = prevPeriodTotal > 0 ? (total / grandTotal) * prevPeriodTotal : 0;
      const change = prevPeriod > 0 ? ((total - prevPeriod) / prevPeriod) * 100 : 0;

      return {
        name,
        total,
        percent,
        dailyAvg,
        prevPeriod,
        change,
        dailyData: dailyByGroup[name] || [],
      };
    });

    // Sort
    rows.sort((a, b) => {
      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      if (sortField === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return rows;
  }, [spendData, dailyGroupedData, prevPeriodTotal, sortField, sortDir]);

  // Add filter
  const addFilter = useCallback(
    (field: string, value: string) => {
      const id = `${field}-${value}-${Date.now()}`;
      setActiveFilters((prev) => [...prev, { id, field, operator: 'equals', value }]);
    },
    []
  );

  const removeFilter = useCallback((id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Sort handler
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField]
  );

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (!spendData?.records?.length) return;
    const headers = ['Date', 'Service', 'Provider', 'Region', 'Team', 'Environment', 'Cost', 'Usage', 'Usage Unit'];
    const csvRows = [headers.join(',')];
    spendData.records.forEach((r) => {
      const row = [
        typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0],
        `"${r.service || ''}"`,
        `"${r.source || ''}"`,
        `"${r.region || ''}"`,
        `"${r.team || ''}"`,
        `"${r.environment || ''}"`,
        r.cost.toFixed(2),
        r.usage?.toFixed(2) ?? '',
        `"${r.usageUnit || ''}"`,
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clouddory-costs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [spendData]);

  // Chart component
  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-[420px] text-slate-500 text-sm">
          No data available for the selected period.
        </div>
      );
    }

    const topServices = activeServices.slice(0, 10);

    // For projection, add dashed line
    const projectionData = showProjection
      ? (() => {
          const last7 = chartData.slice(-7);
          const avgDaily: Record<string, number> = {};
          topServices.forEach((svc) => {
            avgDaily[svc] = last7.reduce((s, d) => s + (Number(d[svc]) || 0), 0) / Math.max(last7.length, 1);
          });
          const lastDate = new Date(chartData[chartData.length - 1]?.date + 'T00:00:00');
          const projDays = [];
          for (let i = 1; i <= 7; i++) {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + i);
            const entry: Record<string, number | string> = { date: d.toISOString().split('T')[0] };
            topServices.forEach((svc) => {
              entry[`${svc}_proj`] = Math.round(avgDaily[svc] * (1 + (Math.random() - 0.5) * 0.1) * 100) / 100;
            });
            projDays.push(entry);
          }
          return projDays;
        })()
      : [];

    const allData = showProjection ? [...chartData, ...projectionData] : chartData;

    const commonProps = {
      data: allData,
      margin: { top: 10, right: 10, left: 10, bottom: 0 },
    };

    const xAxisProps = {
      dataKey: 'date',
      tick: { fill: '#64748b', fontSize: 11 },
      tickFormatter: formatDate,
      axisLine: { stroke: 'rgba(255,255,255,0.05)' },
      tickLine: false,
    };

    const yAxisProps = {
      tick: { fill: '#64748b', fontSize: 11 },
      tickFormatter: (v: number) => formatCompact(v),
      axisLine: false,
      tickLine: false,
    };

    const gridProps = {
      strokeDasharray: '3 3',
      stroke: 'rgba(255,255,255,0.04)',
      vertical: false,
    };

    if (chartType === 'bar' || chartType === 'stacked-bar') {
      const isStacked = chartType === 'stacked-bar';
      return (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            {topServices.map((svc, i) => (
              <Bar
                key={svc}
                dataKey={svc}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stackId={isStacked ? 'stack' : undefined}
                radius={isStacked ? (i === topServices.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]) : [3, 3, 0, 0]}
                maxBarSize={isStacked ? 40 : 12}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={420}>
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomChartTooltip />} />
            {topServices.map((svc, i) => (
              <Line
                key={svc}
                type="monotone"
                dataKey={svc}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
              />
            ))}
            {showProjection &&
              topServices.slice(0, 3).map((svc, i) => (
                <Line
                  key={`${svc}_proj`}
                  type="monotone"
                  dataKey={`${svc}_proj`}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Area / Stacked Area
    const isStacked = chartType === 'stacked-area';
    return (
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart {...commonProps}>
          <defs>
            {topServices.map((svc, i) => (
              <linearGradient key={svc} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <RechartsTooltip content={<CustomChartTooltip />} />
          {topServices.map((svc, i) => (
            <Area
              key={svc}
              type="monotone"
              dataKey={svc}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#grad-${i})`}
              strokeWidth={2}
              stackId={isStacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Sort icon
  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3 h-3 inline-block ml-1 ${sortField === field ? 'text-cyan-400' : 'text-slate-600'}`}
    />
  );

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Cost Explorer</h1>
            <p className="text-slate-500 mt-1">Analyze and optimize your cloud spending across all providers.</p>
          </div>
          <div className="flex items-center gap-2">
            {spendData && (
              <Badge variant="outline" className="text-xs px-2 py-1 border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
                {spendData.recordCount} records
              </Badge>
            )}
          </div>
        </div>

        {/* ─── TOP CONTROLS BAR ───────────────────────────────── */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Presets */}
            <div className="flex items-center gap-1 rounded-lg bg-navy-950/50 border border-white/5 p-1">
              {(['7d', '30d', '60d', '90d', 'ytd'] as DatePreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDatePreset(preset)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    datePreset === preset
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {preset.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => setDatePreset('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  datePreset === 'custom'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Custom
              </button>
            </div>

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-36 h-8 text-xs"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span className="text-slate-500 text-xs">to</span>
                <Input
                  type="date"
                  className="w-36 h-8 text-xs"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Aggregation */}
            <div className="flex items-center gap-1 rounded-lg bg-navy-950/50 border border-white/5 p-1">
              {(['daily', 'weekly', 'monthly'] as Aggregation[]).map((agg) => (
                <button
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    aggregation === agg
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {agg}
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* View Mode */}
            <div className="flex items-center gap-1 rounded-lg bg-navy-950/50 border border-white/5 p-1">
              {(['cost', 'usage'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {mode === 'cost' ? '$ Cost' : 'Usage'}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Action Buttons */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  Save View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm text-slate-300">Save current view...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Load View
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">Saved Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-slate-300">EC2 Focus</DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300">GCP Overview</DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300">Monthly Trends</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Add to Dashboard
            </Button>
          </div>
        </Card>

        {/* ─── FILTER BAR ─────────────────────────────────────── */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />

            {/* Active filter chips */}
            {activeFilters.map((f) => (
              <Badge key={f.id} variant="default" className="gap-1.5 pl-2.5 pr-1.5 py-1">
                <span className="text-xs">
                  {f.field}: {f.value}
                </span>
                <button onClick={() => removeFilter(f.id)} className="hover:bg-white/10 rounded p-0.5 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {/* Add Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Filter
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs">Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem className="text-sm text-slate-300" onSelect={(e) => e.preventDefault()}>
                      Provider
                      <ChevronDown className="w-3 h-3 ml-auto" />
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                </DropdownMenu>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Provider', 'AWS')}>
                  Provider: AWS
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Provider', 'GCP')}>
                  Provider: GCP
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Provider', 'Azure')}>
                  Provider: Azure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Region', 'us-east-1')}>
                  Region: us-east-1
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Region', 'us-west-2')}>
                  Region: us-west-2
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Region', 'us-central1')}>
                  Region: us-central1
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Account', 'prod-main')}>
                  Account: prod-main
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Account', 'prod-west')}>
                  Account: prod-west
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-slate-300" onClick={() => addFilter('Account', 'gcp-proj-1')}>
                  Account: gcp-proj-1
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* AI Filter Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder="Describe what you want to see..."
                className="pl-9 h-8 text-xs bg-purple-500/5 border-purple-500/10 focus:border-purple-500/30 placeholder:text-slate-500"
                onFocus={() => setAiFilterFocused(true)}
                onBlur={() => setTimeout(() => setAiFilterFocused(false), 200)}
              />
              {aiFilterFocused && (
                <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-purple-500/20 bg-navy-900/95 backdrop-blur-sm p-3 shadow-xl shadow-black/50 text-xs text-purple-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-medium">AI-Powered Filtering</span>
                  </div>
                  <p className="text-slate-400">Coming Soon — Use natural language to filter your cost data.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ─── LOADING STATE ──────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
          </div>
        )}

        {/* ─── ERROR STATE ───────────────────────────────────── */}
        {error && !loading && (
          <Card className="p-8 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-2">Please try again or check your connection.</p>
          </Card>
        )}

        {/* ─── EMPTY STATE ───────────────────────────────────── */}
        {!loading && !error && spendData && spendData.recordCount === 0 && (
          <Card className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-white mb-2">No cost data yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Connect a cloud account to start seeing your spend data here. Cost records will appear once your accounts are synced.
            </p>
          </Card>
        )}

        {/* ─── DATA VIEWS (only when data is loaded) ─────────── */}
        {!loading && !error && spendData && spendData.recordCount > 0 && (
          <>
            {/* ─── SUMMARY CARDS ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Cost */}
              <Card className="p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-cyan-500/0 group-hover:ring-cyan-500/10 transition-all" />
                <div className="relative">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Total Cost</p>
                  <p className="text-3xl font-display font-bold text-white tracking-tight">{formatCurrency(summaryStats.totalCost)}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {summaryStats.changePercent > 0 ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />+{summaryStats.changePercent.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0.5 gap-0.5">
                        <ArrowDownRight className="w-3 h-3" />{summaryStats.changePercent.toFixed(1)}%
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-500">vs prev period</span>
                  </div>
                </div>
              </Card>

              {/* Daily Average */}
              <Card className="p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-purple-500/0 group-hover:ring-purple-500/10 transition-all" />
                <div className="relative">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Daily Average</p>
                  <p className="text-3xl font-display font-bold text-white tracking-tight">{formatCurrency(summaryStats.dailyAvg)}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{summaryStats.numDays} days analyzed</p>
                </div>
              </Card>

              {/* Projected Monthly */}
              <Card className="p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-amber-500/0 group-hover:ring-amber-500/10 transition-all" />
                <div className="relative">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Projected Monthly</p>
                  <p className="text-3xl font-display font-bold text-white tracking-tight">{formatCurrency(summaryStats.projectedMonthly)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400">Based on current trajectory</span>
                  </div>
                </div>
              </Card>

              {/* Top Service */}
              <Card className="p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-emerald-500/0 group-hover:ring-emerald-500/10 transition-all" />
                <div className="relative">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Top Service</p>
                  <p className="text-lg font-display font-bold text-white truncate">{summaryStats.topService}</p>
                  <p className="text-2xl font-display font-bold text-cyan-400 mt-0.5">{formatCurrency(summaryStats.topServiceCost)}</p>
                </div>
              </Card>
            </div>

            {/* ─── CHART SECTION ──────────────────────────────────── */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Chart Type Selector */}
                  <div className="flex items-center gap-1 rounded-lg bg-navy-950/50 border border-white/5 p-1">
                    {[
                      { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
                      { type: 'stacked-bar' as ChartType, icon: Layers, label: 'Stacked' },
                      { type: 'line' as ChartType, icon: LineChartIcon, label: 'Line' },
                      { type: 'area' as ChartType, icon: AreaChartIcon, label: 'Area' },
                      { type: 'stacked-area' as ChartType, icon: Layers, label: 'Stacked Area' },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                          chartType === type
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>

                  <Separator orientation="vertical" className="h-8" />

                  {/* Group By */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Group by</span>
                    <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="region">Region</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="provider">Provider</SelectItem>
                        <SelectItem value="tag">Tag</SelectItem>
                        {aiTagOptions.length > 0 && (
                          <div className="border-t border-white/5 mt-1 pt-1">
                            <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider">AiTags</div>
                          </div>
                        )}
                        {aiTagOptions.map((at) => (
                          <SelectItem key={at.id} value={`aitag:${at.id}`}>
                            AiTag: {at.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Trend Projection Toggle */}
                  <button
                    onClick={() => setShowProjection(!showProjection)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${
                      showProjection
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Projection
                  </button>
                </div>
              </div>

              {/* The Chart */}
              <div className="bg-navy-950/30 rounded-xl border border-white/[0.03] p-2">
                {renderChart()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 px-2">
                {activeServices.slice(0, 10).map((svc, i) => (
                  <div key={svc} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-slate-400">{svc}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ─── COST BREAKDOWN TABLE ───────────────────────────── */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-display font-semibold text-white">Cost Breakdown</h3>
                  <Badge variant="secondary" className="text-[10px]">{tableData.length} services</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDates(!showDates)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all ${
                      showDates ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Dates
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:bg-white/5 px-2.5 py-1.5 rounded-md transition-all">
                    <Columns className="w-3.5 h-3.5" />
                    Transpose
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th
                        className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Service <SortIcon field="name" />
                      </th>
                      <th
                        className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('total')}
                      >
                        Total Cost <SortIcon field="total" />
                      </th>
                      <th
                        className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('percent')}
                      >
                        % of Total <SortIcon field="percent" />
                      </th>
                      <th
                        className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('dailyAvg')}
                      >
                        Daily Avg <SortIcon field="dailyAvg" />
                      </th>
                      <th
                        className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('prevPeriod')}
                      >
                        Prev Period <SortIcon field="prevPeriod" />
                      </th>
                      <th
                        className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => handleSort('change')}
                      >
                        Change <SortIcon field="change" />
                      </th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => {
                      const color = CHART_COLORS[activeServices.indexOf(row.name) % CHART_COLORS.length] || '#94a3b8';
                      return (
                        <tr
                          key={row.name}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <Link href={`/costs/${getServiceSlug(row.name)}`} className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <div>
                                <span className="text-sm text-white font-medium group-hover:text-cyan-400 transition-colors">
                                  {row.name}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-sm font-display font-semibold text-white">{formatCurrency(row.total)}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${Math.min(row.percent, 100)}%`, backgroundColor: color }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-10 text-right">{row.percent.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-sm text-slate-300">{formatCurrency(row.dailyAvg)}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className="text-sm text-slate-400">{formatCurrency(row.prevPeriod)}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {row.change > 0 ? (
                                <>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                                  <span className="text-xs font-medium text-rose-400">+{row.change.toFixed(1)}%</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-medium text-emerald-400">{row.change.toFixed(1)}%</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="text-right px-4 py-3">
                            <MiniSparkline data={row.dailyData} color={color} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </ModuleGate>
  );
}
