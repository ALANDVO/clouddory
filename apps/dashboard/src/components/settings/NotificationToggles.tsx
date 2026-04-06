'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertTriangle, Lightbulb, RefreshCcw, BarChart3 } from 'lucide-react';

interface NotificationPreferences {
  [eventType: string]: {
    email: boolean;
    slack: boolean;
  };
}

const eventTypes = [
  {
    key: 'anomalies',
    label: 'Anomalies',
    description: 'Cost spikes and unusual usage patterns',
    icon: AlertTriangle,
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    description: 'New savings opportunities detected',
    icon: Lightbulb,
  },
  {
    key: 'sync_errors',
    label: 'Sync Errors',
    description: 'Cloud account sync failures',
    icon: RefreshCcw,
  },
  {
    key: 'weekly_report',
    label: 'Weekly Report',
    description: 'Summary of costs and trends',
    icon: BarChart3,
  },
];

const channels = ['email', 'slack'] as const;

const defaultPrefs: NotificationPreferences = {
  anomalies: { email: true, slack: false },
  recommendations: { email: true, slack: false },
  sync_errors: { email: true, slack: false },
  weekly_report: { email: true, slack: false },
};

export default function NotificationToggles() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    async function fetchPrefs() {
      try {
        const res = await fetch(`/api/orgs/${orgId}/notification-preferences`);
        if (res.ok) {
          const data = await res.json();
          setPrefs((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, [orgId]);

  const handleToggle = async (eventType: string, channel: 'email' | 'slack', value: boolean) => {
    const key = `${eventType}.${channel}`;
    setSaving(key);

    const updatedPrefs = {
      ...prefs,
      [eventType]: {
        ...prefs[eventType],
        [channel]: value,
      },
    };
    setPrefs(updatedPrefs);

    try {
      await fetch(`/api/orgs/${orgId}/notification-preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, channel, enabled: value }),
      });
    } catch {
      // Revert on error
      setPrefs(prefs);
    } finally {
      setSaving(null);
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
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which events you want to be notified about and how.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Event
                </th>
                {channels.map((ch) => (
                  <th
                    key={ch}
                    className="pb-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider w-24"
                  >
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {eventTypes.map((event) => (
                <tr key={event.key}>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shrink-0">
                        <event.icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <Label className="text-sm text-white font-medium">
                          {event.label}
                        </Label>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  {channels.map((ch) => (
                    <td key={ch} className="py-4 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={prefs[event.key]?.[ch] ?? false}
                          onCheckedChange={(val) => handleToggle(event.key, ch, val)}
                          disabled={saving === `${event.key}.${ch}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
