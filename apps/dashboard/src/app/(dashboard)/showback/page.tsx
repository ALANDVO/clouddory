'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Trash2, Copy, ExternalLink } from 'lucide-react';
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

interface Showback {
  id: string;
  team: string;
  token: string;
  dimensions: string[] | null;
  createdAt: string;
}

export default function ShowbackPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [showbacks, setShowbacks] = useState<Showback[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formTeam, setFormTeam] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/orgs/${orgId}/showbacks`)
      .then((r) => r.json())
      .then((data) => setShowbacks(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate() {
    if (!orgId || !formTeam.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/showbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: formTeam }),
      });
      if (res.ok) {
        const sb = await res.json();
        setShowbacks((prev) => [sb, ...prev]);
        setDialogOpen(false);
        setFormTeam('');
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(showbackId: string) {
    if (!orgId) return;
    await fetch(`/api/orgs/${orgId}/showbacks?id=${showbackId}`, { method: 'DELETE' });
    setShowbacks((prev) => prev.filter((s) => s.id !== showbackId));
  }

  function getShareLink(token: string) {
    return `${window.location.origin}/showback/${token}`;
  }

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(getShareLink(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Team Showback</h1>
            <p className="text-slate-500 mt-1">
              Share read-only spend views with team leads -- no login required.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Showback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Showback Link</DialogTitle>
                <DialogDescription>Generate a shareable link for a team&apos;s spend data.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Team Name</label>
                  <Input
                    placeholder="Platform Engineering"
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !formTeam.trim()}>
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Showback
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        {/* Showbacks List */}
        {!loading && showbacks.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Team</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Token</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showbacks.map((sb) => (
                  <tr key={sb.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white font-medium">{sb.team}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-slate-400 bg-navy-950 px-2 py-1 rounded">
                        {sb.token.slice(0, 12)}...
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(sb.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(sb.token, sb.id)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          {copiedId === sb.id ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <a href={getShareLink(sb.token)} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sb.id)}
                          className="text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && showbacks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No showback links</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Create shareable links so team leads can view their spend without signing in.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Showback
            </Button>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
