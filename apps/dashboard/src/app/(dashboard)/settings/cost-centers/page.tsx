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
import { FolderTree, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';

interface CostCenter {
  id: string;
  parentId: string | null;
  name: string;
  ownerEmail: string | null;
  budget: number | null;
  tagCount: number;
}

function buildTree(items: CostCenter[], parentId: string | null = null, depth = 0): (CostCenter & { depth: number })[] {
  const result: (CostCenter & { depth: number })[] = [];
  items
    .filter((i) => i.parentId === parentId)
    .forEach((item) => {
      result.push({ ...item, depth });
      result.push(...buildTree(items, item.id, depth + 1));
    });
  return result;
}

export default function CostCentersPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [form, setForm] = useState({ name: '', parentId: '', ownerEmail: '', budget: '' });

  useEffect(() => { if (orgId) fetchCenters(); }, [orgId]);

  async function fetchCenters() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/cost-centers`);
      if (res.ok) setCenters(await res.json());
    } catch {} finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', parentId: '', ownerEmail: '', budget: '' });
    setShowModal(true);
  }

  function openEdit(c: CostCenter) {
    setEditing(c);
    setForm({
      name: c.name,
      parentId: c.parentId || '',
      ownerEmail: c.ownerEmail || '',
      budget: c.budget ? String(c.budget) : '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      parentId: form.parentId || null,
      ownerEmail: form.ownerEmail.trim() || null,
      budget: form.budget || null,
    };

    if (editing) {
      await fetch(`/api/orgs/${orgId}/cost-centers/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/orgs/${orgId}/cost-centers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    fetchCenters();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this cost center?')) return;
    await fetch(`/api/orgs/${orgId}/cost-centers/${id}`, { method: 'DELETE' });
    fetchCenters();
  }

  const tree = buildTree(centers);

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost Centers</CardTitle>
              <CardDescription>Organize costs into hierarchical team ledgers.</CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cost Center
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tree.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No cost centers defined yet.</div>
          ) : (
            <div className="space-y-1">
              {tree.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  style={{ paddingLeft: `${c.depth * 24 + 12}px` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {c.depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    <FolderTree className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {c.ownerEmail && <span className="text-xs text-slate-500">{c.ownerEmail}</span>}
                        {c.budget && (
                          <Badge variant="secondary" className="text-[10px]">
                            ${Number(c.budget).toLocaleString()} budget
                          </Badge>
                        )}
                        {c.tagCount > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            {c.tagCount} tags
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Cost Center' : 'Create Cost Center'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Platform Engineering" />
            </div>
            <div className="space-y-2">
              <Label>Parent</Label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
              >
                <option value="">None (top-level)</option>
                {centers.filter((c) => c.id !== editing?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Owner email</Label>
              <Input value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Budget ($)</Label>
              <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="10000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
