import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      orgMembers: {
        include: {
          org: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <span className="text-sm text-slate-400">{users.length} total</span>
      </div>

      {/* Search */}
      <form className="max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e27] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c7]/50 focus:ring-1 focus:ring-[#00e5c7]/50 transition-colors text-sm"
          />
        </div>
      </form>

      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Organizations</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Verified</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-white text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {user.orgMembers.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-slate-300"
                        >
                          {m.org.name}
                        </span>
                      ))}
                      {user.orgMembers.length === 0 && (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.orgMembers.length > 0 ? (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          user.orgMembers[0].role === "owner"
                            ? "bg-amber-400/10 text-amber-400"
                            : user.orgMembers[0].role === "admin"
                            ? "bg-blue-400/10 text-blue-400"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {user.orgMembers[0].role}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.emailVerified ? (
                      <span className="text-green-400 text-xs">Verified</span>
                    ) : (
                      <span className="text-slate-500 text-xs">Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
