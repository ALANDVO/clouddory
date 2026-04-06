'use client';

import { useState, useEffect } from 'react';
import {
  FileBarChart,
  Plus,
  Loader2,
  Trash2,
  Send,
  Mail,
  MessageSquare,
  Calendar,
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

interface ScheduledDigest {
  id: string;
  name: string;
  dashboardId: string | null;
  frequency: string;
  channels: { email?: string[]; slackWebhook?: string };
  enabled: boolean;
  nextSendAt: string | null;
  createdAt: string;
}

interface Dashboard {
  id: string;
  name: string;
}

const frequencyColors: Record<string, 'default' | 'secondary' | 'warning'> = {
  daily: 'default',
  weekly: 'secondary',
  monthly: 'warning',
};

export default function ReportsPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [digests, setDigests] = useState<ScheduledDigest[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDashboardId, setFormDashboardId] = useState('');
  const [formFrequency, setFormFrequency] = useState('weekly');
  const [formEmail, setFormEmail] = useState('');
  const [formSlack, setFormSlack] = useState('');

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/orgs/${orgId}/reports`).then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/spend-plans`).then((r) => r.json()).catch(() => []),
    ])
      .then(([d, dbs]) => {
        setDigests(d);
        setDashboards(Array.isArray(dbs) ? dbs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate() {
    if (!orgId || !formName.trim()) return;
    setCreating(true);
    try {
      const channels: any = {};
      if (formEmail.trim()) channels.email = formEmail.split(',').map((e) => e.trim());
      if (formSlack.trim()) channels.slackWebhook = formSlack.trim();

      const res = await fetch(`/api/orgs/${orgId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          dashboardId: formDashboardId || null,
          frequency: formFrequency,
          channels,
        }),
      });
      if (res.ok) {
        const digest = await res.json();
        setDigests((prev) => [digest, ...prev]);
        setDialogOpen(false);
        setFormName('');
        setFormEmail('');
        setFormSlack('');
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(digest: ScheduledDigest) {
    if (!orgId) return;
    const res = await fetch(`/api/orgs/${orgId}/reports/${digest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !digest.enabled }),
    });
    if (res.ok) {
      setDigests((prev) =>
        prev.map((d) => (d.id === digest.id ? { ...d, enabled: !d.enabled } : d))
      );
    }
  }

  async function handleSendNow(digestId: string) {
    if (!orgId) return;
    await fetch(`/api/orgs/${orgId}/reports/${digestId}/send`, { method: 'POST' });
    // Visual feedback
    alert('Report sent (mock)');
  }

  async function handleDelete(digestId: string) {
    if (!orgId) return;
    await fetch(`/api/orgs/${orgId}/reports/${digestId}`, { method: 'DELETE' });
    setDigests((prev) => prev.filter((d) => d.id !== digestId));
  }

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Scheduled Reports</h1>
            <p className="text-slate-500 mt-1">
              Automate report delivery to your team via email or Slack.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scheduled Report</DialogTitle>
                <DialogDescription>Configure automated report delivery.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Report Name</label>
                  <Input
                    placeholder="Weekly Cost Summary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Linked Dashboard (optional)</label>
                  <Select value={formDashboardId} onValueChange={setFormDashboardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dashboard..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {dashboards.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Frequency</label>
                  <Select value={formFrequency} onValueChange={setFormFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email Recipients (comma-separated)</label>
                  <Input
                    placeholder="alice@company.com, bob@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Slack Webhook URL (optional)</label>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={formSlack}
                    onChange={(e) => setFormSlack(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !formName.trim()}>
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Report
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

        {/* Reports Table */}
        {!loading && digests.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Frequency</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Channels</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Next Send</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {digests.map((digest) => (
                    <tr key={digest.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm text-white font-medium">{digest.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={frequencyColors[digest.frequency] ?? 'secondary'}>
                          {digest.frequency}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {digest.channels?.email?.length ? (
                            <Mail className="w-4 h-4 text-cyan-400" />
                          ) : null}
                          {digest.channels?.slackWebhook ? (
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {digest.nextSendAt
                            ? new Date(digest.nextSendAt).toLocaleDateString()
                            : 'Not scheduled'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(digest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            digest.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                              digest.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendNow(digest.id)}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" /> Send Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(digest.id)}
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
          </div>
        )}

        {/* Empty State */}
        {!loading && digests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <FileBarChart className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No scheduled reports</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Set up automated reports to keep your team informed about cloud spending.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Report
            </Button>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
