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
  const scanType = url.searchParams.get("scan_type");
  const severity = url.searchParams.get("severity");
  const provider = url.searchParams.get("provider");
  const status = url.searchParams.get("status");

  const where: Prisma.WasteScanResultWhereInput = { orgId };
  if (scanType) where.scanType = scanType;
  if (severity) where.severity = severity;
  if (provider) where.provider = provider;
  if (status) where.status = status;

  try {
    const results = await prisma.wasteScanResult.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const summary = await prisma.wasteScanResult.aggregate({
      where: { orgId, status: "open" },
      _sum: { monthlyWasteCost: true },
      _count: true,
    });

    const criticalCount = await prisma.wasteScanResult.count({
      where: { orgId, severity: "critical", status: "open" },
    });
    const highCount = await prisma.wasteScanResult.count({
      where: { orgId, severity: "high", status: "open" },
    });

    return NextResponse.json({
      results: results.map((r) => ({
        ...r,
        monthlyWasteCost: Number(r.monthlyWasteCost),
      })),
      summary: {
        totalMonthlyWaste: summary._sum.monthlyWasteCost?.toNumber() ?? 0,
        openCount: summary._count,
        criticalCount,
        highCount,
      },
    });
  } catch (err) {
    console.error("WasteScanner results error:", err);
    return NextResponse.json(
      { error: "Failed to fetch waste scan results" },
      { status: 500 }
    );
  }
}
