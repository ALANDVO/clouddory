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
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orgId) fetchKeys();
  }, [orgId]);

  async function fetchKeys() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/api-keys`);
      if (res.ok) setKeys(await res.json());
    } catch {} finally { setLoading(false); }
  }

  async function createKey() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        fetchKeys();
      }
    } catch {} finally { setCreating(false); }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? This action cannot be undone.')) return;
    try {
      await fetch(`/api/orgs/${orgId}/api-keys/${id}`, { method: 'DELETE' });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {}
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for programmatic access to CloudDory.</CardDescription>
            </div>
            <Button onClick={() => { setShowCreate(true); setName(''); setNewKey(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No API keys created yet. Generate one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{k.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <code className="text-xs text-slate-500 font-mono">{k.keyPrefix}...****</code>
                        <span className="text-xs text-slate-600">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                        </span>
                        {k.lastUsed && (
                          <span className="text-xs text-slate-600">
                            Last used {new Date(k.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => revokeKey(k.id)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newKey ? 'API Key Created' : 'Generate API Key'}</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 mb-2 font-medium">
                  Copy this key now. You will not be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-white bg-navy-950 px-3 py-2 rounded break-all">
                    {newKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyKey}>
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowCreate(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="key-name">Key name</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CI/CD Pipeline"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={createKey} disabled={creating || !name.trim()}>
                  {creating ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
