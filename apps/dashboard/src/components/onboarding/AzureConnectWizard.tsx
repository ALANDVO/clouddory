'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface AzureConnectWizardProps {
  orgId: string;
  onComplete: () => void;
}

const AZURE_COMMANDS = `# 1. Create an app registration
az ad app create --display-name "CloudDory Reader"

# 2. Note the appId from the output, then create a service principal
az ad sp create --id <APP_ID>

# 3. Create a client secret (save the password from output)
az ad app credential reset --id <APP_ID> --years 2

# 4. Assign Reader role on your subscription
az role assignment create \\
  --assignee <APP_ID> \\
  --role "Cost Management Reader" \\
  --scope "/subscriptions/<SUBSCRIPTION_ID>"

az role assignment create \\
  --assignee <APP_ID> \\
  --role "Reader" \\
  --scope "/subscriptions/<SUBSCRIPTION_ID>"

# 5. Get your Tenant ID
az account show --query tenantId -o tsv`;

export default function AzureConnectWizard({ orgId, onComplete }: AzureConnectWizardProps) {
  const [copied, setCopied] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AZURE_COMMANDS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = AZURE_COMMANDS;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canSubmit =
    tenantId.trim().length > 0 &&
    clientId.trim().length > 0 &&
    clientSecret.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'azure',
          name: accountName.trim() || 'Azure Subscription',
          credentials: {
            tenantId: tenantId.trim(),
            clientId: clientId.trim(),
            clientSecret: clientSecret.trim(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to connect Azure account');
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-lg space-y-6">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white">Connected!</h3>
            <p className="text-sm text-slate-400 text-center">
              Your Azure subscription has been successfully linked to CloudDory.
              Cost data will begin syncing shortly.
            </p>
            <Badge variant="success">Active</Badge>
            <Button onClick={onComplete} className="mt-4">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-semibold text-white">
          Connect Azure Subscription
        </h2>
        <p className="text-sm text-muted-foreground">
          Create an app registration with read-only access, then enter the credentials below.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="azureAccountName">
            Account Name
          </label>
          <Input
            id="azureAccountName"
            placeholder="e.g. Production Subscription"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Setup Commands
            </label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={handleCopy}
            >
              {copied ? (
                <span className="text-emerald-400">Copied!</span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </Button>
          </div>
          <pre className="rounded-lg bg-navy-800/80 border border-white/5 p-4 text-xs text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap">
            {AZURE_COMMANDS}
          </pre>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-3">
          <p className="text-sm font-medium text-slate-300">Paste credentials</p>

          <div className="space-y-2">
            <label className="text-xs text-slate-400" htmlFor="azureTenantId">
              Tenant ID
            </label>
            <Input
              id="azureTenantId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400" htmlFor="azureClientId">
              Client ID (Application ID)
            </label>
            <Input
              id="azureClientId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400" htmlFor="azureClientSecret">
              Client Secret
            </label>
            <Input
              id="azureClientSecret"
              type="password"
              placeholder="Enter client secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 text-center">{error}</p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Connecting...
            </>
          ) : (
            'Connect Azure Subscription'
          )}
        </Button>
      </div>
    </div>
  );
}
