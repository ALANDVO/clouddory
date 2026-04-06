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

  const centers = await prisma.costCenter.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(centers);
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
  const { name, parentId, ownerEmail, budget } = body;
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const center = await prisma.costCenter.create({
    data: {
      orgId,
      name,
      parentId: parentId || null,
      ownerEmail: ownerEmail || null,
      budget: budget ? parseFloat(budget) : null,
    },
  });

  return NextResponse.json(center, { status: 201 });
}
