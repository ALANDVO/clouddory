'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  GripVertical,
  Settings,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/stores/app-store';

const CHART_COLORS = [
  '#06b6d4',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#ec4899',
  '#3b82f6',
  '#f97316',
];

interface WidgetConfig {
  id: string;
  type: 'metric_card' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'table';
  title: string;
  config: Record<string, any>;
}

interface DashboardData {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: WidgetConfig[] | null;
  updatedAt: string;
}

function formatCost(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// Widget renderers
function MetricCardWidget({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  const [data, setData] = useState<{ total: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (widget.config.source) params.set('source', widget.config.source);
    if (widget.config.group_by) params.set('group_by', widget.config.group_by);
    fetch(`/api/orgs/${orgId}/spend?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [orgId, widget.config]);

  const total = data?.total ?? 0;
  const trendPct = ((Math.random() - 0.5) * 20).toFixed(1); // placeholder trend
  const isUp = Number(trendPct) > 0;

  return (
    <div className="flex flex-col items-start gap-2 p-2">
      <p className="text-3xl font-bold text-white font-display">
        {data ? formatCost(total) : '...'}
      </p>
      <div className="flex items-center gap-1.5 text-sm">
        {isUp ? (
          <TrendingUp className="w-4 h-4 text-red-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-emerald-400" />
        )}
        <span className={isUp ? 'text-red-400' : 'text-emerald-400'}>
          {trendPct}%
        </span>
        <span className="text-slate-500">vs prior period</span>
      </div>
    </div>
  );
}

function BarChartWidget({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  const [data, setData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (widget.config.group_by) params.set('group_by', widget.config.group_by);
    if (widget.config.source) params.set('source', widget.config.source);
    fetch(`/api/orgs/${orgId}/spend?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d.grouped))
      .catch(() => {});
  }, [orgId, widget.config]);

  if (!data) {
    return <div className="h-48 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const chartData = Object.entries(data)
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + '...' : name, cost: value }));

  if (chartData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
          }}
          formatter={(val) => [formatCost(Number(val)), 'Cost']}
        />
        <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartWidget({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (widget.config.source) params.set('source', widget.config.source);
    fetch(`/api/orgs/${orgId}/spend?${params}`)
      .then((r) => r.json())
      .then((d) => {
        // Aggregate records by date for a line chart
        const byDate: Record<string, number> = {};
        for (const rec of d.records ?? []) {
          const day = new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          byDate[day] = (byDate[day] || 0) + rec.cost;
        }
        const sorted = Object.entries(byDate).map(([date, cost]) => ({ date, cost }));
        setData(sorted.slice(-30));
      })
      .catch(() => {});
  }, [orgId, widget.config]);

  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
          }}
          formatter={(val) => [formatCost(Number(val)), 'Cost']}
        />
        <Line type="monotone" dataKey="cost" stroke="#06b6d4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PieChartWidget({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  const [data, setData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (widget.config.group_by) params.set('group_by', widget.config.group_by);
    if (widget.config.source) params.set('source', widget.config.source);
    fetch(`/api/orgs/${orgId}/spend?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d.grouped))
      .catch(() => {});
  }, [orgId, widget.config]);

  if (!data) {
    return <div className="h-48 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const chartData = Object.entries(data)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
          }}
          formatter={(val) => [formatCost(Number(val)), 'Cost']}
        />
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: 11 }}
          formatter={(val) => <span className="text-slate-300 text-xs">{val}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TableWidget({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (widget.config.source) params.set('source', widget.config.source);
    if (widget.config.group_by) params.set('group_by', widget.config.group_by);
    fetch(`/api/orgs/${orgId}/spend?${params}`)
      .then((r) => r.json())
      .then((d) => setRecords((d.records ?? []).slice(0, 10)))
      .catch(() => {});
  }, [orgId, widget.config]);

  if (records.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-2 px-2 text-slate-500 font-medium">Date</th>
            <th className="text-left py-2 px-2 text-slate-500 font-medium">Service</th>
            <th className="text-left py-2 px-2 text-slate-500 font-medium">Source</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r: any, i: number) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td className="py-1.5 px-2 text-slate-300">
                {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="py-1.5 px-2 text-slate-300">{r.service}</td>
              <td className="py-1.5 px-2 text-slate-400">{r.source}</td>
              <td className="py-1.5 px-2 text-right text-white font-medium">
                {formatCost(r.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WidgetRenderer({ widget, orgId }: { widget: WidgetConfig; orgId: string }) {
  switch (widget.type) {
    case 'metric_card':
      return <MetricCardWidget widget={widget} orgId={orgId} />;
    case 'bar_chart':
      return <BarChartWidget widget={widget} orgId={orgId} />;
    case 'line_chart':
      return <LineChartWidget widget={widget} orgId={orgId} />;
    case 'pie_chart':
      return <PieChartWidget widget={widget} orgId={orgId} />;
    case 'table':
      return <TableWidget widget={widget} orgId={orgId} />;
    default:
      return <div className="text-slate-500 p-4">Unknown widget type</div>;
  }
}

const WIDGET_TYPES = [
  { value: 'metric_card', label: 'Metric Card' },
  { value: 'bar_chart', label: 'Bar Chart' },
  { value: 'line_chart', label: 'Line Chart' },
  { value: 'pie_chart', label: 'Pie Chart' },
  { value: 'table', label: 'Data Table' },
];

const GROUP_BY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'source', label: 'Provider' },
  { value: 'service', label: 'Service' },
  { value: 'team', label: 'Team' },
  { value: 'environment', label: 'Environment' },
  { value: 'region', label: 'Region' },
];

export default function DashboardViewPage() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const router = useRouter();
  const orgId = useAppStore((s) => s.currentOrgId);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  // New widget form state
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState('bar_chart');
  const [newWidgetGroupBy, setNewWidgetGroupBy] = useState('');
  const [newWidgetSource, setNewWidgetSource] = useState('');

  const fetchDashboard = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/dashboards/${dashboardId}`);
      if (res.ok) {
        setDashboard(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [orgId, dashboardId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const saveWidgets = async (widgets: WidgetConfig[]) => {
    if (!orgId || !dashboard) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets }),
      });
      if (res.ok) {
        setDashboard({ ...dashboard, widgets });
      }
    } catch {
      // silently fail
    }
  };

  const handleAddWidget = async () => {
    if (!newWidgetTitle.trim()) return;
    const widget: WidgetConfig = {
      id: `w_${Date.now()}`,
      type: newWidgetType as WidgetConfig['type'],
      title: newWidgetTitle.trim(),
      config: {
        ...(newWidgetGroupBy && { group_by: newWidgetGroupBy }),
        ...(newWidgetSource && { source: newWidgetSource }),
      },
    };
    const widgets = [...(dashboard?.widgets ?? []), widget];
    await saveWidgets(widgets);
    setAddWidgetOpen(false);
    setNewWidgetTitle('');
    setNewWidgetType('bar_chart');
    setNewWidgetGroupBy('');
    setNewWidgetSource('');
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const widgets = (dashboard?.widgets ?? []).filter((w) => w.id !== widgetId);
    await saveWidgets(widgets);
  };

  const handleDeleteDashboard = async () => {
    if (!orgId) return;
    try {
      await fetch(`/api/orgs/${orgId}/dashboards/${dashboardId}`, {
        method: 'DELETE',
      });
      router.push('/dashboards');
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p>Dashboard not found</p>
        <Link href="/dashboards" className="text-cyan-400 mt-2 hover:underline">
          Back to dashboards
        </Link>
      </div>
    );
  }

  const widgets: WidgetConfig[] = Array.isArray(dashboard.widgets)
    ? dashboard.widgets
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboards"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {dashboard.name}
            </h1>
            {dashboard.isDefault && (
              <Badge
                variant="outline"
                className="text-xs border-cyan-500/30 text-cyan-400 mt-1"
              >
                Default Dashboard
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="edit-mode" className="text-sm text-slate-400">
              Edit Mode
            </Label>
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={setEditMode}
            />
          </div>
          {editMode && (
            <>
              <Button size="sm" onClick={() => setAddWidgetOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Widget
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteDashboard}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widgets grid */}
      {widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <p className="text-lg mb-2">No widgets yet</p>
            <p className="text-sm mb-4">
              Toggle edit mode and add widgets to build your dashboard
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(true);
                setAddWidgetOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className={
                widget.type === 'metric_card'
                  ? ''
                  : widget.type === 'table'
                    ? 'md:col-span-2 lg:col-span-2'
                    : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                    )}
                    <CardTitle className="text-sm font-medium">
                      {widget.title}
                    </CardTitle>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {orgId && <WidgetRenderer widget={widget} orgId={orgId} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Widget dialog */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Configure a new widget for your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Widget title"
                value={newWidgetTitle}
                onChange={(e) => setNewWidgetTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newWidgetType} onValueChange={setNewWidgetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Group By</Label>
              <Select value={newWidgetGroupBy} onValueChange={setNewWidgetGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_BY_OPTIONS.map((o) => (
                    <SelectItem key={o.value || 'none'} value={o.value || 'none'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source Filter (optional)</Label>
              <Input
                placeholder="e.g., aws, openai, anthropic"
                value={newWidgetSource}
                onChange={(e) => setNewWidgetSource(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddWidgetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWidget} disabled={!newWidgetTitle.trim()}>
              Add Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
