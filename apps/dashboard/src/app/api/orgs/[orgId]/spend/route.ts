import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const team = url.searchParams.get("team");
  const service = url.searchParams.get("service");
  const environment = url.searchParams.get("environment");
  const region = url.searchParams.get("region");
  const dateStart = url.searchParams.get("date_start");
  const dateEnd = url.searchParams.get("date_end");
  const groupBy = url.searchParams.get("group_by");
  const source = url.searchParams.get("source");

  // Build where clause
  const where: Prisma.CostRecordWhereInput = { orgId };
  if (provider) where.source = provider;
  if (source) where.source = source;
  if (team) where.team = team;
  if (service) where.service = service;
  if (environment) where.environment = environment;
  if (region) where.region = region;
  if (dateStart || dateEnd) {
    where.date = {};
    if (dateStart) (where.date as any).gte = new Date(dateStart);
    if (dateEnd) (where.date as any).lte = new Date(dateEnd);
  }

  try {
    // Get total cost
    const aggregate = await prisma.costRecord.aggregate({
      where,
      _sum: { cost: true, usage: true },
      _count: true,
    });

    const total = aggregate._sum.cost?.toNumber() ?? 0;
    const totalUsage = aggregate._sum.usage?.toNumber() ?? 0;
    const recordCount = aggregate._count;

    // If group_by is specified, build grouped results
    let grouped: Record<string, number> | null = null;
    if (groupBy) {
      const validGroupFields = [
        "source",
        "service",
        "team",
        "environment",
        "region",
      ];
      if (validGroupFields.includes(groupBy)) {
        const groupResults = await prisma.costRecord.groupBy({
          by: [groupBy as any],
          where,
          _sum: { cost: true },
          orderBy: { _sum: { cost: "desc" } },
          take: 50,
        });
        grouped = {};
        for (const row of groupResults) {
          const key = (row as any)[groupBy] ?? "Unknown";
          grouped[key] = (row._sum.cost?.toNumber() ?? 0);
        }
      }
    }

    // Get recent records (limited)
    const records = await prisma.costRecord.findMany({
      where,
      orderBy: { date: "desc" },
      take: 200,
      select: {
        id: true,
        date: true,
        service: true,
        region: true,
        cost: true,
        source: true,
        team: true,
        environment: true,
        usage: true,
        usageUnit: true,
        model: true,
      },
    });

    return NextResponse.json({
      total,
      totalUsage,
      recordCount,
      records: records.map((r) => ({
        ...r,
        cost: r.cost.toNumber(),
        usage: r.usage?.toNumber() ?? null,
      })),
      grouped,
    });
  } catch (err) {
    console.error("Spend API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch spend data" },
      { status: 500 }
    );
  }
}
