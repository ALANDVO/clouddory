'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Trash2, ChevronUp, ChevronDown, Brain } from 'lucide-react';

// --- Types ---

interface AiKeyItem {
  id: string;
  provider: string;
  label: string | null;
  isActive: boolean;
  lastUsed: string | null;
  errorCount: number;
  createdAt: string;
}

interface AiModelItem {
  id: string;
  modelId: string;
  displayName: string;
  provider: string;
  enabled: boolean;
  sortOrder: number;
}

const PROVIDERS = ['gemini', 'openai', 'anthropic', 'openrouter'] as const;

function providerColor(provider: string) {
  switch (provider) {
    case 'gemini': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'openai': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'anthropic': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'openrouter': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export default function AiKeysPage() {
  // --- API Keys state ---
  const [keys, setKeys] = useState<AiKeyItem[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newProvider, setNewProvider] = useState<string>('gemini');
  const [newApiKey, setNewApiKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Models state ---
  const [models, setModels] = useState<AiModelItem[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState<string>('gemini');
  const [savingModel, setSavingModel] = useState(false);

  // --- Load data ---
  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/ai-keys');
      if (res.ok) setKeys(await res.json());
    } catch { /* ignore */ }
    setKeysLoading(false);
  }, []);

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/ai-models');
      if (res.ok) setModels(await res.json());
    } catch { /* ignore */ }
    setModelsLoading(false);
  }, []);

  useEffect(() => { loadKeys(); loadModels(); }, [loadKeys, loadModels]);

  // --- Key actions ---
  async function handleAddKey() {
    if (!newApiKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: newProvider, apiKey: newApiKey, label: newLabel || null }),
      });
      if (res.ok) {
        setShowAddKey(false);
        setNewApiKey('');
        setNewLabel('');
        loadKeys();
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDeleteKey(id: string) {
    await fetch(`/api/settings/ai-keys?id=${id}`, { method: 'DELETE' });
    loadKeys();
  }

  async function handleToggleKey(id: string, isActive: boolean) {
    await fetch('/api/settings/ai-keys', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    loadKeys();
  }

  // --- Model actions ---
  async function handleAddModel() {
    if (!newModelId.trim() || !newModelName.trim()) return;
    setSavingModel(true);
    try {
      const res = await fetch('/api/settings/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: newModelId, displayName: newModelName, provider: newModelProvider }),
      });
      if (res.ok) {
        setShowAddModel(false);
        setNewModelId('');
        setNewModelName('');
        loadModels();
      }
    } catch { /* ignore */ }
    setSavingModel(false);
  }

  async function handleDeleteModel(id: string) {
    await fetch(`/api/settings/ai-models?id=${id}`, { method: 'DELETE' });
    loadModels();
  }

  async function handleToggleModel(id: string, enabled: boolean) {
    await fetch('/api/settings/ai-models', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    loadModels();
  }

  async function handleMoveModel(id: string, direction: 'up' | 'down') {
    const idx = models.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= models.length) return;

    // Swap sort orders
    await Promise.all([
      fetch('/api/settings/ai-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: models[idx].id, sortOrder: models[swapIdx].sortOrder }),
      }),
      fetch('/api/settings/ai-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: models[swapIdx].id, sortOrder: models[idx].sortOrder }),
      }),
    ]);
    loadModels();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          AI Configuration
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage API keys and model priorities for DoryAI.
        </p>
      </div>

      {/* Section 1: API Keys */}
      <Card className="border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">API Keys</CardTitle>
            <CardDescription>Add your AI provider API keys. Keys are encrypted before storage.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddKey(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Key
          </Button>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No API keys configured. Add a key to enable DoryAI.
            </p>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-navy-800/30 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={providerColor(key.provider)}>
                      {key.provider}
                    </Badge>
                    <span className="text-sm text-slate-300">{key.label || 'Unnamed'}</span>
                    <Badge variant={key.isActive ? 'success' : 'secondary'} className="text-xs">
                      {key.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                    {key.errorCount > 0 && (
                      <span className="text-rose-400">{key.errorCount} errors</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleKey(key.id, key.isActive)}
                      className="text-xs"
                    >
                      {key.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Model Priority */}
      <Card className="border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Model Priority</CardTitle>
            <CardDescription>Models are tried in order. Move higher-priority models to the top.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddModel(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Model
          </Button>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : models.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No models configured. Default models (gemini-2.5-flash, gemini-2.0-flash) will be used.
            </p>
          ) : (
            <div className="space-y-2">
              {models.map((model, idx) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-navy-800/30 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-5 text-center">{idx + 1}</span>
                    <Badge variant="outline" className={providerColor(model.provider)}>
                      {model.provider}
                    </Badge>
                    <span className="text-sm text-slate-300 font-mono">{model.modelId}</span>
                    <span className="text-xs text-slate-500">{model.displayName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleModel(model.id, model.enabled)}
                      className="text-xs"
                    >
                      {model.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveModel(model.id, 'up')}
                      disabled={idx === 0}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveModel(model.id, 'down')}
                      disabled={idx === models.length - 1}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Key Dialog */}
      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select
                className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                placeholder="e.g. Production Gemini Key"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKey(false)}>Cancel</Button>
            <Button onClick={handleAddKey} disabled={!newApiKey.trim() || saving}>
              {saving ? <LoadingSpinner className="w-4 h-4" /> : 'Add Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog open={showAddModel} onOpenChange={setShowAddModel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add AI Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select
                className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
                value={newModelProvider}
                onChange={(e) => setNewModelProvider(e.target.value)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Model ID</Label>
              <Input
                placeholder="e.g. gemini-2.5-flash"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                placeholder="e.g. Gemini 2.5 Flash"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModel(false)}>Cancel</Button>
            <Button onClick={handleAddModel} disabled={!newModelId.trim() || !newModelName.trim() || savingModel}>
              {savingModel ? <LoadingSpinner className="w-4 h-4" /> : 'Add Model'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
