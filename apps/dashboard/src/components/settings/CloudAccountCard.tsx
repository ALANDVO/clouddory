'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Cloud, Unplug, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface CloudAccount {
  id: string;
  provider: 'aws' | 'gcp' | 'azure';
  accountName: string;
  status: 'active' | 'syncing' | 'error' | 'pending_setup' | 'pending_verification';
  lastSyncAt: string | null;
  lastError: string | null;
}

interface CloudAccountCardProps {
  account: CloudAccount;
  orgId: string;
  onDisconnected: (accountId: string) => void;
  onUpdated?: () => void;
}

const providerConfig: Record<string, { label: string; icon: string; gradient: string }> = {
  aws: { label: 'AWS', icon: 'AWS', gradient: 'from-orange-500/10 to-transparent' },
  gcp: { label: 'GCP', icon: 'GCP', gradient: 'from-blue-500/10 to-transparent' },
  azure: { label: 'Azure', icon: 'AZ', gradient: 'from-sky-500/10 to-transparent' },
};

const statusConfig: Record<
  string,
  { variant: 'success' | 'warning' | 'destructive' | 'secondary'; label: string }
> = {
  active: { variant: 'success', label: 'Active' },
  syncing: { variant: 'warning', label: 'Syncing' },
  error: { variant: 'destructive', label: 'Error' },
  pending_setup: { variant: 'secondary', label: 'Pending Setup' },
  pending_verification: { variant: 'warning', label: 'Needs Verification' },
};

export default function CloudAccountCard({
  account,
  orgId,
  onDisconnected,
  onUpdated,
}: CloudAccountCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    totalCost?: number;
    recordsUpserted?: number;
    error?: string;
  } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    currentMonthCost?: number;
    error?: string;
  } | null>(null);

  const provider = providerConfig[account.provider] || providerConfig.aws;
  const status = statusConfig[account.status] || statusConfig.active;

  const handleDisconnect = async () => {
    setDisconnecting(true);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts/${account.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to disconnect');

      onDisconnected(account.id);
    } catch {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch(
        `/api/orgs/${orgId}/cloud-accounts/${account.id}/sync`,
        { method: 'POST' }
      );
      const data = await res.json();
      setSyncResult(data);
      if (data.success && onUpdated) onUpdated();
    } catch (err) {
      setSyncResult({
        success: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudAccountId: account.id }),
      });
      const data = await res.json();
      setVerifyResult(data);
      if (data.success && onUpdated) onUpdated();
    } catch (err) {
      setVerifyResult({
        success: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className={`bg-gradient-to-br ${provider.gradient} border-white/5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center text-sm font-bold text-cyan-400">
              {provider.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{account.accountName}</p>
              <p className="text-xs text-slate-400">{provider.label}</p>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Last error display */}
        {account.status === 'error' && account.lastError && (
          <div className="mb-3 rounded-md bg-rose-500/10 border border-rose-500/20 p-2">
            <p className="text-xs text-rose-400 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {account.lastError}
            </p>
          </div>
        )}

        {/* Sync result feedback */}
        {syncResult && (
          <div
            className={`mb-3 rounded-md p-2 ${
              syncResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {syncResult.success ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Synced {syncResult.recordsUpserted} records. Total: $
                {syncResult.totalCost?.toFixed(2)}
              </p>
            ) : (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {syncResult.error}
              </p>
            )}
          </div>
        )}

        {/* Verify result feedback */}
        {verifyResult && (
          <div
            className={`mb-3 rounded-md p-2 ${
              verifyResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {verifyResult.success ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified! Current month: ${verifyResult.currentMonthCost?.toFixed(2)}
              </p>
            ) : (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {verifyResult.error}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Cloud className="w-3.5 h-3.5" />
            <span>Last sync: {formatLastSync(account.lastSyncAt)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          {/* Verify button - show for pending or error accounts */}
          {(account.status === 'pending_verification' ||
            account.status === 'error') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={verifying}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              {verifying ? (
                <LoadingSpinner className="w-3.5 h-3.5" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Verify
                </>
              )}
            </Button>
          )}

          {/* Sync button - show for active accounts */}
          {account.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              {syncing ? (
                <>
                  <LoadingSpinner className="w-3.5 h-3.5 mr-1.5" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Sync Now
                </>
              )}
            </Button>
          )}

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
          >
            {disconnecting ? (
              <LoadingSpinner className="w-3.5 h-3.5" />
            ) : (
              <>
                <Unplug className="w-3.5 h-3.5 mr-1.5" />
                Disconnect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
