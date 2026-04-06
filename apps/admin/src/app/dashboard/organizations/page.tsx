import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
          cloudAccounts: true,
          costRecords: true,
          subscriptions: true,
        },
      },
      members: {
        where: { role: "owner" },
        include: { user: { select: { email: true, name: true } } },
        take: 1,
      },
      subscriptions: {
        where: { status: "active" },
        select: { module: true, plan: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Organizations</h2>
        <span className="text-sm text-slate-400">{orgs.length} total</span>
      </div>

      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Cloud Accounts</th>
                <th className="px-6 py-3">Subscriptions</th>
                <th className="px-6 py-3">Cost Records</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orgs.map((org) => {
                const owner = org.members[0]?.user;
                return (
                  <tr
                    key={org.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/organizations/${org.id}`}
                        className="text-white hover:text-[#00e5c7] transition-colors font-medium"
                      >
                        {org.name}
                      </Link>
                      <p className="text-xs text-slate-500">{org.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      {owner ? (
                        <div>
                          <p className="text-sm text-slate-300">{owner.name}</p>
                          <p className="text-xs text-slate-500">{owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No owner</span>
                      )}
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
                    <td className="px-6 py-4 text-slate-300">{org._count.costRecords}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orgs.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No organizations found
          </div>
        )}
      </div>
    </div>
  );
}
