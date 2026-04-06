'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  LayoutGrid,
  Star,
  Clock,
  Layers,
  Trash2,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/stores/app-store';

interface DashboardItem {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: any[] | null;
  updatedAt: string;
  createdAt: string;
}

const PRESET_DASHBOARDS = [
  {
    name: 'Executive Summary',
    icon: BarChart3,
    description: 'High-level spend overview, top services, and trend lines for leadership.',
    widgets: [
      { id: 'w1', type: 'metric_card', title: 'Total Spend (MTD)', config: { group_by: null } },
      { id: 'w2', type: 'metric_card', title: 'vs Last Month', config: { group_by: null } },
      { id: 'w3', type: 'line_chart', title: 'Daily Spend Trend', config: { group_by: 'service' } },
      { id: 'w4', type: 'pie_chart', title: 'Spend by Provider', config: { group_by: 'source' } },
      { id: 'w5', type: 'bar_chart', title: 'Top 10 Services', config: { group_by: 'service' } },
      { id: 'w6', type: 'table', title: 'Recent Cost Records', config: {} },
    ],
    isDefault: true,
  },
  {
    name: 'Team Breakdown',
    icon: Users,
    description: 'Cost allocation across teams, environments, and regions.',
    widgets: [
      { id: 'w1', type: 'bar_chart', title: 'Cost by Team', config: { group_by: 'team' } },
      { id: 'w2', type: 'pie_chart', title: 'Cost by Environment', config: { group_by: 'environment' } },
      { id: 'w3', type: 'bar_chart', title: 'Cost by Region', config: { group_by: 'region' } },
      { id: 'w4', type: 'table', title: 'Team Cost Details', config: { group_by: 'team' } },
    ],
    isDefault: false,
  },
  {
    name: 'AI Costs',
    icon: Sparkles,
    description: 'Track spending on AI/ML services — OpenAI, Anthropic, and cloud AI services.',
    widgets: [
      { id: 'w1', type: 'metric_card', title: 'Total AI Spend', config: { source: 'openai' } },
      { id: 'w2', type: 'line_chart', title: 'AI Spend Over Time', config: { source: 'openai' } },
      { id: 'w3', type: 'bar_chart', title: 'AI Spend by Service', config: { group_by: 'service', source: 'openai' } },
      { id: 'w4', type: 'table', title: 'AI Cost Records', config: { source: 'openai' } },
    ],
    isDefault: false,
  },
];

export default function DashboardsPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDashboards = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/dashboards`);
      if (res.ok) {
        const data = await res.json();
        setDashboards(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  const handleCreate = async () => {
    if (!orgId || !newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/dashboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), widgets: [] }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setNewName('');
        fetchDashboards();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSeedPreset = async (preset: (typeof PRESET_DASHBOARDS)[number]) => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/dashboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preset.name,
          widgets: preset.widgets,
          isDefault: preset.isDefault,
        }),
      });
      if (res.ok) {
        fetchDashboards();
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    try {
      await fetch(`/api/orgs/${orgId}/dashboards/${id}`, { method: 'DELETE' });
      fetchDashboards();
    } catch {
      // silently fail
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            SpendBoards
          </h1>
          <p className="text-slate-400 mt-1">
            Custom dashboards to visualize your cloud spend
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      {/* Preset templates section — show only if no dashboards exist */}
      {!loading && dashboards.length === 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase">
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESET_DASHBOARDS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Card
                  key={preset.name}
                  className="group hover:border-cyan-500/30 transition-colors cursor-pointer"
                  onClick={() => handleSeedPreset(preset)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400">{preset.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {preset.widgets.length} widgets
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-white/5 rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-white/5 rounded w-20 mb-2" />
                <div className="h-4 bg-white/5 rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dashboards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((db) => {
            const widgetCount = Array.isArray(db.widgets)
              ? db.widgets.length
              : 0;
            return (
              <Link key={db.id} href={`/dashboards/${db.id}`}>
                <Card className="group hover:border-cyan-500/30 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                          <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <CardTitle className="text-base">{db.name}</CardTitle>
                      </div>
                      {db.isDefault && (
                        <Badge
                          variant="outline"
                          className="text-xs border-cyan-500/30 text-cyan-400"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(db.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(db.id);
                        }}
                        title="Delete dashboard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : null}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dashboard</DialogTitle>
            <DialogDescription>
              Give your new SpendBoard a name to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Dashboard name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
