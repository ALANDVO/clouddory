import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    dimensions = [],
    metrics = ["cost"],
    dateStart,
    dateEnd,
    filters = {},
  } = body;

  // Build where clause
  const where: Prisma.CostRecordWhereInput = { orgId };
  if (filters.provider) where.source = filters.provider;
  if (filters.service) where.service = filters.service;
  if (filters.team) where.team = filters.team;
  if (filters.environment) where.environment = filters.environment;
  if (filters.region) where.region = filters.region;
  if (filters.source) where.source = filters.source;
  if (dateStart || dateEnd) {
    where.date = {};
    if (dateStart) (where.date as any).gte = new Date(dateStart);
    if (dateEnd) (where.date as any).lte = new Date(dateEnd);
  }

  const validDimensions = [
    "source",
    "service",
    "team",
    "environment",
    "region",
  ];
  const safeDimensions = dimensions.filter((d: string) =>
    validDimensions.includes(d)
  );

  try {
    if (safeDimensions.length === 0) {
      // No grouping — return aggregate totals
      const aggregate = await prisma.costRecord.aggregate({
        where,
        _sum: { cost: true, usage: true },
        _count: true,
      });
      return NextResponse.json({
        rows: [
          {
            cost: aggregate._sum.cost?.toNumber() ?? 0,
            usage: aggregate._sum.usage?.toNumber() ?? 0,
            count: aggregate._count,
          },
        ],
        dimensions: [],
        total: aggregate._sum.cost?.toNumber() ?? 0,
      });
    }

    // Group by dimensions
    const groupResults = await prisma.costRecord.groupBy({
      by: safeDimensions as any,
      where,
      _sum: { cost: true, usage: true },
      _count: true,
      orderBy: { _sum: { cost: "desc" } },
      take: 200,
    });

    const rows = groupResults.map((row: any) => {
      const result: Record<string, any> = {};
      for (const dim of safeDimensions) {
        result[dim] = row[dim] ?? "Unknown";
      }
      if (metrics.includes("cost"))
        result.cost = row._sum.cost?.toNumber() ?? 0;
      if (metrics.includes("usage"))
        result.usage = row._sum.usage?.toNumber() ?? 0;
      if (metrics.includes("count")) result.count = row._count;
      return result;
    });

    const total = rows.reduce(
      (sum: number, r: any) => sum + (r.cost ?? 0),
      0
    );

    return NextResponse.json({
      rows,
      dimensions: safeDimensions,
      total,
    });
  } catch (err) {
    console.error("QueryLens run error:", err);
    return NextResponse.json(
      { error: "Query execution failed" },
      { status: 500 }
    );
  }
}
