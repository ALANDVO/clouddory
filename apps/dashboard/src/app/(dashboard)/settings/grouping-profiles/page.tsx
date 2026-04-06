'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, Play, Layers } from 'lucide-react';

interface GroupingProfile {
  id: string;
  name: string;
  dimensions: string[];
  createdAt: string;
}

const AVAILABLE_DIMENSIONS = ['provider', 'service', 'team', 'environment', 'region', 'source'];

export default function GroupingProfilesPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const router = useRouter();
  const [profiles, setProfiles] = useState<GroupingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { if (orgId) fetchProfiles(); }, [orgId]);

  async function fetchProfiles() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/grouping-profiles`);
      if (res.ok) setProfiles(await res.json());
    } catch {} finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!name.trim() || selected.length === 0) return;
    await fetch(`/api/orgs/${orgId}/grouping-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), dimensions: selected }),
    });
    setShowModal(false);
    setName('');
    setSelected([]);
    fetchProfiles();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this grouping profile?')) return;
    await fetch(`/api/orgs/${orgId}/grouping-profiles?id=${id}`, { method: 'DELETE' });
    fetchProfiles();
  }

  function applyProfile(p: GroupingProfile) {
    const dims = (p.dimensions as string[]).join(',');
    router.push(`/costs?groupBy=${dims}`);
  }

  function toggleDim(d: string) {
    setSelected((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grouping Profiles</CardTitle>
              <CardDescription>Save dimension grouping presets for cost analysis.</CardDescription>
            </div>
            <Button onClick={() => { setName(''); setSelected([]); setShowModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No grouping profiles saved yet.</div>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(p.dimensions as string[]).map((d) => (
                          <Badge key={d} variant="secondary" className="text-[10px] capitalize">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => applyProfile(p)}>
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Apply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-400">
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
            <DialogTitle>Create Grouping Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team + Service breakdown" />
            </div>
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_DIMENSIONS.map((d) => (
                  <label key={d} className="flex items-center gap-2 p-2 rounded-lg border border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selected.includes(d)}
                      onChange={() => toggleDim(d)}
                      className="rounded border-white/20 bg-navy-900 text-cyan-500 focus:ring-cyan-500/40"
                    />
                    <span className="text-sm text-slate-300 capitalize">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || selected.length === 0}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
