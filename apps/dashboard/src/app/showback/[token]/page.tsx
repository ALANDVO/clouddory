'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ShowbackData {
  team: string;
  orgName: string;
  totalSpend: number;
  byService: { service: string; cost: number }[];
  byDate: { date: string; cost: number }[];
}

export default function PublicShowbackPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShowbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/showbacks/view/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Showback Not Found</h1>
          <p className="text-slate-400">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">CD</span>
            </div>
            <span className="font-display text-lg font-bold">CloudDory</span>
          </div>
          <span className="text-sm text-slate-500">{data.orgName}</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Team heading + Total */}
        <div>
          <h1 className="text-3xl font-display font-bold">{data.team}</h1>
          <p className="text-slate-400 mt-1">Team spend overview (last 30 days)</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/10">
              <DollarSign className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Spend</p>
              <p className="text-3xl font-display font-bold">${data.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spend by Service */}
          <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-5">
            <h3 className="font-display font-semibold text-white mb-4">Spend by Service</h3>
            {data.byService.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byService.sort((a, b) => b.cost - a.cost).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey="service" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                  />
                  <Bar dataKey="cost" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No data</div>
            )}
          </div>

          {/* Spend Over Time */}
          <div className="rounded-xl border border-white/[0.06] bg-navy-900 p-5">
            <h3 className="font-display font-semibold text-white mb-4">Spend Over Time</h3>
            {data.byDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.byDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#06b6d4"
                    fill="url(#showbackGrad)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="showbackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No data</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-600 pt-8 border-t border-white/5">
          Powered by CloudDory -- Cloud Cost Optimization Platform
        </div>
      </main>
    </div>
  );
}
