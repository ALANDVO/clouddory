'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, Pencil, Send, Mail, MessageSquare, Webhook } from 'lucide-react';

interface AlertRoute {
  id: string;
  name: string;
  type: string;
  config: Record<string, string>;
  active: boolean;
  createdAt: string;
}

const typeInfo: Record<string, { icon: typeof Mail; color: string }> = {
  email: { icon: Mail, color: 'text-blue-400 bg-blue-500/10' },
  slack: { icon: MessageSquare, color: 'text-purple-400 bg-purple-500/10' },
  webhook: { icon: Webhook, color: 'text-amber-400 bg-amber-500/10' },
};

export default function AlertRoutesPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [routes, setRoutes] = useState<AlertRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'email', config: '' });
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => { if (orgId) fetchRoutes(); }, [orgId]);

  async function fetchRoutes() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/alert-routes`);
      if (res.ok) setRoutes(await res.json());
    } catch {} finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    const configObj: Record<string, string> = {};
    if (form.type === 'email') configObj.email = form.config;
    else configObj.webhookUrl = form.config;

    await fetch(`/api/orgs/${orgId}/alert-routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.trim(), type: form.type, config: configObj }),
    });
    setShowModal(false);
    fetchRoutes();
  }

  async function toggleActive(route: AlertRoute) {
    await fetch(`/api/orgs/${orgId}/alert-routes/${route.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !route.active }),
    });
    fetchRoutes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this alert route?')) return;
    await fetch(`/api/orgs/${orgId}/alert-routes/${id}`, { method: 'DELETE' });
    fetchRoutes();
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      await fetch(`/api/orgs/${orgId}/alert-routes/${id}/test`, { method: 'POST' });
    } catch {} finally { setTesting(null); }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Routes</CardTitle>
              <CardDescription>Configure where notifications are delivered.</CardDescription>
            </div>
            <Button onClick={() => { setForm({ name: '', type: 'email', config: '' }); setShowModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No alert routes configured.</div>
          ) : (
            <div className="space-y-3">
              {routes.map((r) => {
                const ti = typeInfo[r.type] || typeInfo.webhook;
                const Icon = ti.icon;
                const configPreview = r.config?.email || r.config?.webhookUrl || '-';
                return (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ti.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{r.name}</p>
                          <Badge variant="outline" className="text-[10px] capitalize">{r.type}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[300px]">{configPreview}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTest(r.id)}
                        disabled={testing === r.id}
                        className="text-slate-400 hover:text-cyan-400"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Alert Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering Slack" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
              >
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{form.type === 'email' ? 'Email address' : form.type === 'slack' ? 'Slack Webhook URL' : 'Webhook URL'}</Label>
              <Input
                value={form.config}
                onChange={(e) => setForm({ ...form, config: e.target.value })}
                placeholder={form.type === 'email' ? 'alerts@company.com' : 'https://hooks.slack.com/...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim() || !form.config.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
