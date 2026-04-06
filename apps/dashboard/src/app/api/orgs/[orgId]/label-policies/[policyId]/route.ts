import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; policyId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, policyId } = await params;

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

  const result = await prisma.labelPolicy.updateMany({
    where: { id: policyId, orgId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.requiredTags !== undefined && { requiredTags: body.requiredTags }),
      ...(body.scopeFilter !== undefined && { scopeFilter: body.scopeFilter }),
      ...(body.enforcement !== undefined && { enforcement: body.enforcement }),
    },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.labelPolicy.findFirst({ where: { id: policyId, orgId } });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; policyId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, policyId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.labelPolicy.deleteMany({ where: { id: policyId, orgId } });
  return NextResponse.json({ ok: true });
}
