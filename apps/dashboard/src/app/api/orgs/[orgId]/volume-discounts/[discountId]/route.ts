import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; discountId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, discountId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { provider, discountPct, committedAmount, startDate, endDate, notes } = body;

  const discount = await prisma.volumeDiscount.update({
    where: { id: discountId },
    data: {
      ...(provider !== undefined && { provider }),
      ...(discountPct !== undefined && { discountPct: parseFloat(discountPct) }),
      ...(committedAmount !== undefined && { committedAmount: parseFloat(committedAmount) }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  return NextResponse.json(discount);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; discountId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, discountId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.volumeDiscount.delete({ where: { id: discountId } });
  return NextResponse.json({ ok: true });
}
