'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  maxSpend: string | null;
  maxAccounts: number;
  features: string[];
  isActive: boolean;
  version: number;
  updatedAt: string;
}

interface CustomerPrice {
  id: string;
  orgId: string;
  planSlug: string;
  lockedPrice: number;
  lockedVersion: number;
  lockedAt: string;
  expiresAt: string | null;
  isGrandfathered: boolean;
  org: { name: string; slug: string };
}

export default function PricingAdmin({
  initialPlans,
  initialCustomerPricing,
}: {
  initialPlans: Plan[];
  initialCustomerPricing: CustomerPrice[];
}) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [customerPricing] = useState<CustomerPrice[]>(initialCustomerPricing);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editAccounts, setEditAccounts] = useState(0);
  const [editSpend, setEditSpend] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<{ plan: string; oldPrice: number; newPrice: number; date: string }[]>([]);

  const startEdit = (plan: Plan) => {
    setEditing(plan.id);
    setEditPrice(plan.basePrice);
    setEditAccounts(plan.maxAccounts);
    setEditSpend(plan.maxSpend || '');
    setMessage(null);
  };

  const saveEdit = async (planId: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          basePrice: editPrice,
          maxAccounts: editAccounts,
          maxSpend: editSpend,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? { ...p, basePrice: editPrice, maxAccounts: editAccounts, maxSpend: editSpend, version: data.plan.version }
              : p
          )
        );
        if (data.priceChanged) {
          const plan = plans.find((p) => p.id === planId);
          setHistory((prev) => [
            { plan: plan?.name || '', oldPrice: plan?.basePrice || 0, newPrice: editPrice, date: new Date().toISOString() },
            ...prev,
          ]);
        }
        setMessage(data.message);
        setEditing(null);
      } else {
        setMessage(data.error || 'Failed to update');
      }
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const fmtPrice = (n: number) => (n === 0 ? 'Custom' : `$${n.toLocaleString()}/yr`);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Pricing Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Change pricing anytime. Existing customers stay on their locked-in price until their contract expires.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditing = editing === plan.id;
          const grandfatheredCount = customerPricing.filter(
            (cp) => cp.planSlug === plan.slug && cp.isGrandfathered
          ).length;

          return (
            <div
              key={plan.id}
              className="rounded-xl border border-white/10 bg-[#0a0e27] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {plan.name}
                  </h3>
                  <span className="text-xs text-slate-500">v{plan.version} · {plan.slug}</span>
                </div>
                {plan.basePrice > 0 && !isEditing && (
                  <button
                    onClick={() => startEdit(plan)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-cyan-400 hover:bg-white/10 transition-colors"
                  >
                    Edit Price
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Annual Price ($)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-white/10 bg-[#050816] px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Max Cloud Spend</label>
                      <input
                        type="text"
                        value={editSpend}
                        onChange={(e) => setEditSpend(e.target.value)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-[#050816] px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="500K"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Max Accounts</label>
                      <input
                        type="number"
                        value={editAccounts}
                        onChange={(e) => setEditAccounts(parseInt(e.target.value) || 0)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-[#050816] px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      />
                    </div>
                  </div>

                  {editPrice !== plan.basePrice && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        Price change: {fmtPrice(plan.basePrice)} → {fmtPrice(editPrice)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {grandfatheredCount > 0
                          ? `${grandfatheredCount} existing customer(s) will stay on ${fmtPrice(plan.basePrice)}.`
                          : 'No existing customers on this plan.'}
                        {' '}New signups will get the new price.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(plan.id)}
                      disabled={saving}
                      className="flex-1 h-9 rounded-lg bg-cyan-500 text-[#050816] text-sm font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setEditing(null); setMessage(null); }}
                      className="h-9 px-4 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {fmtPrice(plan.basePrice)}
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>Max cloud spend: <span className="text-white">{plan.maxSpend || 'unlimited'}</span></p>
                    <p>Max accounts: <span className="text-white">{plan.maxAccounts}</span></p>
                    <p>Grandfathered customers: <span className="text-white">{grandfatheredCount}</span></p>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-xs text-slate-500 mb-2">Features ({(plan.features as string[]).length})</p>
                    <ul className="space-y-1">
                      {(plan.features as string[]).slice(0, 5).map((f, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <span className="text-cyan-500 mt-0.5">·</span> {f}
                        </li>
                      ))}
                      {(plan.features as string[]).length > 5 && (
                        <li className="text-xs text-slate-500">+ {(plan.features as string[]).length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Grandfathered Customers */}
      <div className="rounded-xl border border-white/10 bg-[#0a0e27] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Grandfathered Customers
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers locked into a previous price. They keep their rate until contract expiration.
          </p>
        </div>
        {customerPricing.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No grandfathered customers yet. When you change pricing, existing customers will appear here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Organization</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Plan</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Locked Price</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Current Price</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Savings</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Locked At</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Expires</th>
              </tr>
            </thead>
            <tbody>
              {customerPricing.map((cp) => {
                const currentPlan = plans.find((p) => p.slug === cp.planSlug);
                const currentPrice = currentPlan?.basePrice || 0;
                const savings = currentPrice - cp.lockedPrice;
                return (
                  <tr key={cp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{cp.org.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs">
                        {cp.planSlug}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-white">{fmtPrice(cp.lockedPrice)}</td>
                    <td className="text-right px-4 py-3 font-mono text-slate-400">{fmtPrice(currentPrice)}</td>
                    <td className="text-right px-4 py-3">
                      {savings > 0 ? (
                        <span className="text-xs text-emerald-400">Saving ${savings.toLocaleString()}/yr</span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(cp.lockedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {cp.expiresAt ? new Date(cp.expiresAt).toLocaleDateString() : 'No expiry'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Price Change History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#0a0e27] p-4">
          <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Recent Changes (this session)
          </h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">{new Date(h.date).toLocaleTimeString()}</span>
                <span className="text-white font-medium">{h.plan}</span>
                <span className="text-rose-400 line-through">{fmtPrice(h.oldPrice)}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400">{fmtPrice(h.newPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          How Grandfathering Works
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li>1. When a customer signs up, their price is locked in a <code className="text-cyan-400 bg-white/5 px-1 rounded">customer_pricing</code> record.</li>
          <li>2. When you change a plan price, the plan <code className="text-cyan-400 bg-white/5 px-1 rounded">version</code> bumps. Existing customers keep their <code className="text-cyan-400 bg-white/5 px-1 rounded">locked_version</code>.</li>
          <li>3. New signups get the current (new) price.</li>
          <li>4. Grandfathered pricing expires when the customer&apos;s contract term ends (if set).</li>
          <li>5. After expiry, renewal is at the current price unless manually extended.</li>
        </ul>
      </div>
    </div>
  );
}
