import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any = {};
  try { body = await request.json(); } catch { /* no body is ok */ }

  // Accept threshold from request, default 20%
  const threshold = body.threshold ?? 20;

  try {
    // STEP 1: Delete existing open anomalies — fresh detection replaces old ones
    await prisma.anomaly.deleteMany({
      where: { orgId, status: "open" },
    });

    // STEP 2: Calculate historical vs recent averages
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [historicalRecords, recentRecords] = await Promise.all([
      prisma.costRecord.groupBy({
        by: ["service", "source", "region"],
        where: { orgId, date: { gte: thirtyDaysAgo, lt: sevenDaysAgo } },
        _avg: { cost: true },
        _count: true,
      }),
      prisma.costRecord.groupBy({
        by: ["service", "source", "region"],
        where: { orgId, date: { gte: sevenDaysAgo } },
        _avg: { cost: true },
        _count: true,
      }),
    ]);

    const historicalMap = new Map<string, number>();
    for (const h of historicalRecords) {
      historicalMap.set(`${h.source}|${h.service}|${h.region ?? ""}`, h._avg.cost?.toNumber() ?? 0);
    }

    // STEP 3: Detect anomalies — one per service (deduplicated)
    const seen = new Set<string>();
    const newAnomalies: any[] = [];

    for (const r of recentRecords) {
      const key = `${r.source}|${r.service}`;
      if (seen.has(key)) continue;

      const fullKey = `${r.source}|${r.service}|${r.region ?? ""}`;
      const historical = historicalMap.get(fullKey);
      if (!historical || historical === 0) continue;

      const recent = r._avg.cost?.toNumber() ?? 0;
      const deviation = ((recent - historical) / historical) * 100;

      if (deviation > threshold) {
        seen.add(key);
        let severity: string;
        if (deviation > 200) severity = "critical";
        else if (deviation > 100) severity = "high";
        else if (deviation > 50) severity = "medium";
        else severity = "low";

        newAnomalies.push({
          orgId,
          resourceId: `${r.source}-${r.service.toLowerCase().replace(/\s+/g, "-")}`,
          provider: r.source,
          service: r.service,
          region: r.region || null,
          expectedCost: Math.round(historical * 100) / 100,
          actualCost: Math.round(recent * 100) / 100,
          deviationPct: Math.round(deviation * 100) / 100,
          severity,
          status: "open",
        });
      }
    }

    if (newAnomalies.length > 0) {
      await prisma.anomaly.createMany({ data: newAnomalies });
    }

    return NextResponse.json({
      message: "Detection completed",
      anomaliesFound: newAnomalies.length,
      threshold,
    });
  } catch (err) {
    console.error("Anomaly detection error:", err);
    return NextResponse.json({ error: "Failed to run detection" }, { status: 500 });
  }
}
