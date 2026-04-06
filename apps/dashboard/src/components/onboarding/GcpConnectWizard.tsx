'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface GcpConnectWizardProps {
  orgId: string;
  onComplete: () => void;
}

const GCP_COMMANDS = `# 1. Create a service account
gcloud iam service-accounts create clouddory-reader \\
  --display-name="CloudDory Reader"

# 2. Grant Viewer role on the project
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
  --member="serviceAccount:clouddory-reader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
  --role="roles/viewer"

# 3. Grant Billing Viewer role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
  --member="serviceAccount:clouddory-reader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
  --role="roles/billing.viewer"

# 4. Create and download the key file
gcloud iam service-accounts keys create clouddory-key.json \\
  --iam-account=clouddory-reader@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 5. Print the key (paste this into CloudDory)
cat clouddory-key.json`;

export default function GcpConnectWizard({ orgId, onComplete }: GcpConnectWizardProps) {
  const [copied, setCopied] = useState(false);
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GCP_COMMANDS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = GCP_COMMANDS;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!serviceAccountJson.trim()) return;

    // Validate JSON
    try {
      JSON.parse(serviceAccountJson.trim());
    } catch {
      setError('Invalid JSON. Please paste the full service account key file contents.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gcp',
          name: accountName.trim() || 'GCP Project',
          credentials: { serviceAccountJson: serviceAccountJson.trim() },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to connect GCP account');
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
              Your GCP project has been successfully linked to CloudDory.
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
          Connect GCP Project
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a read-only service account and paste the JSON key below.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="gcpAccountName">
            Account Name
          </label>
          <Input
            id="gcpAccountName"
            placeholder="e.g. Production Project"
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
            {GCP_COMMANDS}
          </pre>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="gcpJson">
            Service Account JSON
          </label>
          <textarea
            id="gcpJson"
            rows={6}
            className="flex w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
            placeholder='{"type": "service_account", ...}'
            value={serviceAccountJson}
            onChange={(e) => setServiceAccountJson(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-rose-400 text-center">{error}</p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!serviceAccountJson.trim() || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Connecting...
            </>
          ) : (
            'Connect GCP Project'
          )}
        </Button>
      </div>
    </div>
  );
}
