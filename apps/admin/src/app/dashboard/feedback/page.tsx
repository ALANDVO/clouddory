import { prisma } from "@/lib/prisma";
import FeedbackTable from "./feedback-table";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { org?: string; status?: string; type?: string };
}) {
  const where: Record<string, unknown> = {};

  if (searchParams.org) {
    where.orgId = searchParams.org;
  }
  if (searchParams.status) {
    where.status = searchParams.status;
  }
  if (searchParams.type) {
    where.type = searchParams.type;
  }

  const [feedbacks, orgs] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        org: { select: { id: true, name: true } },
      },
    }),
    prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const statusCounts = {
    all: feedbacks.length,
    new: feedbacks.filter((f) => f.status === "new").length,
    reviewed: feedbacks.filter((f) => f.status === "reviewed").length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
    archived: feedbacks.filter((f) => f.status === "archived").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Feedback</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-amber-400">{statusCounts.new} new</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-400">{statusCounts.reviewed} reviewed</span>
          <span className="text-slate-500">|</span>
          <span className="text-green-400">{statusCounts.resolved} resolved</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form className="flex gap-3 flex-wrap">
          <select
            name="org"
            defaultValue={searchParams.org || ""}
            className="px-3 py-2 bg-[#0a0e27] border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-[#00e5c7]/50"
          >
            <option value="">All Organizations</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="px-3 py-2 bg-[#0a0e27] border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-[#00e5c7]/50"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
          <select
            name="type"
            defaultValue={searchParams.type || ""}
            className="px-3 py-2 bg-[#0a0e27] border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-[#00e5c7]/50"
          >
            <option value="">All Types</option>
            <option value="feedback">Feedback</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#00e5c7]/10 text-[#00e5c7] border border-[#00e5c7]/20 rounded-lg text-sm hover:bg-[#00e5c7]/20 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      <FeedbackTable feedbacks={feedbacks} />
    </div>
  );
}
