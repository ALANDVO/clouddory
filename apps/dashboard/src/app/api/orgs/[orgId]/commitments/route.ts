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
  const commitmentType = url.searchParams.get("type");
  const status = url.searchParams.get("status"); // active, expiring, expired

  const where: Prisma.CommitmentWhereInput = { orgId };
  if (provider) where.provider = provider;
  if (commitmentType) where.commitmentType = commitmentType;

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  if (status === "active") {
    where.endDate = { gte: now };
  } else if (status === "expired") {
    where.endDate = { lt: now };
  } else if (status === "expiring") {
    where.endDate = { gte: now, lte: in90Days };
  }

  try {
    const commitments = await prisma.commitment.findMany({
      where,
      orderBy: { endDate: "asc" },
      take: 500,
    });

    // Compute summary
    const allActive = await prisma.commitment.findMany({
      where: { orgId, endDate: { gte: now } },
    });

    const totalCommitted = allActive.reduce(
      (sum, c) => sum + Number(c.totalCost),
      0
    );
    const totalUsed = allActive.reduce(
      (sum, c) => sum + Number(c.usedCost),
      0
    );
    const overallUtilization =
      totalCommitted > 0
        ? Math.round((totalUsed / totalCommitted) * 10000) / 100
        : 0;

    const expiringIn90 = allActive.filter(
      (c) => c.endDate <= in90Days
    ).length;

    return NextResponse.json({
      commitments: commitments.map((c) => ({
        ...c,
        totalCost: Number(c.totalCost),
        usedCost: Number(c.usedCost),
        coveragePct: Number(c.coveragePct),
      })),
      summary: {
        totalCommitted,
        overallUtilization,
        expiringIn90Days: expiringIn90,
        activeCount: allActive.length,
      },
    });
  } catch (err) {
    console.error("Commitments API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch commitments" },
      { status: 500 }
    );
  }
}
