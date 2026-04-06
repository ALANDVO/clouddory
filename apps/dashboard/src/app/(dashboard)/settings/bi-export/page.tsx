'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Database, Terminal } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/orgs/{orgId}/spend',
    description: 'Retrieve aggregated cost data with filters for date range, provider, service, team, and environment.',
    fields: 'date, service, provider, region, team, environment, cost, currency, usage, usageUnit',
  },
  {
    method: 'GET',
    path: '/api/orgs/{orgId}/waste-scanner/results',
    description: 'List waste scan results including idle resources, rightsizing opportunities, and unused commitments.',
    fields: 'scanType, resourceId, provider, service, region, monthlyWasteCost, recommendation, severity, status',
  },
  {
    method: 'GET',
    path: '/api/orgs/{orgId}/anomalies',
    description: 'Fetch detected cost anomalies with expected vs actual cost, deviation, and severity.',
    fields: 'resourceId, provider, service, team, region, expectedCost, actualCost, deviationPct, severity, status',
  },
  {
    method: 'GET',
    path: '/api/orgs/{orgId}/commitments',
    description: 'List reservation and savings plan commitments with utilization data.',
    fields: 'provider, commitmentType, service, region, term, startDate, endDate, totalCost, usedCost, coveragePct',
  },
  {
    method: 'POST',
    path: '/api/orgs/{orgId}/query-lens/run',
    description: 'Execute custom cost queries with flexible grouping and filtering dimensions.',
    fields: 'Accepts JSON body with groupBy[], filters{}, dateRange. Returns aggregated rows.',
  },
];

export default function BiExportPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function getCurl(ep: typeof endpoints[0]) {
    const url = `https://dashboard.clouddory.com${ep.path.replace('{orgId}', orgId || 'YOUR_ORG_ID')}`;
    if (ep.method === 'GET') {
      return `curl -H "Authorization: Bearer YOUR_API_KEY" \\\n  "${url}"`;
    }
    return `curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"groupBy":["service","provider"],"dateRange":{"start":"2026-01-01","end":"2026-03-31"}}' \\\n  "${url}"`;
  }

  function copyCommand(idx: number) {
    const cmd = getCurl(endpoints[idx]);
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            BI Export & API Reference
          </CardTitle>
          <CardDescription>
            Connect your BI tools (Tableau, Looker, Power BI) using these API endpoints.
            Authenticate with an API key from Settings &gt; API Keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={ep.method === 'GET' ? 'default' : 'secondary'} className="text-[10px] font-mono">
                  {ep.method}
                </Badge>
                <code className="text-sm text-cyan-400 font-mono">{ep.path}</code>
              </div>
              <p className="text-sm text-slate-400">{ep.description}</p>

              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Schema Fields</p>
                <p className="text-xs text-slate-600 font-mono">{ep.fields}</p>
              </div>

              <div className="relative">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-navy-950 border border-white/5">
                  <Terminal className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-all flex-1">
                    {getCurl(ep)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(idx)}
                    className="shrink-0 text-slate-500 hover:text-white"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
