import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; anomalyId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, anomalyId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.anomaly.findFirst({
    where: { id: anomalyId, orgId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validStatuses = ["open", "acknowledged", "resolved"];
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.anomaly.update({
    where: { id: anomalyId },
    data: { status: body.status },
  });

  return NextResponse.json({
    ...updated,
    expectedCost: Number(updated.expectedCost),
    actualCost: Number(updated.actualCost),
    deviationPct: Number(updated.deviationPct),
  });
}
