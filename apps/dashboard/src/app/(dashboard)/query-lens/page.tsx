'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Save,
  Trash2,
  FolderOpen,
  BarChart3,
  LineChart as LineChartIcon,
  Table2,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/stores/app-store';

const ALL_DIMENSIONS = [
  { key: 'source', label: 'Provider' },
  { key: 'service', label: 'Service' },
  { key: 'team', label: 'Team' },
  { key: 'environment', label: 'Environment' },
  { key: 'region', label: 'Region' },
];

const ALL_METRICS = [
  { key: 'cost', label: 'Cost (sum)' },
  { key: 'usage', label: 'Usage (sum)' },
  { key: 'count', label: 'Record Count' },
];

interface QueryConfig {
  dimensions: string[];
  metrics: string[];
  dateStart: string;
  dateEnd: string;
  filters: Record<string, string>;
}

interface QueryResult {
  rows: Record<string, any>[];
  dimensions: string[];
  total: number;
}

interface SavedQuery {
  id: string;
  name: string;
  config: QueryConfig;
  createdAt: string;
  user?: { name: string };
}

function formatCost(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function QueryLensPage() {
  const orgId = useAppStore((s) => s.currentOrgId);

  // Query config state
  const [dimensions, setDimensions] = useState<string[]>(['service']);
  const [metrics, setMetrics] = useState<string[]>(['cost']);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  // Results
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'bar' | 'line'>('table');

  // Saved queries
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/query-lens/saved`);
      if (res.ok) setSavedQueries(await res.json());
    } catch {}
  }, [orgId]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const buildConfig = (): QueryConfig => ({
    dimensions,
    metrics,
    dateStart,
    dateEnd,
    filters: {
      ...(filterProvider && { provider: filterProvider }),
      ...(filterService && { service: filterService }),
      ...(filterTeam && { team: filterTeam }),
      ...(filterEnvironment && { environment: filterEnvironment }),
      ...(filterRegion && { region: filterRegion }),
    },
  });

  const runQuery = async () => {
    if (!orgId) return;
    setRunning(true);
    try {
      const config = buildConfig();
      const res = await fetch(`/api/orgs/${orgId}/query-lens/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        // Auto-select visualization
        if (dimensions.length === 0) {
          setViewMode('table');
        } else if (dimensions.includes('date')) {
          setViewMode('line');
        } else {
          setViewMode('bar');
        }
      }
    } catch {
      // silently fail
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!orgId || !saveName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/query-lens/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), config: buildConfig() }),
      });
      if (res.ok) {
        setSaveOpen(false);
        setSaveName('');
        fetchSaved();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    if (!orgId) return;
    try {
      await fetch(`/api/orgs/${orgId}/query-lens/saved/${id}`, {
        method: 'DELETE',
      });
      fetchSaved();
    } catch {}
  };

  const loadSavedQuery = (q: SavedQuery) => {
    const c = q.config as QueryConfig;
    setDimensions(c.dimensions || []);
    setMetrics(c.metrics || ['cost']);
    setDateStart(c.dateStart || '');
    setDateEnd(c.dateEnd || '');
    setFilterProvider(c.filters?.provider || '');
    setFilterService(c.filters?.service || '');
    setFilterTeam(c.filters?.team || '');
    setFilterEnvironment(c.filters?.environment || '');
    setFilterRegion(c.filters?.region || '');
  };

  const toggleDimension = (key: string) => {
    setDimensions((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const toggleMetric = (key: string) => {
    setMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            QueryLens
          </h1>
          <p className="text-slate-400 mt-1">
            Build ad-hoc queries to explore your cloud spend
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedQueries.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Saved Queries
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Saved Queries</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedQueries.map((q) => (
                  <DropdownMenuItem key={q.id} className="flex items-center justify-between">
                    <button
                      className="flex-1 text-left"
                      onClick={() => loadSavedQuery(q)}
                    >
                      {q.name}
                    </button>
                    <button
                      className="text-slate-600 hover:text-red-400 transition-colors ml-2 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSaved(q.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel — Query Builder */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALL_DIMENSIONS.map((d) => (
                <label
                  key={d.key}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={dimensions.includes(d.key)}
                    onChange={() => toggleDimension(d.key)}
                    className="w-4 h-4 rounded border-white/20 bg-navy-800 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    {d.label}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALL_METRICS.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={metrics.includes(m.key)}
                    onChange={() => toggleMetric(m.key)}
                    className="w-4 h-4 rounded border-white/20 bg-navy-800 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    {m.label}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Start</Label>
                <Input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">End</Label>
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Provider</Label>
                <Input
                  placeholder="e.g., aws"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Service</Label>
                <Input
                  placeholder="e.g., EC2"
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Team</Label>
                <Input
                  placeholder="e.g., Platform"
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Environment</Label>
                <Input
                  placeholder="e.g., production"
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Region</Label>
                <Input
                  placeholder="e.g., us-east-1"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={runQuery} disabled={running}>
              <Play className="w-4 h-4 mr-2" />
              {running ? 'Running...' : 'Run Query'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSaveOpen(true)}
              disabled={!result}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Right panel — Results */}
        <div className="lg:col-span-8 space-y-4">
          {!result ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-slate-500">
                <BarChart3 className="w-12 h-12 mb-4 text-slate-600" />
                <p className="text-lg mb-1">No results yet</p>
                <p className="text-sm">
                  Configure your query on the left and hit Run
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <Card>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Total Cost
                      </p>
                      <p className="text-2xl font-bold text-white font-display">
                        {formatCost(result.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Rows
                      </p>
                      <p className="text-lg font-semibold text-slate-300">
                        {result.rows.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-navy-800 rounded-lg p-1">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                      onClick={() => setViewMode('table')}
                      title="Table view"
                    >
                      <Table2 className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'bar' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                      onClick={() => setViewMode('bar')}
                      title="Bar chart"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'line' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                      onClick={() => setViewMode('line')}
                      title="Line chart"
                    >
                      <LineChartIcon className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Visualization */}
              {viewMode === 'table' ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            {result.dimensions.map((d) => (
                              <th
                                key={d}
                                className="text-left py-3 px-4 text-slate-500 font-medium capitalize"
                              >
                                {d}
                              </th>
                            ))}
                            {metrics.includes('cost') && (
                              <th className="text-right py-3 px-4 text-slate-500 font-medium">
                                Cost
                              </th>
                            )}
                            {metrics.includes('usage') && (
                              <th className="text-right py-3 px-4 text-slate-500 font-medium">
                                Usage
                              </th>
                            )}
                            {metrics.includes('count') && (
                              <th className="text-right py-3 px-4 text-slate-500 font-medium">
                                Count
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                            >
                              {result.dimensions.map((d) => (
                                <td
                                  key={d}
                                  className="py-2.5 px-4 text-slate-300"
                                >
                                  {row[d] ?? 'Unknown'}
                                </td>
                              ))}
                              {metrics.includes('cost') && (
                                <td className="py-2.5 px-4 text-right text-white font-medium">
                                  {formatCost(row.cost ?? 0)}
                                </td>
                              )}
                              {metrics.includes('usage') && (
                                <td className="py-2.5 px-4 text-right text-slate-300">
                                  {(row.usage ?? 0).toLocaleString()}
                                </td>
                              )}
                              {metrics.includes('count') && (
                                <td className="py-2.5 px-4 text-right text-slate-300">
                                  {(row.count ?? 0).toLocaleString()}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={360}>
                      {viewMode === 'bar' ? (
                        <BarChart
                          data={result.rows.slice(0, 20).map((r) => ({
                            name:
                              (
                                r[result.dimensions[0]] ?? 'Total'
                              ).toString().length > 20
                                ? (r[result.dimensions[0]] ?? 'Total')
                                    .toString()
                                    .slice(0, 18) + '...'
                                : r[result.dimensions[0]] ?? 'Total',
                            cost: r.cost ?? 0,
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            angle={-30}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 8,
                              color: '#fff',
                            }}
                            formatter={(val) => [
                              formatCost(Number(val)),
                              'Cost',
                            ]}
                          />
                          <Bar
                            dataKey="cost"
                            fill="#06b6d4"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <LineChart
                          data={result.rows.slice(0, 50).map((r) => ({
                            name: r[result.dimensions[0]] ?? 'Total',
                            cost: r.cost ?? 0,
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 8,
                              color: '#fff',
                            }}
                            formatter={(val) => [
                              formatCost(Number(val)),
                              'Cost',
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="cost"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save Query dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
            <DialogDescription>
              Give your query a name so you can reuse it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Query name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !saveName.trim()}
            >
              {saving ? 'Saving...' : 'Save Query'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
