'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Hash,
  Cpu,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
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
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

// ─── Constants ─────────────────────────────────────────────────

const AI_PROVIDERS = ['openai', 'anthropic', 'bedrock', 'vertex_ai', 'azure_openai'];
const AI_PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  bedrock: 'Amazon Bedrock',
  vertex_ai: 'Vertex AI',
  azure_openai: 'Azure OpenAI',
};

const CHART_COLORS = [
  '#06b6d4',
  '#a855f7',
  '#f59e0b',
  '#10b981',
  '#f43f5e',
  '#3b82f6',
  '#f97316',
  '#ec4899',
];

function fmtUsd(n: number) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
  return '$' + n.toFixed(2);
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}

// ─── Types ─────────────────────────────────────────────────────

interface CostRecord {
  id: string;
  date: string;
  service: string;
  source: string;
  cost: number;
  usage: number | null;
  usageUnit: string | null;
  model: string | null;
  team: string | null;
  region: string | null;
  environment: string | null;
  tokenCount?: number | null;
  requestCount?: number | null;
}

// ─── Summary Card ──────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'cyan',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  };
  const cls = colorMap[color] ?? colorMap.cyan;

  return (
    <Card className={`bg-gradient-to-br ${cls} border p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function AISpendLensPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);

    // Fetch AI provider records — use source param for each AI provider
    const fetches = AI_PROVIDERS.map((p) =>
      fetch(`/api/orgs/${orgId}/spend?source=${p}`)
        .then((r) => r.json())
        .then((d) => d.records ?? [])
        .catch(() => [])
    );

    Promise.all(fetches).then((results) => {
      const all = results.flat() as CostRecord[];
      setRecords(all);
      setLoading(false);
    });
  }, [orgId]);

  // ── Derived data ──

  const totalSpend = useMemo(
    () => records.reduce((s, r) => s + r.cost, 0),
    [records]
  );

  const totalTokens = useMemo(
    () =>
      records.reduce((s, r) => {
        if (r.usageUnit === 'tokens' && r.usage) return s + r.usage;
        return s;
      }, 0),
    [records]
  );

  const costPer1kTokens = useMemo(
    () => (totalTokens > 0 ? (totalSpend / totalTokens) * 1000 : 0),
    [totalSpend, totalTokens]
  );

  const topModel = useMemo(() => {
    const byModel: Record<string, number> = {};
    records.forEach((r) => {
      if (r.model) byModel[r.model] = (byModel[r.model] ?? 0) + r.cost;
    });
    const sorted = Object.entries(byModel).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? 'N/A';
  }, [records]);

  // Cost by model
  const costByModel = useMemo(() => {
    const byModel: Record<string, number> = {};
    records.forEach((r) => {
      const m = r.model ?? r.service;
      byModel[m] = (byModel[m] ?? 0) + r.cost;
    });
    return Object.entries(byModel)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([model, cost]) => ({ model, cost }));
  }, [records]);

  // Tokens per dollar (efficiency)
  const tokensPerDollar = useMemo(() => {
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    records.forEach((r) => {
      if (r.model && r.usageUnit === 'tokens' && r.usage) {
        if (!byModel[r.model]) byModel[r.model] = { tokens: 0, cost: 0 };
        byModel[r.model].tokens += r.usage;
        byModel[r.model].cost += r.cost;
      }
    });
    return Object.entries(byModel)
      .map(([model, d]) => ({
        model,
        tokensPerDollar: d.cost > 0 ? d.tokens / d.cost : 0,
      }))
      .sort((a, b) => b.tokensPerDollar - a.tokensPerDollar)
      .slice(0, 6);
  }, [records]);

  // Daily trend
  const dailyTrend = useMemo(() => {
    const byDate: Record<string, number> = {};
    records.forEach((r) => {
      const d = r.date.slice(0, 10);
      byDate[d] = (byDate[d] ?? 0) + r.cost;
    });
    return Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, cost]) => ({ date: date.slice(5), cost }));
  }, [records]);

  // Table data: model rows
  const modelTableRows = useMemo(() => {
    const byModel: Record<
      string,
      { provider: string; requests: number; tokens: number; cost: number }
    > = {};
    records.forEach((r) => {
      const m = r.model ?? r.service;
      if (!byModel[m])
        byModel[m] = { provider: r.source, requests: 0, tokens: 0, cost: 0 };
      byModel[m].cost += r.cost;
      byModel[m].requests += 1;
      if (r.usageUnit === 'tokens' && r.usage) byModel[m].tokens += r.usage;
    });
    return Object.entries(byModel)
      .map(([model, d]) => ({
        model,
        provider: AI_PROVIDER_LABELS[d.provider] ?? d.provider,
        requests: d.requests,
        tokens: d.tokens,
        cost: d.cost,
        avgCost: d.requests > 0 ? d.cost / d.requests : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [records]);

  if (loading) {
    return (
      <ModuleGate module="finops">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            Loading AI spend data...
          </div>
        </div>
      </ModuleGate>
    );
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Spend Lens</h1>
            <p className="text-xs text-slate-400">
              Cost analysis for AI providers: OpenAI, Anthropic, Bedrock, Vertex AI, Azure OpenAI
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={DollarSign}
            label="Total AI Spend"
            value={fmtUsd(totalSpend)}
            color="cyan"
          />
          <SummaryCard
            icon={Hash}
            label="Tokens Used"
            value={fmtNumber(totalTokens)}
            color="purple"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Cost per 1K Tokens"
            value={'$' + costPer1kTokens.toFixed(4)}
            color="amber"
          />
          <SummaryCard
            icon={Star}
            label="Top Model"
            value={topModel}
            color="emerald"
          />
        </div>

        {records.length === 0 ? (
          <Card className="bg-navy-900 border-white/[0.06] p-12 text-center">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-display font-semibold text-white mb-1">
              No AI Spend Data Yet
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Connect an AI provider (OpenAI, Anthropic, etc.) in Integrations or add manual entries to see AI cost analytics.
            </p>
          </Card>
        ) : (
          <>
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cost by Model */}
              <Card className="bg-navy-900 border-white/[0.06] p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Cost by Model</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costByModel} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        type="number"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(v) => `$${v.toFixed(0)}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="model"
                        width={120}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                        }}
                        formatter={((value: any) => ['$' + Number(value).toFixed(2), 'Cost']) as any}
                      />
                      <Bar dataKey="cost" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Tokens per Dollar */}
              <Card className="bg-navy-900 border-white/[0.06] p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Tokens per Dollar (Efficiency)
                </h3>
                <div className="h-64">
                  {tokensPerDollar.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tokensPerDollar} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          type="number"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          tickFormatter={(v) => fmtNumber(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="model"
                          width={120}
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                          }}
                          formatter={((value: any) => [fmtNumber(Number(value)) + ' tokens/$', 'Efficiency']) as any}
                        />
                        <Bar dataKey="tokensPerDollar" fill="#a855f7" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500">
                      No token usage data available
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Trend chart */}
            <Card className="bg-navy-900 border-white/[0.06] p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily AI Spend Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                      }}
                      formatter={((value: any) => ['$' + Number(value).toFixed(2), 'AI Spend']) as any}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#06b6d4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Table */}
            <Card className="bg-navy-900 border-white/[0.06] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-slate-300">AI Model Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Model', 'Provider', 'Requests', 'Tokens', 'Cost', 'Avg Cost/Req'].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {modelTableRows.map((row, i) => (
                      <tr
                        key={row.model}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-4 font-medium text-white">{row.model}</td>
                        <td className="py-3 px-4 text-slate-300">
                          <Badge
                            variant="outline"
                            className="text-xs border-white/10 text-slate-400"
                          >
                            {row.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {row.requests.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {fmtNumber(row.tokens)}
                        </td>
                        <td className="py-3 px-4 text-cyan-300 font-mono font-medium">
                          ${row.cost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          ${row.avgCost.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                    {modelTableRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No AI model data available
                        </td>
                      </tr>
                    )}
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
