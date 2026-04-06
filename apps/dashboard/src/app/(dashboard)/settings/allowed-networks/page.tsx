'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, Globe } from 'lucide-react';

interface AllowedNetwork {
  id: string;
  cidr: string;
  label: string;
  createdAt: string;
}

export default function AllowedNetworksPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [networks, setNetworks] = useState<AllowedNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => { if (orgId) fetchNetworks(); }, [orgId]);

  async function fetchNetworks() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/allowed-networks`);
      if (res.ok) setNetworks(await res.json());
    } catch {} finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!cidr.trim() || !label.trim()) return;
    await fetch(`/api/orgs/${orgId}/allowed-networks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidr: cidr.trim(), label: label.trim() }),
    });
    setCidr('');
    setLabel('');
    fetchNetworks();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/orgs/${orgId}/allowed-networks?id=${id}`, { method: 'DELETE' });
    fetchNetworks();
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>IP Allowlist</CardTitle>
        <CardDescription>Restrict dashboard access to specific networks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>CIDR</Label>
            <Input value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="10.0.0.0/8" />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Office VPN" />
          </div>
          <Button onClick={handleAdd} disabled={!cidr.trim() || !label.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {networks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No networks configured. All IPs are allowed by default.
          </div>
        ) : (
          <div className="space-y-2">
            {networks.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] group">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <div>
                    <code className="text-sm text-white font-mono">{n.cidr}</code>
                    <span className="text-xs text-slate-500 ml-3">{n.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">{new Date(n.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(n.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
