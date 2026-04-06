'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CloudAccountCard from '@/components/settings/CloudAccountCard';
import AwsConnectWizard from '@/components/onboarding/AwsConnectWizard';
import GcpConnectWizard from '@/components/onboarding/GcpConnectWizard';
import AzureConnectWizard from '@/components/onboarding/AzureConnectWizard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Cloud } from 'lucide-react';

interface CloudAccount {
  id: string;
  provider: 'aws' | 'gcp' | 'azure';
  accountName: string;
  status: 'active' | 'syncing' | 'error' | 'pending_setup' | 'pending_verification';
  lastSyncAt: string | null;
  lastError: string | null;
}

export default function CloudAccountsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'gcp' | 'azure' | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/cloud-accounts`);
      if (res.ok) {
        const data = await res.json();
        const list = data.accounts || data;
        // Map API field names to component names
        setAccounts(
          list.map((a: any) => ({
            id: a.id,
            provider: a.provider,
            accountName: a.name || a.accountName,
            status: a.status,
            lastSyncAt: a.lastSyncAt || a.last_sync_at || null,
            lastError: a.lastError || a.last_error || null,
          }))
        );
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDisconnected = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
  };

  const handleConnected = () => {
    setDialogOpen(false);
    setLoading(true);
    fetchAccounts();
  };

  const handleAccountUpdated = () => {
    fetchAccounts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="w-6 h-6 text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-semibold text-white">Cloud Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage connected cloud provider accounts.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedProvider(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProvider ? `Connect ${selectedProvider.toUpperCase()}` : 'Connect Cloud Account'}
              </DialogTitle>
            </DialogHeader>
            {!selectedProvider ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Choose your cloud provider:</p>
                {[
                  { id: 'aws' as const, name: 'Amazon Web Services', icon: '🟠' },
                  { id: 'gcp' as const, name: 'Google Cloud Platform', icon: '🔵' },
                  { id: 'azure' as const, name: 'Microsoft Azure', icon: '🔷' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-navy-800/30 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200 text-left"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.id.toUpperCase()}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : orgId && selectedProvider === 'aws' ? (
              <AwsConnectWizard orgId={orgId} onComplete={handleConnected} />
            ) : orgId && selectedProvider === 'gcp' ? (
              <GcpConnectWizard orgId={orgId} onComplete={handleConnected} />
            ) : orgId && selectedProvider === 'azure' ? (
              <AzureConnectWizard orgId={orgId} onComplete={handleConnected} />
            ) : null}
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors mt-2"
              >
                ← Back to provider selection
              </button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-white/10">
          <Cloud className="w-10 h-10 text-slate-500 mb-3" />
          <p className="text-sm text-slate-400 mb-4">No cloud accounts connected yet.</p>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Connect your first account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <CloudAccountCard
              key={account.id}
              account={account}
              orgId={orgId!}
              onDisconnected={handleDisconnected}
              onUpdated={handleAccountUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
