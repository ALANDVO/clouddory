'use client';

import { useState, useEffect } from 'react';
import {
  Workflow,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Plug,
  Unplug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

interface Integration {
  id: string;
  platform: string;
  status: string;
  config: any;
  triggers: string[] | null;
  createdAt: string;
}

interface AccountabilityEvent {
  id: string;
  triggerType: string;
  destination: string;
  status: string;
  createdAt: string;
}

const PLATFORMS = [
  { id: 'jira', name: 'Jira', description: 'Create tickets for cost issues', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'servicenow', name: 'ServiceNow', description: 'Create incidents and changes', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'slack', name: 'Slack', description: 'Send alerts to Slack channels', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Send alerts to Teams channels', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const TRIGGERS = [
  { id: 'anomaly_detected', label: 'Anomaly Detected' },
  { id: 'budget_breach', label: 'Budget Breach' },
  { id: 'waste_found', label: 'Waste Found' },
];

export default function AccountabilityPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [activeTab, setActiveTab] = useState<'integrations' | 'events'>('integrations');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [events, setEvents] = useState<AccountabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTriggers, setSelectedTriggers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/orgs/${orgId}/accountability-push`).then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/accountability-push/events`).then((r) => r.json()),
    ])
      .then(([integ, ev]) => {
        const integArr = Array.isArray(integ) ? integ : [];
        setIntegrations(integArr);
        setEvents(Array.isArray(ev) ? ev : []);
        // Initialize triggers from existing integrations
        const triggers: Record<string, string[]> = {};
        for (const i of integArr) {
          triggers[i.platform] = Array.isArray(i.triggers) ? i.triggers : [];
        }
        setSelectedTriggers(triggers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  function getIntegration(platform: string) {
    return integrations.find((i) => i.platform === platform);
  }

  async function handleConnect(platform: string) {
    if (!orgId) return;
    const res = await fetch(`/api/orgs/${orgId}/accountability-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, triggers: selectedTriggers[platform] ?? [] }),
    });
    if (res.ok) {
      const integ = await res.json();
      setIntegrations((prev) => [...prev, integ]);
    }
  }

  async function handleDisconnect(platform: string) {
    if (!orgId) return;
    const integ = getIntegration(platform);
    if (!integ) return;
    await fetch(`/api/orgs/${orgId}/accountability-push?id=${integ.id}`, { method: 'DELETE' });
    setIntegrations((prev) => prev.filter((i) => i.id !== integ.id));
  }

  function toggleTrigger(platform: string, trigger: string) {
    setSelectedTriggers((prev) => {
      const current = prev[platform] ?? [];
      const next = current.includes(trigger)
        ? current.filter((t) => t !== trigger)
        : [...current, trigger];
      return { ...prev, [platform]: next };
    });
  }

  const tabs = [
    { id: 'integrations' as const, label: 'Integrations' },
    { id: 'events' as const, label: 'Event Log', count: events.length },
  ];

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Workflows</h1>
          <p className="text-slate-500 mt-1">
            Push cost events to external tools and track delivery status.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-navy-900 border border-white/[0.06] w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        {/* Integrations Tab */}
        {!loading && activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const integ = getIntegration(platform.id);
              const connected = !!integ;
              const triggers = selectedTriggers[platform.id] ?? [];
              return (
                <div
                  key={platform.id}
                  className="rounded-xl border border-white/[0.06] bg-navy-900 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${platform.bg}`}>
                        <Plug className={`w-5 h-5 ${platform.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-white">{platform.name}</h3>
                        <p className="text-xs text-slate-400">{platform.description}</p>
                      </div>
                    </div>
                    <Badge variant={connected ? 'success' : 'secondary'}>
                      {connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>

                  {/* Trigger checkboxes */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Triggers</p>
                    <div className="space-y-1.5">
                      {TRIGGERS.map((trigger) => (
                        <label
                          key={trigger.id}
                          className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={triggers.includes(trigger.id)}
                            onChange={() => toggleTrigger(platform.id, trigger.id)}
                            className="rounded border-white/20 bg-navy-950 text-cyan-500 focus:ring-cyan-500/40"
                          />
                          {trigger.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Connect/Disconnect */}
                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                      className="w-full text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                    >
                      <Unplug className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                      className="w-full"
                    >
                      <Plug className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Event Log Tab */}
        {!loading && activeTab === 'events' && (
          <>
            {events.length > 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-navy-900 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Timestamp</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Trigger</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Destination</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{event.triggerType.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium capitalize">
                          {event.destination}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {event.status === 'sent' ? (
                            <div className="inline-flex items-center gap-1 text-emerald-400 text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Sent
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-rose-400 text-sm">
                              <XCircle className="w-4 h-4" /> Failed
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
                  <Workflow className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">No events yet</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Events will appear here when cost alerts are pushed to connected integrations.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ModuleGate>
  );
}
