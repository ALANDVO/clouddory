import { prisma } from "@/lib/prisma";
import Link from "next/link";

const MODULE_PRICES: Record<string, number> = {
  finops: 99,
  security: 149,
  intelligence: 199,
  automation: 249,
};

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const [
    totalOrgs,
    totalUsers,
    activeSubscriptions,
    allActiveSubscriptions,
    recentUsers,
    recentFeedback,
    orgsWithCounts,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.findMany({ where: { status: "active" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        orgMembers: {
          include: { org: { select: { name: true } } },
        },
      },
    }),
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        org: { select: { name: true } },
      },
    }),
    prisma.organization.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            cloudAccounts: true,
            subscriptions: true,
            costRecords: true,
          },
        },
        subscriptions: {
          where: { status: "active" },
          select: { module: true, plan: true },
        },
      },
    }),
  ]);

  const totalMRR = allActiveSubscriptions.reduce((sum, sub) => {
    return sum + (MODULE_PRICES[sub.module] || 0);
  }, 0);

  const cards = [
    { label: "Total MRR", value: `$${totalMRR.toLocaleString()}`, color: "text-[#00e5c7]" },
    { label: "Organizations", value: totalOrgs.toString(), color: "text-blue-400" },
    { label: "Total Users", value: totalUsers.toString(), color: "text-purple-400" },
    { label: "Active Subscriptions", value: activeSubscriptions.toString(), color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0a0e27] border border-white/5 rounded-xl p-6"
          >
            <p className="text-sm text-slate-400 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Orgs Table */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Organizations</h3>
          <Link
            href="/dashboard/organizations"
            className="text-sm text-[#00e5c7] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Cloud Accounts</th>
                <th className="px-6 py-3">Subscriptions</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orgsWithCounts.map((org) => (
                <tr key={org.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/organizations/${org.id}`}
                      className="text-white hover:text-[#00e5c7] transition-colors"
                    >
                      {org.name}
                    </Link>
                    <p className="text-xs text-slate-500">{org.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-slate-300">
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{org._count.members}</td>
                  <td className="px-6 py-4 text-slate-300">{org._count.cloudAccounts}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {org.subscriptions.map((sub) => (
                        <span
                          key={sub.module}
                          className="px-2 py-0.5 text-xs rounded-full bg-[#00e5c7]/10 text-[#00e5c7]"
                        >
                          {sub.module}
                        </span>
                      ))}
                      {org.subscriptions.length === 0 && (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Signups</h3>
            <Link
              href="/dashboard/users"
              className="text-sm text-[#00e5c7] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {user.orgMembers.map((m) => m.org.name).join(", ") || "No org"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Feedback</h3>
            <Link
              href="/dashboard/feedback"
              className="text-sm text-[#00e5c7] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentFeedback.map((fb) => (
              <div key={fb.id} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{fb.userName}</span>
                    <span className="text-xs text-slate-500">{fb.org.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      fb.type === "bug"
                        ? "bg-red-400/10 text-red-400"
                        : fb.type === "feature_request"
                        ? "bg-blue-400/10 text-blue-400"
                        : "bg-amber-400/10 text-amber-400"
                    }`}
                  >
                    {fb.type}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">{fb.message}</p>
                <p className="text-xs text-slate-500 mt-1">{fb.page}</p>
              </div>
            ))}
            {recentFeedback.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No feedback yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
