'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, Key, Sparkles, AlertCircle } from 'lucide-react';

interface AiKey {
  id: string;
  provider: string;
  label: string;
  maskedKey: string;
  isActive: boolean;
  lastUsed: string | null;
  errorCount: number;
  createdAt: string;
}

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'openai', label: 'OpenAI (GPT)', color: 'bg-emerald-500/10 text-emerald-400' },
  { value: 'anthropic', label: 'Anthropic (Claude)', color: 'bg-orange-500/10 text-orange-400' },
  { value: 'openrouter', label: 'OpenRouter', color: 'bg-purple-500/10 text-purple-400' },
];

export default function AiKeysPage() {
  const [keys, setKeys] = useState<AiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState('gemini');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/ai-keys');
      if (res.ok) setKeys(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const addKey = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: newProvider, apiKey: newKey.trim(), label: newLabel.trim() || undefined }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setNewKey('');
        setNewLabel('');
        fetchKeys();
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const deleteKey = async (id: string) => {
    await fetch(`/api/settings/ai-keys?id=${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const toggleKey = async (id: string, isActive: boolean) => {
    await fetch('/api/settings/ai-keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    });
    fetchKeys();
  };

  const providerConfig = (p: string) => PROVIDERS.find((pr) => pr.value === p) || PROVIDERS[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-white">AI Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add your AI API keys to power DoryAI assistant and AI-powered features.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add AI API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs mb-1.5 block">Provider</Label>
                <Select value={newProvider} onValueChange={setNewProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">API Key</Label>
                <Input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={newProvider === 'gemini' ? 'AIzaSy...' : newProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {newProvider === 'gemini' && 'Get your key at aistudio.google.com'}
                  {newProvider === 'openai' && 'Get your key at platform.openai.com/api-keys'}
                  {newProvider === 'anthropic' && 'Get your key at console.anthropic.com'}
                  {newProvider === 'openrouter' && 'Get your key at openrouter.ai/keys'}
                </p>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Label (optional)</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Production key"
                />
              </div>
              <Button className="w-full" onClick={addKey} disabled={!newKey.trim() || saving}>
                {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : 'Add Key'}
              </Button>
              <p className="text-[10px] text-slate-500 text-center">
                Keys are encrypted with AES-256-CBC before storage. CloudDory never transmits your keys to anyone.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner className="w-6 h-6 text-cyan-500" />
        </div>
      ) : keys.length === 0 ? (
        <Card className="border-dashed border-white/10">
          <CardContent className="p-10 text-center">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-white mb-2">No AI keys configured</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              Add an API key to enable DoryAI assistant, AI-powered recommendations, and intelligent cost analysis.
              We recommend starting with a Google Gemini key — it has a generous free tier.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const cfg = providerConfig(key.provider);
            return (
              <Card key={key.id} className="border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={key.isActive}
                          onCheckedChange={(checked) => toggleKey(key.id, checked)}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className={cfg.color}>{cfg.label}</Badge>
                          {key.label && <span className="text-sm text-white">{key.label}</span>}
                          {!key.isActive && <Badge variant="secondary">Disabled</Badge>}
                          {key.errorCount > 0 && (
                            <Badge variant="destructive" className="text-[10px]">
                              <AlertCircle className="w-3 h-3 mr-1" />{key.errorCount} errors
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{key.maskedKey}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <Card className="border-white/5">
        <CardContent className="p-5">
          <h3 className="text-sm font-display font-semibold text-white mb-2">How AI Keys Work</h3>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>1. Add one or more API keys from your preferred AI provider above.</li>
            <li>2. DoryAI will use the first active key it finds, trying each provider in order.</li>
            <li>3. If a key fails (rate limited, expired), it falls back to the next active key.</li>
            <li>4. Keys are encrypted at rest — they never leave your server unencrypted.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
