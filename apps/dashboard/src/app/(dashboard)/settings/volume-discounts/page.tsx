'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, Pencil, Percent } from 'lucide-react';

interface VolumeDiscount {
  id: string;
  provider: string;
  discountPct: number;
  committedAmount: number;
  startDate: string;
  endDate: string;
  notes: string | null;
}

export default function VolumeDiscountsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [discounts, setDiscounts] = useState<VolumeDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VolumeDiscount | null>(null);
  const [form, setForm] = useState({
    provider: 'aws', discountPct: '', committedAmount: '', startDate: '', endDate: '', notes: '',
  });

  useEffect(() => { if (orgId) fetchDiscounts(); }, [orgId]);

  async function fetchDiscounts() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/volume-discounts`);
      if (res.ok) setDiscounts(await res.json());
    } catch {} finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ provider: 'aws', discountPct: '', committedAmount: '', startDate: '', endDate: '', notes: '' });
    setShowModal(true);
  }

  function openEdit(d: VolumeDiscount) {
    setEditing(d);
    setForm({
      provider: d.provider,
      discountPct: String(d.discountPct),
      committedAmount: String(d.committedAmount),
      startDate: d.startDate.split('T')[0],
      endDate: d.endDate.split('T')[0],
      notes: d.notes || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    const payload = { ...form };
    if (editing) {
      await fetch(`/api/orgs/${orgId}/volume-discounts/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/orgs/${orgId}/volume-discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    fetchDiscounts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this discount agreement?')) return;
    await fetch(`/api/orgs/${orgId}/volume-discounts/${id}`, { method: 'DELETE' });
    fetchDiscounts();
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Volume Discounts (EDP)</CardTitle>
              <CardDescription>Track enterprise discount programs and committed-use agreements.</CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agreement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {discounts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No volume discount agreements configured.</div>
          ) : (
            <div className="space-y-3">
              {discounts.map((d) => {
                const isActive = new Date(d.endDate) >= new Date();
                return (
                  <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white uppercase">{d.provider}</p>
                          <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">
                            {isActive ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>{Number(d.discountPct)}% discount</span>
                          <span>${Number(d.committedAmount).toLocaleString()} committed</span>
                          <span>{new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}</span>
                        </div>
                        {d.notes && <p className="text-xs text-slate-600 mt-0.5">{d.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="hover:text-rose-400">
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
            <DialogTitle>{editing ? 'Edit Agreement' : 'Add Volume Discount'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
              >
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label>Committed Amount ($)</Label>
                <Input type="number" value={form.committedAmount} onChange={(e) => setForm({ ...form, committedAmount: e.target.value })} placeholder="1000000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.discountPct || !form.committedAmount || !form.startDate || !form.endDate}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
