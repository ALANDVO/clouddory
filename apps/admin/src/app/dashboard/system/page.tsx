import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const [
    userCount,
    orgCount,
    subscriptionCount,
    cloudAccountCount,
    costRecordCount,
    feedbackCount,
    connectorCount,
    anomalyCount,
    notificationCount,
    wasteScanCount,
    commitmentCount,
    bugFeedback,
    cloudAccounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.subscription.count(),
    prisma.cloudAccount.count(),
    prisma.costRecord.count(),
    prisma.feedback.count(),
    prisma.connector.count(),
    prisma.anomaly.count(),
    prisma.notification.count(),
    prisma.wasteScanResult.count(),
    prisma.commitment.count(),
    prisma.feedback.findMany({
      where: { type: "bug" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { org: { select: { name: true } } },
    }),
    prisma.cloudAccount.findMany({
      orderBy: { lastSyncAt: "desc" },
      include: { org: { select: { name: true } } },
      take: 20,
    }),
  ]);

  const tables = [
    { name: "Users", count: userCount },
    { name: "Organizations", count: orgCount },
    { name: "Subscriptions", count: subscriptionCount },
    { name: "Cloud Accounts", count: cloudAccountCount },
    { name: "Cost Records", count: costRecordCount },
    { name: "Connectors", count: connectorCount },
    { name: "Anomalies", count: anomalyCount },
    { name: "Waste Scans", count: wasteScanCount },
    { name: "Commitments", count: commitmentCount },
    { name: "Notifications", count: notificationCount },
    { name: "Feedback", count: feedbackCount },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">System Health</h2>

      {/* DB Stats */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">
            Database Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/5">
          {tables.map((table) => (
            <div key={table.name} className="bg-[#0a0e27] p-4">
              <p className="text-sm text-slate-400">{table.name}</p>
              <p className="text-xl font-bold text-white mt-1">
                {table.count.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PM2 Status */}
      <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          PM2 Processes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#050816] rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white">clouddory-dashboard</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-400/10 text-green-400">
                online
              </span>
            </div>
            <p className="text-xs text-slate-500">Port 3002</p>
          </div>
          <div className="p-4 bg-[#050816] rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white">clouddory-superadmin</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-400/10 text-green-400">
                online
              </span>
            </div>
            <p className="text-xs text-slate-500">Port 3003</p>
          </div>
          <div className="p-4 bg-[#050816] rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white">clouddory-landing</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-400/10 text-slate-400">
                static
              </span>
            </div>
            <p className="text-xs text-slate-500">Apache static files</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bug Reports */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Recent Bug Reports
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {bugFeedback.map((fb) => (
              <div key={fb.id} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{fb.userName}</span>
                  <span className="text-xs text-slate-500">{fb.org.name}</span>
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
            {bugFeedback.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No bug reports
              </div>
            )}
          </div>
        </div>

        {/* Cloud Account Sync Status */}
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">
              Cloud Account Sync Status
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {cloudAccounts.map((acct) => (
              <div
                key={acct.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white">{acct.name}</p>
                  <p className="text-xs text-slate-500">
                    {acct.org.name} - {acct.provider}
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
                  <p className="text-xs text-slate-500 mt-1">
                    {acct.lastSyncAt
                      ? `Synced ${new Date(acct.lastSyncAt).toLocaleString()}`
                      : "Never synced"}
                  </p>
                  {acct.lastError && (
                    <p className="text-xs text-red-400 mt-0.5 truncate max-w-[200px]">
                      {acct.lastError}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {cloudAccounts.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No cloud accounts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
