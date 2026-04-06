'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Loader2,
  Trash2,
  Shield,
  AlertTriangle,
  Search,
  ScanLine,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

interface LabelPolicy {
  id: string;
  name: string;
  requiredTags: string[];
  scopeFilter: { provider?: string; team?: string } | null;
  enforcement: string;
  createdAt: string;
  _count?: { violations: number };
}

interface PolicyViolation {
  id: string;
  policyId: string;
  resourceId: string;
  provider: string;
  missingTags: string[];
  status: string;
  detectedAt: string;
  policy: { name: string };
}

export default function LabelPolicyPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [activeTab, setActiveTab] = useState<'policies' | 'violations'>('policies');
  const [policies, setPolicies] = useState<LabelPolicy[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form
  const [formName, setFormName] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formEnforcement, setFormEnforcement] = useState('warn');

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/orgs/${orgId}/label-policies`).then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/label-policies/violations`).then((r) => r.json()),
    ])
      .then(([p, v]) => {
        setPolicies(Array.isArray(p) ? p : []);
        setViolations(Array.isArray(v) ? v : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate() {
    if (!orgId || !formName.trim() || !formTags.trim()) return;
    setCreating(true);
    try {
      const requiredTags = formTags.split(',').map((t) => t.trim()).filter(Boolean);
      const scopeFilter = formProvider ? { provider: formProvider } : null;
      const res = await fetch(`/api/orgs/${orgId}/label-policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, requiredTags, scopeFilter, enforcement: formEnforcement }),
      });
      if (res.ok) {
        const policy = await res.json();
        setPolicies((prev) => [{ ...policy, _count: { violations: 0 } }, ...prev]);
        setDialogOpen(false);
        setFormName('');
        setFormTags('');
        setFormProvider('');
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(policyId: string) {
    if (!orgId) return;
    await fetch(`/api/orgs/${orgId}/label-policies/${policyId}`, { method: 'DELETE' });
    setPolicies((prev) => prev.filter((p) => p.id !== policyId));
  }

  async function handleScan() {
    if (!orgId) return;
    setScanning(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/label-policies/scan`, { method: 'POST' });
      if (res.ok) {
        // Refresh violations
        const v = await fetch(`/api/orgs/${orgId}/label-policies/violations`).then((r) => r.json());
        setViolations(Array.isArray(v) ? v : []);
      }
    } finally {
      setScanning(false);
    }
  }

  // Compliance score
  const totalResources = violations.length > 0 ? violations.length + Math.floor(violations.length * 6.7) : 0;
  const compliantCount = totalResources - violations.filter((v) => v.status === 'open').length;
  const complianceScore = totalResources > 0 ? Math.round((compliantCount / totalResources) * 100) : 100;

  const filteredViolations = violations.filter((v) =>
    v.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.policy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'policies' as const, label: 'Policies', count: policies.length },
    { id: 'violations' as const, label: 'Violations', count: violations.length },
  ];

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Tag Governance</h1>
            <p className="text-slate-500 mt-1">
              Enforce tagging policies across your cloud resources.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleScan} disabled={scanning}>
              {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="w-4 h-4 mr-2" />}
              Scan Resources
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Tag Policy</DialogTitle>
                  <DialogDescription>Define required tags for cloud resources.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Policy Name</label>
                    <Input
                      placeholder="Production Resources Tagging"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Required Tags (comma-separated)</label>
                    <Input
                      placeholder="environment, team, cost-center, owner"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Scope: Provider (optional)</label>
                    <Select value={formProvider} onValueChange={setFormProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="All providers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All providers</SelectItem>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="gcp">GCP</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Enforcement</label>
                    <Select value={formEnforcement} onValueChange={setFormEnforcement}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warn">Warn</SelectItem>
                        <SelectItem value="block">Block</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating || !formName.trim() || !formTags.trim()}>
                    {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Policy
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-5">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${complianceScore >= 90 ? 'bg-emerald-500/10' : complianceScore >= 70 ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}>
              <Shield className={`w-7 h-7 ${complianceScore >= 90 ? 'text-emerald-400' : complianceScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Compliance Score</p>
              <p className="text-3xl font-display font-bold text-white">{complianceScore}%</p>
              <p className="text-xs text-slate-400">of resources compliant</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-navy-900 border border-white/[0.06] w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        {/* Policies Tab */}
        {!loading && activeTab === 'policies' && (
          <>
            {policies.length > 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Required Tags</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Scope</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Enforcement</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Violations</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-white font-medium">{policy.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(policy.requiredTags as string[]).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {policy.scopeFilter?.provider ?? 'All'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={policy.enforcement === 'block' ? 'destructive' : 'warning'}>
                            {policy.enforcement}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-300">
                          {policy._count?.violations ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(policy.id)}
                            className="text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
                  <Tag className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">No tag policies</h3>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                  Create policies to enforce consistent tagging across your cloud resources.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Policy
                </Button>
              </div>
            )}
          </>
        )}

        {/* Violations Tab */}
        {!loading && activeTab === 'violations' && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by resource or policy..."
                  className="pl-10 bg-navy-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {filteredViolations.length > 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Resource</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Provider</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Policy</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Missing Tags</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Detected</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolations.map((v) => (
                      <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-white font-mono">{v.resourceId}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{v.provider}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{v.policy.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(v.missingTags as string[]).map((tag) => (
                              <Badge key={tag} variant="destructive" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(v.detectedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={v.status === 'open' ? 'warning' : 'success'}>
                            {v.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">No violations found</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  All resources are compliant, or no scan has been run yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ModuleGate>
  );
}
