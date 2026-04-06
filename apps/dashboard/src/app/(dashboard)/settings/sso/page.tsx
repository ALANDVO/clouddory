'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ShieldCheck } from 'lucide-react';

export default function SsoSettingsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    provider: 'okta',
    entityId: '',
    ssoUrl: '',
    certificate: '',
    enabled: false,
  });

  useEffect(() => { if (orgId) fetchSso(); }, [orgId]);

  async function fetchSso() {
    try {
      const res = await fetch(`/api/orgs/${orgId}/settings/sso`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setForm({
            provider: data.provider || 'okta',
            entityId: data.entityId || '',
            ssoUrl: data.ssoUrl || '',
            certificate: data.certificate || '',
            enabled: data.enabled || false,
          });
        }
      }
    } catch {} finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/orgs/${orgId}/settings/sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'SSO configuration saved.' });
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save SSO configuration.' });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner className="w-6 h-6 text-cyan-500" /></div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Single Sign-On (SSO)
            </CardTitle>
            <CardDescription>Configure SAML-based SSO for your organization.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={form.enabled ? 'default' : 'secondary'}>
              {form.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Identity Provider</Label>
          <select
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-foreground"
          >
            <option value="okta">Okta</option>
            <option value="google_workspace">Google Workspace</option>
            <option value="azure_ad">Azure AD</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Entity ID</Label>
          <Input
            value={form.entityId}
            onChange={(e) => setForm({ ...form, entityId: e.target.value })}
            placeholder="https://your-idp.example.com/entity"
          />
        </div>
        <div className="space-y-2">
          <Label>SSO URL</Label>
          <Input
            value={form.ssoUrl}
            onChange={(e) => setForm({ ...form, ssoUrl: e.target.value })}
            placeholder="https://your-idp.example.com/sso/saml"
          />
        </div>
        <div className="space-y-2">
          <Label>Certificate (PEM)</Label>
          <Textarea
            value={form.certificate}
            onChange={(e) => setForm({ ...form, certificate: e.target.value })}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            rows={6}
            className="font-mono text-xs"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message.text}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardFooter>
    </Card>
  );
}
