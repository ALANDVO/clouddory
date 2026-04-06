import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; reportId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, reportId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await prisma.scheduledDigest.updateMany({
    where: { id: reportId, orgId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.frequency !== undefined && { frequency: body.frequency }),
      ...(body.channels !== undefined && { channels: body.channels }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(body.dashboardId !== undefined && { dashboardId: body.dashboardId }),
    },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.scheduledDigest.findFirst({ where: { id: reportId, orgId } });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; reportId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, reportId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.scheduledDigest.deleteMany({ where: { id: reportId, orgId } });
  return NextResponse.json({ ok: true });
}
