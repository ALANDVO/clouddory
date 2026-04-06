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
  Plug,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Connector type definitions                                        */
/* ------------------------------------------------------------------ */

interface ConnectorType {
  id: string;
  name: string;
  category: string;
  color: string;      // tailwind bg class
  textColor: string;  // tailwind text class
  letter: string;     // icon letter
  configFields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

interface ConnectorRecord {
  id: string;
  name: string;
  providerType: string;
  status: string;
  lastSyncedAt: string | null;
  config: Record<string, unknown>;
  createdAt: string;
}

const CLOUD_FIELDS: ConfigField[] = [
  { key: 'roleArn', label: 'Role ARN / Service Account / Client ID', type: 'text', placeholder: 'arn:aws:iam::123456789:role/CloudDory', required: true },
  { key: 'externalId', label: 'External ID (optional)', type: 'text', placeholder: 'External ID' },
];

const API_KEY_FIELDS: ConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
];

const SAAS_FIELDS: ConfigField[] = [
  { key: 'apiKeyOrWebhook', label: 'API Key or Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/... or API key', required: true },
];

const K8S_FIELDS: ConfigField[] = [
  { key: 'clusterName', label: 'Cluster Name', type: 'text', placeholder: 'production-us-east-1', required: true },
  { key: 'kubeconfig', label: 'Kubeconfig', type: 'textarea', placeholder: 'Paste kubeconfig YAML here...', required: true },
];

const CONNECTOR_TYPES: ConnectorType[] = [
  // Cloud Providers
  { id: 'aws', name: 'AWS', category: 'Cloud Providers', color: 'bg-orange-500', textColor: 'text-orange-400', letter: 'A', configFields: CLOUD_FIELDS },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud Providers', color: 'bg-blue-500', textColor: 'text-blue-400', letter: 'G', configFields: CLOUD_FIELDS },
  { id: 'azure', name: 'Azure', category: 'Cloud Providers', color: 'bg-sky-500', textColor: 'text-sky-400', letter: 'Az', configFields: CLOUD_FIELDS },
  { id: 'oci', name: 'Oracle Cloud', category: 'Cloud Providers', color: 'bg-red-500', textColor: 'text-red-400', letter: 'O', configFields: CLOUD_FIELDS },
  // AI & ML
  { id: 'openai', name: 'OpenAI', category: 'AI & ML', color: 'bg-emerald-500', textColor: 'text-emerald-400', letter: 'OA', configFields: API_KEY_FIELDS },
  { id: 'anthropic', name: 'Anthropic', category: 'AI & ML', color: 'bg-amber-600', textColor: 'text-amber-400', letter: 'An', configFields: API_KEY_FIELDS },
  { id: 'bedrock', name: 'AWS Bedrock', category: 'AI & ML', color: 'bg-orange-500', textColor: 'text-orange-400', letter: 'BR', configFields: CLOUD_FIELDS },
  { id: 'vertex', name: 'Google Vertex AI', category: 'AI & ML', color: 'bg-blue-500', textColor: 'text-blue-400', letter: 'V', configFields: CLOUD_FIELDS },
  { id: 'azure_openai', name: 'Azure OpenAI', category: 'AI & ML', color: 'bg-blue-600', textColor: 'text-blue-400', letter: 'AO', configFields: [...CLOUD_FIELDS, ...API_KEY_FIELDS] },
  // Data & Analytics
  { id: 'snowflake', name: 'Snowflake', category: 'Data & Analytics', color: 'bg-blue-400', textColor: 'text-blue-300', letter: 'S', configFields: API_KEY_FIELDS },
  { id: 'databricks', name: 'Databricks', category: 'Data & Analytics', color: 'bg-red-500', textColor: 'text-red-400', letter: 'DB', configFields: API_KEY_FIELDS },
  { id: 'datadog', name: 'Datadog', category: 'Data & Analytics', color: 'bg-purple-500', textColor: 'text-purple-400', letter: 'DD', configFields: API_KEY_FIELDS },
  // Kubernetes
  { id: 'kubernetes', name: 'Kubernetes / EKS / GKE / AKS', category: 'Kubernetes', color: 'bg-blue-500', textColor: 'text-blue-400', letter: 'K8', configFields: K8S_FIELDS },
  // Collaboration
  { id: 'slack', name: 'Slack', category: 'Collaboration', color: 'bg-purple-500', textColor: 'text-purple-400', letter: 'Sl', configFields: SAAS_FIELDS },
  { id: 'jira', name: 'Jira', category: 'Collaboration', color: 'bg-blue-500', textColor: 'text-blue-400', letter: 'Ji', configFields: SAAS_FIELDS },
  { id: 'servicenow', name: 'ServiceNow', category: 'Collaboration', color: 'bg-emerald-500', textColor: 'text-emerald-400', letter: 'SN', configFields: SAAS_FIELDS },
  { id: 'teams', name: 'Microsoft Teams', category: 'Collaboration', color: 'bg-purple-600', textColor: 'text-purple-400', letter: 'MT', configFields: SAAS_FIELDS },
  { id: 'pagerduty', name: 'PagerDuty', category: 'Collaboration', color: 'bg-green-500', textColor: 'text-green-400', letter: 'PD', configFields: SAAS_FIELDS },
];

const CATEGORIES = ['Cloud Providers', 'AI & ML', 'Data & Analytics', 'Kubernetes', 'Collaboration'];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [connectors, setConnectors] = useState<ConnectorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchConnectors = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/connectors`);
      if (res.ok) {
        const data = await res.json();
        setConnectors(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const getConnectorStatus = (providerType: string): ConnectorRecord | undefined => {
    return connectors.find((c) => c.providerType === providerType);
  };

  const handleConnect = (type: ConnectorType) => {
    setSelectedType(type);
    setConfigValues({});
    setDialogOpen(true);
  };

  const handleDisconnect = async (connector: ConnectorRecord) => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/connectors/${connector.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConnectors((prev) => prev.filter((c) => c.id !== connector.id));
      }
    } catch {
      // silently handle
    }
  };

  const handleSave = async () => {
    if (!orgId || !selectedType) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedType.name,
          providerType: selectedType.id,
          config: configValues,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchConnectors();
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  const filteredTypes = CONNECTOR_TYPES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-slate-500" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Plug className="w-6 h-6 text-cyan-400" />
            Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your cloud providers, AI services, data platforms, and collaboration tools.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchConnectors()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search connectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Connector grid by category */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.filter(
            (cat) => filterCategory === 'all' || cat === filterCategory
          ).map((category) => {
            const types = filteredTypes.filter((t) => t.category === category);
            if (types.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {types.map((type) => {
                    const existing = getConnectorStatus(type.id);
                    const status = existing?.status || 'not_connected';
                    return (
                      <Card
                        key={type.id}
                        className="p-4 border border-white/5 bg-navy-900/50 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg ${type.color}/20 flex items-center justify-center`}
                              style={{ backgroundColor: `color-mix(in srgb, currentColor 15%, transparent)` }}
                            >
                              <span className={`text-sm font-bold ${type.textColor}`}>
                                {type.letter}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-white">{type.name}</h3>
                              <Badge variant="secondary" className="mt-1 text-[10px]">
                                {type.category}
                              </Badge>
                            </div>
                          </div>
                          {statusIcon(status)}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div>
                            {statusBadge(status)}
                            {existing?.lastSyncedAt && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Last synced: {new Date(existing.lastSyncedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {existing && status === 'connected' ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDisconnect(existing)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConnect(type)}
                            >
                              <Wifi className="w-3.5 h-3.5 mr-1.5" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedType && (
                <span className={`${selectedType.textColor} font-bold`}>
                  {selectedType.letter}
                </span>
              )}
              Connect {selectedType?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedType?.configFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={configValues[field.key] || ''}
                    onChange={(e) =>
                      setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={5}
                    className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configValues[field.key] || ''}
                    onChange={(e) =>
                      setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Save & Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
