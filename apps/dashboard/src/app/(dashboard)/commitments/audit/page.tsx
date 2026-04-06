'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

interface AuditEvent {
  id: string;
  date: string;
  commitmentName: string;
  action: string;
  actor: string;
  details: string;
}

export default function CommitmentAuditPage() {
  const { currentOrgId } = useAppStore();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${currentOrgId}/commitments/audit`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/commitments">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Commitment Audit Log</h1>
            <p className="text-slate-500 mt-1">
              Timeline of commitment purchases, modifications, and expirations.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No audit events yet</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Commitment audit events will appear here as commitments are purchased, modified, or expire.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commitment</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-slate-400 text-xs">
                      {new Date(e.date).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-white">{e.commitmentName}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={`text-[10px] uppercase ${
                        e.action === 'purchased' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        e.action === 'modified' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {e.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{e.actor}</td>
                    <td className="py-3 px-3 text-slate-400 text-xs">{e.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
