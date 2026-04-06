'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

interface SpendPlan {
  id: string;
  name: string;
  fiscalYear: number;
  budgets: Record<string, Record<string, number>>;
  createdAt: string;
  updatedAt: string;
}

export default function SpendPlanListPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [plans, setPlans] = useState<SpendPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/orgs/${orgId}/spend-plans`)
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate() {
    if (!orgId || !newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/spend-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, fiscalYear: Number(newYear), budgets: {} }),
      });
      if (res.ok) {
        const plan = await res.json();
        setPlans((prev) => [plan, ...prev]);
        setDialogOpen(false);
        setNewName('');
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(planId: string) {
    if (!orgId) return;
    await fetch(`/api/orgs/${orgId}/spend-plans/${planId}`, { method: 'DELETE' });
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  }

  function getTotalBudget(budgets: Record<string, Record<string, number>>) {
    let total = 0;
    for (const team of Object.values(budgets)) {
      for (const amount of Object.values(team)) {
        total += amount;
      }
    }
    return total;
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Spend Plans</h1>
            <p className="text-slate-500 mt-1">
              Financial planning and budget management across teams and providers.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Spend Plan</DialogTitle>
                <DialogDescription>Define a new budget plan for your organization.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Plan Name</label>
                  <Input
                    placeholder="FY2026 Cloud Budget"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Fiscal Year</label>
                  <Input
                    type="number"
                    placeholder="2026"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const totalBudget = getTotalBudget(plan.budgets ?? {});
              const teamCount = Object.keys(plan.budgets ?? {}).length;
              return (
                <div
                  key={plan.id}
                  className="relative group rounded-xl border border-white/[0.06] bg-navy-900 p-5 transition-all hover:border-cyan-500/20"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/spend-plan/${plan.id}`} className="flex-1">
                        <h3 className="font-display font-semibold text-white hover:text-cyan-400 transition-colors">
                          {plan.name}
                        </h3>
                      </Link>
                      <Badge variant="secondary">FY{plan.fiscalYear}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Budget</span>
                        <span className="text-white font-medium">
                          ${totalBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Teams</span>
                        <span className="text-slate-300">{teamCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Updated</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/spend-plan/${plan.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Open Plan
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Calculator className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No spend plans yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Create a spend plan to set budgets for teams and cloud providers.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Plan
            </Button>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
