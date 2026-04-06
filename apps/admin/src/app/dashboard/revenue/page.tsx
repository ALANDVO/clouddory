"use client";

import { useEffect, useState } from "react";

const MODULE_PRICES: Record<string, number> = {
  finops: 99,
  security: 149,
  intelligence: 199,
  automation: 249,
};

const MODULE_COLORS: Record<string, string> = {
  finops: "#00e5c7",
  security: "#60a5fa",
  intelligence: "#a78bfa",
  automation: "#fbbf24",
};

interface SubData {
  module: string;
  plan: string;
  status: string;
  createdAt: string;
}

export default function RevenuePage() {
  const [subs, setSubs] = useState<SubData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => {
        setSubs(data.subscriptions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading revenue data...</div>
      </div>
    );
  }

  const activeSubs = subs.filter((s) => s.status === "active");

  const totalMRR = activeSubs.reduce(
    (sum, s) => sum + (MODULE_PRICES[s.module] || 0),
    0
  );
  const projectedARR = totalMRR * 12;

  const byModule: Record<string, { count: number; revenue: number }> = {};
  for (const mod of Object.keys(MODULE_PRICES)) {
    const modSubs = activeSubs.filter((s) => s.module === mod);
    byModule[mod] = {
      count: modSubs.length,
      revenue: modSubs.length * MODULE_PRICES[mod],
    };
  }

  const byPlan: Record<string, { count: number; revenue: number }> = {};
  for (const sub of activeSubs) {
    if (!byPlan[sub.plan]) byPlan[sub.plan] = { count: 0, revenue: 0 };
    byPlan[sub.plan].count++;
    byPlan[sub.plan].revenue += MODULE_PRICES[sub.module] || 0;
  }

  const maxRevenue = Math.max(
    ...Object.values(byModule).map((m) => m.revenue),
    1
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-1">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold text-[#00e5c7]">
            ${totalMRR.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-1">Projected ARR</p>
          <p className="text-3xl font-bold text-blue-400">
            ${projectedARR.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-purple-400">
            {activeSubs.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Module - Bar Chart */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Revenue by Module
          </h3>
          <div className="space-y-4">
            {Object.entries(byModule).map(([mod, data]) => (
              <div key={mod}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 capitalize">
                    {mod}
                  </span>
                  <span className="text-sm text-white font-medium">
                    ${data.revenue.toLocaleString()}/mo ({data.count}{" "}
                    {data.count === 1 ? "sub" : "subs"})
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${(data.revenue / maxRevenue) * 100}%`,
                      backgroundColor: MODULE_COLORS[mod] || "#00e5c7",
                      minWidth: data.revenue > 0 ? "8px" : "0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Revenue by Plan Tier
          </h3>
          {Object.keys(byPlan).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(byPlan).map(([plan, data]) => (
                <div
                  key={plan}
                  className="flex items-center justify-between p-4 bg-[#050816] rounded-lg border border-white/5"
                >
                  <div>
                    <p className="text-white capitalize font-medium">{plan}</p>
                    <p className="text-xs text-slate-500">
                      {data.count} {data.count === 1 ? "subscription" : "subscriptions"}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#00e5c7]">
                    ${data.revenue.toLocaleString()}/mo
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              No active subscriptions
            </div>
          )}
        </div>
      </div>

      {/* Module Pricing Reference */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Module Pricing Reference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(MODULE_PRICES).map(([mod, price]) => (
            <div
              key={mod}
              className="p-4 bg-[#050816] rounded-lg border border-white/5 text-center"
            >
              <p className="text-sm text-slate-400 capitalize mb-1">{mod}</p>
              <p className="text-xl font-bold text-white">${price}</p>
              <p className="text-xs text-slate-500">per month</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
