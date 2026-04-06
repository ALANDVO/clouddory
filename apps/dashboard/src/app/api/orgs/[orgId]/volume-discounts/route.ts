import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const discounts = await prisma.volumeDiscount.findMany({
    where: { orgId },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(discounts);
}

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
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { provider, discountPct, committedAmount, startDate, endDate, notes } = body;
  if (!provider || discountPct === undefined || !committedAmount || !startDate || !endDate)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const discount = await prisma.volumeDiscount.create({
    data: {
      orgId,
      provider,
      discountPct: parseFloat(discountPct),
      committedAmount: parseFloat(committedAmount),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes || null,
    },
  });

  return NextResponse.json(discount, { status: 201 });
}
