'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  PenLine,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  DollarSign,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ManualEntry {
  id: string;
  name: string;
  provider: string;
  service: string;
  cost: number;
  date: string;
  team: string | null;
  environment: string | null;
  notes: string | null;
  createdAt: string;
}

const PROVIDERS = ['AWS', 'GCP', 'Azure', 'Oracle Cloud', 'Datadog', 'Snowflake', 'Databricks', 'OpenAI', 'Anthropic', 'Other'];
const ENVIRONMENTS = ['Production', 'Staging', 'Development', 'Sandbox'];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ManualEntryPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ManualEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formService, setFormService] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTeam, setFormTeam] = useState('');
  const [formEnvironment, setFormEnvironment] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/manual-entries`);
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const resetForm = () => {
    setFormName('');
    setFormProvider('');
    setFormService('');
    setFormCost('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTeam('');
    setFormEnvironment('');
    setFormNotes('');
    setEditingEntry(null);
  };

  const openAdd = () => {
    resetForm();
    setFormDate(new Date().toISOString().split('T')[0]);
    setDialogOpen(true);
  };

  const openEdit = (entry: ManualEntry) => {
    setEditingEntry(entry);
    setFormName(entry.name);
    setFormProvider(entry.provider);
    setFormService(entry.service);
    setFormCost(String(entry.cost));
    setFormDate(entry.date ? entry.date.split('T')[0] : '');
    setFormTeam(entry.team || '');
    setFormEnvironment(entry.environment || '');
    setFormNotes(entry.notes || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const payload = {
        name: formName,
        provider: formProvider,
        service: formService,
        cost: parseFloat(formCost),
        date: formDate,
        team: formTeam || undefined,
        environment: formEnvironment || undefined,
        notes: formNotes || undefined,
      };

      if (editingEntry) {
        const res = await fetch(`/api/orgs/${orgId}/manual-entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          fetchEntries();
        }
      } else {
        const res = await fetch(`/api/orgs/${orgId}/manual-entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          fetchEntries();
        }
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/manual-entries/${entryId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      }
    } catch {
      // silently handle
    }
  };

  const totalCost = entries.reduce((sum, e) => sum + (e.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <PenLine className="w-6 h-6 text-cyan-400" />
            Manual Cost Entry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manually add cost records for services not yet connected via integrations.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-white/5 bg-navy-900/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Entries</p>
          <p className="text-2xl font-bold text-white mt-1">{entries.length}</p>
        </Card>
        <Card className="p-4 border border-white/5 bg-navy-900/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Manual Cost</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4 border border-white/5 bg-navy-900/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Source</p>
          <Badge variant="default" className="mt-2">manual</Badge>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-12 border border-white/5 bg-navy-900/50 text-center">
          <PenLine className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No manual entries yet.</p>
          <p className="text-sm text-slate-500 mt-1">Click &ldquo;Add Entry&rdquo; to get started.</p>
        </Card>
      ) : (
        <Card className="border border-white/5 bg-navy-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Provider</th>
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Service</th>
                  <th className="text-right text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Cost</th>
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Team</th>
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Environment</th>
                  <th className="text-right text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{entry.name}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.provider}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.service}</td>
                    <td className="px-4 py-3 text-right text-white font-mono">
                      ${Number(entry.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{entry.team || '-'}</td>
                    <td className="px-4 py-3">
                      {entry.environment ? (
                        <Badge variant="secondary">{entry.environment}</Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                          <Pencil className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add Manual Entry'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="entry-name">Name <span className="text-rose-400">*</span></Label>
              <Input
                id="entry-name"
                placeholder="e.g. Monthly SaaS License"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Provider <span className="text-rose-400">*</span></Label>
                <Select value={formProvider} onValueChange={setFormProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entry-service">Service <span className="text-rose-400">*</span></Label>
                <Input
                  id="entry-service"
                  placeholder="e.g. EC2, BigQuery"
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="entry-cost">Cost ($) <span className="text-rose-400">*</span></Label>
                <Input
                  id="entry-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formCost}
                  onChange={(e) => setFormCost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entry-date">Date <span className="text-rose-400">*</span></Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="entry-team">Team</Label>
                <Input
                  id="entry-team"
                  placeholder="e.g. Platform Engineering"
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Environment</Label>
                <Select value={formEnvironment} onValueChange={setFormEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {ENVIRONMENTS.map((env) => (
                      <SelectItem key={env} value={env.toLowerCase()}>{env}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="entry-notes">Notes</Label>
              <textarea
                id="entry-notes"
                placeholder="Optional notes about this cost..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName || !formProvider || !formService || !formCost || !formDate}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingEntry ? (
                'Update Entry'
              ) : (
                'Add Entry'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
