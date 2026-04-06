'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const PROVIDERS = ['AWS', 'GCP', 'Azure', 'Other'];

interface SpendPlan {
  id: string;
  name: string;
  fiscalYear: number;
  budgets: Record<string, Record<string, number>>; // { team: { provider: amount } }
  updatedAt: string;
}

// Mock actual spend data per team
function mockActuals(budgets: Record<string, Record<string, number>>) {
  const actuals: Record<string, Record<string, number>> = {};
  for (const [team, providerBudgets] of Object.entries(budgets)) {
    actuals[team] = {};
    for (const [provider, budget] of Object.entries(providerBudgets)) {
      // Random actual between 50% and 120% of budget
      actuals[team][provider] = Math.round(budget * (0.5 + Math.random() * 0.7));
    }
  }
  return actuals;
}

export default function SpendPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const orgId = useAppStore((s) => s.currentOrgId);
  const [plan, setPlan] = useState<SpendPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState<Record<string, Record<string, number>>>({});
  const [newTeam, setNewTeam] = useState('');
  const [actuals, setActuals] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!orgId || !planId) return;
    fetch(`/api/orgs/${orgId}/spend-plans/${planId}`)
      .then((r) => r.json())
      .then((data) => {
        setPlan(data);
        const b = data.budgets ?? {};
        setBudgets(b);
        setActuals(mockActuals(b));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId, planId]);

  const handleCellChange = useCallback((team: string, provider: string, value: string) => {
    setBudgets((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [provider]: Number(value) || 0,
      },
    }));
  }, []);

  async function handleSave() {
    if (!orgId || !planId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/spend-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlan(updated);
        setActuals(mockActuals(budgets));
      }
    } finally {
      setSaving(false);
    }
  }

  function addTeam() {
    if (!newTeam.trim()) return;
    setBudgets((prev) => ({
      ...prev,
      [newTeam.trim()]: { AWS: 0, GCP: 0, Azure: 0, Other: 0 },
    }));
    setNewTeam('');
  }

  function removeTeam(team: string) {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[team];
      return next;
    });
  }

  const teams = Object.keys(budgets);

  // Chart data
  const barChartData = teams.map((team) => {
    const teamBudget = Object.values(budgets[team] ?? {}).reduce((a, b) => a + b, 0);
    const teamActual = Object.values(actuals[team] ?? {}).reduce((a, b) => a + b, 0);
    return { team, Budget: teamBudget, Actual: teamActual };
  });

  // Burndown data (monthly, mock)
  const totalBudget = Object.values(budgets).reduce(
    (sum, team) => sum + Object.values(team).reduce((a, b) => a + b, 0),
    0
  );
  const burndownData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i).toLocaleString('default', { month: 'short' });
    const spent = Math.round((totalBudget / 12) * (i + 1) * (0.7 + Math.random() * 0.5));
    return { month, remaining: Math.max(0, totalBudget - spent) };
  });

  // Variance data
  const varianceData = teams.map((team) => {
    const budgeted = Object.values(budgets[team] ?? {}).reduce((a, b) => a + b, 0);
    const actual = Object.values(actuals[team] ?? {}).reduce((a, b) => a + b, 0);
    const variance = actual - budgeted;
    const variancePct = budgeted > 0 ? (actual / budgeted) * 100 : 0;
    return { team, budgeted, actual, variance, variancePct };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20 text-slate-400">
        Plan not found.{' '}
        <Link href="/spend-plan" className="text-cyan-400 hover:underline">
          Back to plans
        </Link>
      </div>
    );
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/spend-plan">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">{plan.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">FY{plan.fiscalYear}</Badge>
                <span className="text-sm text-slate-500">
                  Total Budget: ${totalBudget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Budget Table */}
        <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="font-display font-semibold text-white">Budget Allocation</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                    Team
                  </th>
                  {PROVIDERS.map((p) => (
                    <th key={p} className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      {p}
                    </th>
                  ))}
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                    Total
                  </th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const teamTotal = Object.values(budgets[team] ?? {}).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={team} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm text-white font-medium">{team}</td>
                      {PROVIDERS.map((provider) => (
                        <td key={provider} className="px-4 py-2">
                          <Input
                            type="number"
                            className="w-28 ml-auto text-right text-sm bg-navy-950 border-white/10"
                            value={budgets[team]?.[provider] ?? 0}
                            onChange={(e) => handleCellChange(team, provider, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right text-sm text-cyan-400 font-medium">
                        ${teamTotal.toLocaleString()}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => removeTeam(team)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex gap-2">
            <Input
              placeholder="New team name..."
              className="w-48 bg-navy-950"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            />
            <Button variant="outline" size="sm" onClick={addTeam}>
              <Plus className="w-4 h-4 mr-1" /> Add Team
            </Button>
          </div>
        </div>

        {/* Charts Row */}
        {teams.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget vs Actual */}
            <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-5">
              <h3 className="font-display font-semibold text-white mb-4">Budget vs Actual</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="team" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Burndown */}
            <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-5">
              <h3 className="font-display font-semibold text-white mb-4">Budget Burndown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="remaining"
                    stroke="#06b6d4"
                    fill="url(#burndownGrad)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Variance Table */}
        {teams.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <h2 className="font-display font-semibold text-white">Variance Analysis</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Team</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Budgeted</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actual</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Variance $</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Variance %</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {varianceData.map((row) => {
                    let statusBadge: { label: string; variant: 'success' | 'warning' | 'destructive' };
                    if (row.variancePct > 100) {
                      statusBadge = { label: 'Over Budget', variant: 'destructive' };
                    } else if (row.variancePct > 80) {
                      statusBadge = { label: 'Warning', variant: 'warning' };
                    } else {
                      statusBadge = { label: 'On Track', variant: 'success' };
                    }
                    return (
                      <tr key={row.team} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-white font-medium">{row.team}</td>
                        <td className="px-4 py-3 text-sm text-slate-300 text-right">${row.budgeted.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-300 text-right">${row.actual.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${row.variance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.variance > 0 ? '+' : ''}${row.variance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300 text-right">{row.variancePct.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
