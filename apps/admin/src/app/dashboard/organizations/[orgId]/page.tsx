import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MODULE_PRICES: Record<string, number> = {
  finops: 99,
  security: 149,
  intelligence: 199,
  automation: 249,
};

export default async function OrgDetailPage({
  params,
}: {
  params: { orgId: string };
}) {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, createdAt: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
      },
      cloudAccounts: {
        orderBy: { createdAt: "desc" },
      },
      feedbacks: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { costRecords: true },
      },
    },
  });

  if (!org) {
    notFound();
  }

  const totalSpend = org.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, sub) => sum + (MODULE_PRICES[sub.module] || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/organizations"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h2 className="text-2xl font-bold text-white">{org.name}</h2>
        <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-slate-300">
          {org.plan}
        </span>
      </div>

      {/* Org Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">Slug</p>
          <p className="text-white font-mono text-sm">{org.slug}</p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">Plan</p>
          <p className="text-white capitalize">{org.plan}</p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">MRR</p>
          <p className="text-[#00e5c7] font-bold text-xl">${totalSpend}</p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">Created</p>
          <p className="text-white text-sm">
            {new Date(org.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Members ({org.members.length})
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {org.members.map((member) => (
              <div
                key={member.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white">{member.user.name}</p>
                  <p className="text-xs text-slate-500">{member.user.email}</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    member.role === "owner"
                      ? "bg-amber-400/10 text-amber-400"
                      : member.role === "admin"
                      ? "bg-blue-400/10 text-blue-400"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Subscriptions ({org.subscriptions.length})
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {org.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white capitalize">{sub.module}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {sub.plan} - ${MODULE_PRICES[sub.module] || 0}/mo
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    sub.status === "active"
                      ? "bg-green-400/10 text-green-400"
                      : sub.status === "trial"
                      ? "bg-blue-400/10 text-blue-400"
                      : sub.status === "expired"
                      ? "bg-red-400/10 text-red-400"
                      : "bg-slate-400/10 text-slate-400"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
            ))}
            {org.subscriptions.length === 0 && (
              <div className="px-6 py-6 text-center text-slate-500 text-sm">
                No subscriptions
              </div>
            )}
          </div>
        </div>

        {/* Cloud Accounts */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Cloud Accounts ({org.cloudAccounts.length})
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {org.cloudAccounts.map((acct) => (
              <div
                key={acct.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white">{acct.name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {acct.provider}
                    {acct.externalId && ` - ${acct.externalId}`}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      acct.status === "active"
                        ? "bg-green-400/10 text-green-400"
                        : acct.status === "error"
                        ? "bg-red-400/10 text-red-400"
                        : "bg-slate-400/10 text-slate-400"
                    }`}
                  >
                    {acct.status}
                  </span>
                  {acct.lastSyncAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Synced {new Date(acct.lastSyncAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {org.cloudAccounts.length === 0 && (
              <div className="px-6 py-6 text-center text-slate-500 text-sm">
                No cloud accounts connected
              </div>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Recent Feedback
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {org.feedbacks.map((fb) => (
              <div key={fb.id} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{fb.userName}</span>
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">{fb.page}</span>
                  <span
                    className={`text-xs ${
                      fb.status === "new"
                        ? "text-amber-400"
                        : fb.status === "resolved"
                        ? "text-green-400"
                        : "text-slate-500"
                    }`}
                  >
                    {fb.status}
                  </span>
                </div>
              </div>
            ))}
            {org.feedbacks.length === 0 && (
              <div className="px-6 py-6 text-center text-slate-500 text-sm">
                No feedback
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Records Summary */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Cost Data</h3>
        <p className="text-slate-400">
          Total cost records: <span className="text-white font-semibold">{org._count.costRecords.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
