import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODULE_PRICES: Record<string, number> = {
  finops: 99,
  security: 149,
  intelligence: 199,
  automation: 249,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-400/10 text-green-400",
  trial: "bg-blue-400/10 text-blue-400",
  expired: "bg-red-400/10 text-red-400",
  cancelled: "bg-slate-400/10 text-slate-400",
};

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      org: { select: { name: true, slug: true } },
    },
  });

  const activeByModule: Record<string, number> = {};
  let totalMRR = 0;

  for (const sub of subscriptions) {
    if (sub.status === "active") {
      activeByModule[sub.module] = (activeByModule[sub.module] || 0) + 1;
      totalMRR += MODULE_PRICES[sub.module] || 0;
    }
  }

  const modules = ["finops", "security", "intelligence", "automation"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Subscriptions</h2>
        <span className="text-sm text-slate-400">
          {subscriptions.length} total
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">Total MRR</p>
          <p className="text-2xl font-bold text-[#00e5c7]">
            ${totalMRR.toLocaleString()}
          </p>
        </div>
        {modules.map((mod) => (
          <div
            key={mod}
            className="bg-[#0a0e27] border border-white/5 rounded-xl p-5"
          >
            <p className="text-sm text-slate-400 mb-1 capitalize">{mod}</p>
            <p className="text-2xl font-bold text-white">
              {activeByModule[mod] || 0}
            </p>
            <p className="text-xs text-slate-500">
              ${MODULE_PRICES[mod]}/mo each
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Trial Ends</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{sub.org.name}</p>
                    <p className="text-xs text-slate-500">{sub.org.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#00e5c7]/10 text-[#00e5c7] capitalize">
                      {sub.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm capitalize">
                    {sub.plan}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        STATUS_STYLES[sub.status] || "bg-white/5 text-slate-400"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    ${MODULE_PRICES[sub.module] || 0}/mo
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {sub.trialEndsAt
                      ? new Date(sub.trialEndsAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscriptions.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No subscriptions found
          </div>
        )}
      </div>
    </div>
  );
}
