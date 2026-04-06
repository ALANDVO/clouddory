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
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const provider = url.searchParams.get("provider");

  const where: Prisma.AnomalyWhereInput = { orgId };
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (provider) where.provider = provider;

  try {
    const anomalies = await prisma.anomaly.findMany({
      where,
      orderBy: { detectedAt: "desc" },
      take: 500,
    });

    // Summary stats
    const openAnomalies = await prisma.anomaly.findMany({
      where: { orgId, status: { in: ["open", "acknowledged"] } },
    });

    const totalExtraSpend = openAnomalies.reduce(
      (sum, a) => sum + (Number(a.actualCost) - Number(a.expectedCost)),
      0
    );

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekCount = openAnomalies.filter(
      (a) => a.detectedAt >= weekAgo
    ).length;

    const avgDeviation =
      openAnomalies.length > 0
        ? openAnomalies.reduce((sum, a) => sum + Number(a.deviationPct), 0) /
          openAnomalies.length
        : 0;

    return NextResponse.json({
      anomalies: anomalies.map((a) => ({
        ...a,
        expectedCost: Number(a.expectedCost),
        actualCost: Number(a.actualCost),
        deviationPct: Number(a.deviationPct),
      })),
      summary: {
        activeCount: openAnomalies.length,
        totalExtraSpend: Math.round(totalExtraSpend * 100) / 100,
        thisWeekCount,
        avgDeviationPct: Math.round(avgDeviation * 100) / 100,
      },
    });
  } catch (err) {
    console.error("Anomalies API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch anomalies" },
      { status: 500 }
    );
  }
}
