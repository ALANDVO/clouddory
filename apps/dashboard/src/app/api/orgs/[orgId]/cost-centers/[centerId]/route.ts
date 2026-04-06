import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; centerId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, centerId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, parentId, ownerEmail, budget } = body;

  const center = await prisma.costCenter.update({
    where: { id: centerId },
    data: {
      ...(name !== undefined && { name }),
      ...(parentId !== undefined && { parentId: parentId || null }),
      ...(ownerEmail !== undefined && { ownerEmail: ownerEmail || null }),
      ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
    },
  });

  return NextResponse.json(center);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; centerId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, centerId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.costCenter.delete({ where: { id: centerId } });
  return NextResponse.json({ ok: true });
}
