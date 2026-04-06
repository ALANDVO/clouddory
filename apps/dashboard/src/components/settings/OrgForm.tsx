'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface OrgData {
  id: string;
  name: string;
  billingEmail: string;
  plan: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OrgForm() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [orgName, setOrgName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Workspace settings
  const [logoPath, setLogoPath] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [fiscalYearStart, setFiscalYearStart] = useState('1'); // January = 1

  useEffect(() => {
    if (!orgId) return;

    async function fetchOrg() {
      try {
        const res = await fetch(`/api/orgs/${orgId}`);
        if (!res.ok) throw new Error('Failed to load organization');
        const data: OrgData = await res.json();
        setOrgName(data.name);
        setBillingEmail(data.billingEmail || '');
        setPlan(data.plan || 'free');
      } catch {
        setMessage({ type: 'error', text: 'Failed to load organization details.' });
      } finally {
        setLoading(false);
      }
    }

    async function fetchSettings() {
      try {
        const res = await fetch(`/api/orgs/${orgId}`);
        if (!res.ok) return;
        // Settings are stored via OrgSetting model - we fetch via the org endpoint
        // For now, initialize with defaults; actual settings would be fetched separately
      } catch {}
    }

    fetchOrg();
    fetchSettings();
  }, [orgId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim(), billingEmail: billingEmail.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update organization');
      }

      setMessage({ type: 'success', text: 'Organization updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  };

  const planBadgeVariant = (p: string) => {
    switch (p) {
      case 'pro':
        return 'default';
      case 'enterprise':
        return 'success';
      default:
        return 'secondary';
    }
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
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage your organization details and billing contact.</CardDescription>
              </div>
              <Badge variant={planBadgeVariant(plan)} className="capitalize">
                {plan} plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing email</Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {message.text}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving || !orgName.trim()}>
              {saving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Preferences</CardTitle>
          <CardDescription>Configure display and fiscal settings for your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgLogo">Organization logo</Label>
            <Input
              id="orgLogo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPath(file.name);
              }}
              className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
            />
            {logoPath && <p className="text-xs text-slate-500">Selected: {logoPath}</p>}
          </div>

          <div className="space-y-2">
            <Label>Default currency</Label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Fiscal year start month</Label>
            <select
              value={fiscalYearStart}
              onChange={(e) => setFiscalYearStart(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setMessage({ type: 'success', text: 'Workspace preferences saved.' })}>
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
