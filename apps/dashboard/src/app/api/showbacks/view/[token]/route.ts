import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public endpoint - no auth required
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const showback = await prisma.showback.findUnique({
    where: { token },
    include: {
      org: { select: { name: true } },
    },
  });

  if (!showback) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch team-scoped cost records
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const costRecords = await prisma.costRecord.findMany({
    where: {
      orgId: showback.orgId,
      team: showback.team,
      date: { gte: thirtyDaysAgo },
    },
    select: {
      date: true,
      service: true,
      cost: true,
      source: true,
    },
    orderBy: { date: "asc" },
  });

  // Aggregate by service
  const byService: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  let totalSpend = 0;

  for (const r of costRecords) {
    const cost = Number(r.cost);
    totalSpend += cost;
    byService[r.service] = (byService[r.service] ?? 0) + cost;
    const dateKey = r.date.toISOString().split("T")[0];
    byDate[dateKey] = (byDate[dateKey] ?? 0) + cost;
  }

  return NextResponse.json({
    team: showback.team,
    orgName: showback.org.name,
    totalSpend,
    byService: Object.entries(byService).map(([service, cost]) => ({ service, cost })),
    byDate: Object.entries(byDate).map(([date, cost]) => ({ date, cost })),
  });
}
