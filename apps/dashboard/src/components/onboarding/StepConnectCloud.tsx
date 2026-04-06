'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface StepConnectCloudProps {
  orgId: string;
  onComplete: () => void;
  onSkip: () => void;
}

type Provider = 'aws' | 'gcp' | 'azure';

const providers: { id: Provider; name: string; icon: string; color: string }[] = [
  { id: 'aws', name: 'Amazon Web Services', icon: 'AWS', color: 'from-orange-500/20 to-orange-600/5' },
  { id: 'gcp', name: 'Google Cloud Platform', icon: 'GCP', color: 'from-blue-500/20 to-blue-600/5' },
  { id: 'azure', name: 'Microsoft Azure', icon: 'AZ', color: 'from-sky-500/20 to-sky-600/5' },
];

export default function StepConnectCloud({ orgId, onComplete, onSkip }: StepConnectCloudProps) {
  const [selected, setSelected] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AWS fields
  const [roleArn, setRoleArn] = useState('');

  // GCP fields
  const [serviceAccountJson, setServiceAccountJson] = useState('');

  // Azure fields
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const canSubmit = () => {
    if (!selected) return false;
    switch (selected) {
      case 'aws':
        return roleArn.trim().length > 0;
      case 'gcp':
        return serviceAccountJson.trim().length > 0;
      case 'azure':
        return tenantId.trim().length > 0 && clientId.trim().length > 0 && clientSecret.trim().length > 0;
    }
  };

  const getPayload = () => {
    switch (selected) {
      case 'aws':
        return { provider: 'aws', credentials: { roleArn: roleArn.trim() } };
      case 'gcp':
        return { provider: 'gcp', credentials: { serviceAccountJson: serviceAccountJson.trim() } };
      case 'azure':
        return {
          provider: 'azure',
          credentials: {
            tenantId: tenantId.trim(),
            clientId: clientId.trim(),
            clientSecret: clientSecret.trim(),
          },
        };
      default:
        return null;
    }
  };

  const handleConnect = async () => {
    if (!canSubmit()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload()),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to connect cloud account');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-semibold text-white">
          Connect a cloud account
        </h2>
        <p className="text-sm text-muted-foreground">
          Link your cloud provider so CloudDory can analyze your infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {providers.map((p) => (
          <Card
            key={p.id}
            className={`cursor-pointer transition-all duration-200 hover:border-cyan-500/30 ${
              selected === p.id
                ? 'border-cyan-500 bg-gradient-to-b ' + p.color + ' shadow-[0_0_20px_rgba(0,229,199,0.1)]'
                : 'hover:bg-navy-800/50'
            }`}
            onClick={() => setSelected(p.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold mb-2 ${
                  selected === p.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'
                }`}
              >
                {p.icon}
              </div>
              <span className="text-xs text-slate-300 leading-tight">{p.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected === 'aws' && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="roleArn">IAM Role ARN</Label>
            <Input
              id="roleArn"
              placeholder="arn:aws:iam::123456789012:role/CloudDoryReadAccess"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
            />
          </div>
          <div className="rounded-lg bg-navy-800/50 border border-white/5 p-4 text-xs text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">Setup instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open the AWS IAM Console and create a new role.</li>
              <li>Select &quot;Another AWS account&quot; and enter CloudDory&apos;s account ID: <code className="text-cyan-400">{process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID || 'YOUR_AWS_ACCOUNT_ID'}</code>.</li>
              <li>Attach the <code className="text-cyan-400">ReadOnlyAccess</code> managed policy.</li>
              <li>Name the role (e.g., <code className="text-cyan-400">CloudDoryReadAccess</code>) and copy the ARN above.</li>
            </ol>
          </div>
        </div>
      )}

      {selected === 'gcp' && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="gcpJson">Service Account JSON</Label>
            <textarea
              id="gcpJson"
              rows={6}
              className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
              placeholder='{"type": "service_account", ...}'
              value={serviceAccountJson}
              onChange={(e) => setServiceAccountJson(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400">
            Create a service account in your GCP project with the <code className="text-cyan-400">Viewer</code> role, then download the JSON key file and paste its contents above.
          </p>
        </div>
      )}

      {selected === 'azure' && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant ID</Label>
            <Input
              id="tenantId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID (Application ID)</Label>
            <Input
              id="clientId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Enter client secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400">
            Register an app in Azure AD, grant it <code className="text-cyan-400">Reader</code> access to your subscriptions, then enter the credentials above.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-400 text-center">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit() || loading}
          onClick={handleConnect}
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
