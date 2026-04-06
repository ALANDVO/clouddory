'use client';

import { useState, useEffect } from 'react';
import { Server, Search, Cloud, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ModuleGate from '@/components/shared/ModuleGate';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAppStore } from '@/stores/app-store';

interface ResourceRow {
  service: string;
  provider: string;
  region: string;
  team: string;
  environment: string;
  cost: number;
  records: number;
}

export default function ResourceInventoryPage() {
  const { currentOrgId } = useAppStore();
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof ResourceRow>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!currentOrgId) return;
    async function fetchResources() {
      try {
        const res = await fetch(`/api/orgs/${currentOrgId}/spend?group_by=service`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Build resource rows from records
        const serviceMap = new Map<string, ResourceRow>();
        for (const record of (data.records || [])) {
          // Provider comes from 'source' field in the API
          const provider = record.source || record.provider || 'unknown';
          const key = `${record.service}`;
          const existing = serviceMap.get(key);
          if (existing) {
            existing.cost += parseFloat(record.cost) || 0;
            existing.records += 1;
          } else {
            serviceMap.set(key, {
              service: record.service || 'Unknown',
              provider: provider,
              region: record.region || 'global',
              team: record.team || 'Unallocated',
              environment: record.environment || 'unknown',
              cost: parseFloat(record.cost) || 0,
              records: 1,
            });
          }
        }
        setResources(Array.from(serviceMap.values()));
      } catch {
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [currentOrgId]);

  const handleSort = (key: keyof ResourceRow) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = resources
    .filter((r) =>
      search === '' ||
      r.service.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const totalCost = resources.reduce((s, r) => s + r.cost, 0);

  const providerColor: Record<string, string> = {
    aws: 'bg-amber-500/10 text-amber-400',
    gcp: 'bg-blue-500/10 text-blue-400',
    azure: 'bg-sky-500/10 text-sky-400',
    datadog: 'bg-purple-500/10 text-purple-400',
    snowflake: 'bg-blue-500/10 text-blue-400',
    openai: 'bg-emerald-500/10 text-emerald-400',
    anthropic: 'bg-orange-500/10 text-orange-400',
    kubernetes: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Resource Inventory</h1>
            <p className="text-slate-500 mt-1">All cloud resources across your connected providers.</p>
          </div>
          <div className="flex gap-2 text-sm text-slate-400">
            <span>{resources.length} resources</span>
            <span>·</span>
            <span>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-6 h-6 text-cyan-500" />
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Server className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">No resources discovered</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Connect a cloud account and sync cost data to see your resources here.
            </p>
            <Link href="/settings/cloud-accounts">
              <Button>Connect Cloud Account</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by service, provider, or region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-navy-900/50">
                    {[
                      { key: 'service', label: 'Service' },
                      { key: 'provider', label: 'Provider' },
                      { key: 'region', label: 'Region' },
                      { key: 'team', label: 'Team' },
                      { key: 'environment', label: 'Environment' },
                      { key: 'cost', label: 'Total Cost' },
                      { key: 'records', label: 'Records' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                        onClick={() => handleSort(col.key as keyof ResourceRow)}
                      >
                        {col.label}
                        {sortKey === col.key && (
                          <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const slug = r.service.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-cyan-500/[0.03] transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/costs/${encodeURIComponent(slug)}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">{r.service}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={providerColor[r.provider] || 'bg-slate-500/10 text-slate-400'}>
                            {r.provider.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{r.region}</td>
                        <td className="px-4 py-3 text-slate-400">{r.team}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{r.environment}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-white">
                          ${r.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{r.records}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ModuleGate>
  );
}
